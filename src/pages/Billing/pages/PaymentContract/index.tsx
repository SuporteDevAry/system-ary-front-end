import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import CustomTooltipLabel from "../../../../components/CustomTooltipLabel";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import { sortTableData } from "../../../../components/CustomTable/helpers";
import CustomButton from "../../../../components/CustomButton";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { SContainerSearchAndButton, STitle } from "./styles";
import * as XLSX from "xlsx-js-style";

const INITIAL_ORDER_BY = "payment_date";
const INITIAL_ORDER: "asc" | "desc" = "desc";

const normalizeStr = (value?: string) =>
  (value ?? "")
    .toString()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const parseBrazilianDate = (dateString?: string) => {
  if (!dateString) return 0;

  const [day, month, year] = dateString.split("/").map(Number);
  if (!day || !month || !year) return 0;

  return new Date(year, month - 1, day).getTime();
};

const getNestedValue = (obj: any, path: string) =>
  path.split(".").reduce((value, key) => value?.[key], obj);

const formatIsoDateToBR = (value?: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${String(day).padStart(2, "0")}/${String(month).padStart(
    2,
    "0",
  )}/${year}`;
};

const buildExportCell = (row: IContractData, field: string) => {
  const value = getNestedValue(row, field);
  return value ?? "";
};

const buildFilterSummaryLines = (filters: SelectState) => {
  const emissionStart = formatIsoDateToBR(filters.date_start) || "99/99/9999";
  const emissionEnd = formatIsoDateToBR(filters.date_end) || "99/99/9999";
  const chargeStart = formatIsoDateToBR(filters.charge_date_start) || "99/99/9999";
  const chargeEnd = formatIsoDateToBR(filters.charge_date_end) || "99/99/9999";

  return {
    emission: `Data Emissão: ${emissionStart} até ${emissionEnd}`,
    charge: `Data Cobrança: ${chargeStart} até ${chargeEnd}`,
  };
};

export function PaymentContract() {
  const contractContext = ContractContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listContracts, setListContracts] = useState<IContractData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">(INITIAL_ORDER);
  const [orderBy, setOrderBy] = useState(INITIAL_ORDER_BY);
  const [isSelectionModal, setSelectionModal] = useState<boolean>(false);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState<boolean>(false);

  const getInitialSelectData = (): SelectState => ({
    date_start: "",
    date_end: "",
    charge_date_start: (() => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(firstDay.getDate()).padStart(2, "0")}`;
    })(),
    charge_date_end: (() => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(today.getDate()).padStart(2, "0")}`;
    })(),
    seller: "",
    buyer: "",
  });

  const [selectData, setSelectData] = useState<SelectState>(
    getInitialSelectData(),
  );

  const handleSelectionModal = () => setSelectionModal((prev) => !prev);
  const handleCloseModal = () => setSelectionModal(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await contractContext.listContracts();
      const contractsArray = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || [];
      setListContracts(contractsArray);
    } catch (error) {
      toast.error(`Erro ao tentar ler contratos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [contractContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const processedContracts = useMemo(() => {
    let processedData = [...listContracts];

    const emissionStart = selectData.date_start
      ? parseBrazilianDate(
          formatIsoDateToBR(selectData.date_start) || selectData.date_start,
        )
      : 0;
    const emissionEnd = selectData.date_end
      ? parseBrazilianDate(
          formatIsoDateToBR(selectData.date_end) || selectData.date_end,
        )
      : 0;
    const chargeStart = selectData.charge_date_start
      ? parseBrazilianDate(
          formatIsoDateToBR(selectData.charge_date_start) ||
            selectData.charge_date_start,
        )
      : 0;
    const chargeEnd = selectData.charge_date_end
      ? parseBrazilianDate(
          formatIsoDateToBR(selectData.charge_date_end) ||
            selectData.charge_date_end,
        )
      : 0;

    const sellerTerms = (selectData.seller || "")
      .split(",")
      .map((item) => normalizeStr(item))
      .filter(Boolean);
    const buyerTerms = (selectData.buyer || "")
      .split(",")
      .map((item) => normalizeStr(item))
      .filter(Boolean);

    if (searchTerm) {
      const normalizedSearchTerm = normalizeStr(searchTerm);
      processedData = processedData.filter((contract) => {
        const emissionDate = normalizeStr(contract.contract_emission_date);
        const contractNumber = normalizeStr(contract.number_contract);
        const sellerName = normalizeStr(contract.seller?.name);
        const buyerName = normalizeStr(contract.buyer?.name);
        const paymentDate = normalizeStr(contract.payment_date);
        const chargeDate = normalizeStr(contract.charge_date);

        return (
          emissionDate.includes(normalizedSearchTerm) ||
          contractNumber.includes(normalizedSearchTerm) ||
          sellerName.includes(normalizedSearchTerm) ||
          buyerName.includes(normalizedSearchTerm) ||
          paymentDate.includes(normalizedSearchTerm) ||
          chargeDate.includes(normalizedSearchTerm)
        );
      });
    }

    processedData = processedData.filter((contract) => {
      const emissionDate = parseBrazilianDate(contract.contract_emission_date);
      const paymentDate = parseBrazilianDate(contract.payment_date);
      const chargeDate = parseBrazilianDate(contract.charge_date);

      const matchEmissionStart = emissionStart ? emissionDate >= emissionStart : true;
      const matchEmissionEnd = emissionEnd ? emissionDate <= emissionEnd : true;
      const matchChargeStart = chargeStart ? chargeDate >= chargeStart : true;
      const matchChargeEnd = chargeEnd ? chargeDate <= chargeEnd : true;

      const sellerName = normalizeStr(contract.seller?.name);
      const buyerName = normalizeStr(contract.buyer?.name);
      const matchSeller =
        sellerTerms.length === 0 ||
        sellerTerms.some((term) => sellerName.includes(term));
      const matchBuyer =
        buyerTerms.length === 0 ||
        buyerTerms.some((term) => buyerName.includes(term));

      return (
        matchEmissionStart &&
        matchEmissionEnd &&
        matchChargeStart &&
        matchChargeEnd &&
        Boolean(paymentDate) &&
        matchSeller &&
        matchBuyer
      );
    });

    return processedData;
  }, [listContracts, searchTerm, selectData]);

  const displayedData = useMemo(
    () => sortTableData(processedContracts, orderBy, order),
    [processedContracts, orderBy, order],
  );

  const fetchSelectData = useCallback(async (filters: SelectState) => {
    setSelectData(filters);
    setSelectionModal(false);
    setPage(0);
  }, []);

  const handleClearFilterModal = async () => {
    const initial = getInitialSelectData();
    setSelectData(initial);
    setSelectionModal(false);
    setPage(0);
  };

  const isInitialFilter = useMemo(() => {
    const initial = getInitialSelectData();
    return (
      (selectData.date_start ?? "") === (initial.date_start ?? "") &&
      (selectData.date_end ?? "") === (initial.date_end ?? "") &&
      (selectData.charge_date_start ?? "") ===
        (initial.charge_date_start ?? "") &&
      (selectData.charge_date_end ?? "") === (initial.charge_date_end ?? "") &&
      (selectData.seller?.trim() ?? "") === "" &&
      (selectData.buyer?.trim() ?? "") === ""
    );
  }, [selectData]);

  const nameColumns: IColumn[] = useMemo(
    () => [
      {
        field: "contract_emission_date",
        header: "Data Emissão",
        width: "100px",
        sortable: true,
      },
      {
        field: "number_contract",
        header: "Contrato",
        width: "180px",
        sortable: true,
      },
      {
        field: "seller.name",
        header: "Vendedor",
        width: "200px",
      },
      {
        field: "buyer.name",
        header: "Comprador",
        width: "200px",
      },
      {
        field: "payment_date",
        header: "Dt.Vencto.",
        headerTooltip: "Data de Vencimento",
        width: "130px",
        sortable: true,
      },
      {
        field: "charge_date",
        header: "Dt.Cobrança",
        headerTooltip: "Data de Cobrança",
        width: "130px",
        sortable: true,
      },
      {
        field: "expected_receipt_date",
        header: "Dt.Prev.Recbto.",
        headerTooltip: "Data Prevista de Recebimento",
        width: "130px",
      },
    ],
    [],
  );

  const handlePrint = (): void => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const pageSize = 30;

    const headerHtml = `<tr>
        ${nameColumns
          .map(
            (col) =>
              `<th style="border:1px solid black;padding:4px;font-size:9px;">${col.header}</th>`,
          )
          .join("")}
    </tr>`;

    const allRowsHtml = displayedData.map((row) => {
      const cols = nameColumns
        .map((col) => {
          const raw = getNestedValue(row, col.field);
          const cell = String(raw ?? "")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          return `<td style="border:1px solid black;padding:4px;font-size:9px;">${cell}</td>`;
        })
        .join("");
      return `<tr>${cols}</tr>`;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Contratos por Vencimento</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 10mm; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10mm; }
            th, td { border: 1px solid black; padding: 4px; font-size: 9px; }
            th { background-color: #f0f0f0; }
            .page-break { page-break-after: always; }
            h3 { text-align: left; margin: 0 0 8px 0; }
            h2 { text-align: center; margin: 0 0 12px 0; }
            .filter-summary { text-align: center; margin: 0 0 14px 0; font-size: 12px; font-weight: bold; }
            .filter-summary div { margin: 0; line-height: 1.4; }
          </style>
        </head>
        <body>
          <h3>Ary Oleofar</h3>
          <h2>Contratos por Vencimento</h2>
          <div class="filter-summary">
            <div>${buildFilterSummaryLines(selectData).emission}</div>
            <div>${buildFilterSummaryLines(selectData).charge}</div>
          </div>
    `);

    for (let i = 0; i < allRowsHtml.length; i += pageSize) {
      const pageRows = allRowsHtml.slice(i, i + pageSize).join("");
      printWindow.document.write(`<table>`);
      printWindow.document.write(`<thead>${headerHtml}</thead>`);
      printWindow.document.write(`<tbody>${pageRows}</tbody>`);
      printWindow.document.write(`</table>`);

      if (i + pageSize < allRowsHtml.length) {
        printWindow.document.write(`<div class="page-break"></div>`);
      }
    }

    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleExportExcelStyled = () => {
    try {
      const emissionLine =
        selectData.date_start || selectData.date_end
          ? buildFilterSummaryLines(selectData).emission
          : "";
      const chargeLine = buildFilterSummaryLines(selectData).charge;
      const hasEmissionLine = emissionLine !== "";
      const headerRowIndex = hasEmissionLine ? 4 : 3;
      const dataStartRowIndex = headerRowIndex + 1;

      const exportRows = [
        ["Contratos por Vencimento"],
        ...(hasEmissionLine ? [[emissionLine]] : []),
        [chargeLine],
        [],
        nameColumns.map((col) => col.header),
        ...displayedData.map((row) =>
          nameColumns.map((col) => buildExportCell(row, col.field)),
        ),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(exportRows);
      const columnCount = nameColumns.length;

      worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } },
        ...(hasEmissionLine
          ? [{ s: { r: 1, c: 0 }, e: { r: 1, c: columnCount - 1 } }]
          : []),
        {
          s: { r: hasEmissionLine ? 2 : 1, c: 0 },
          e: { r: hasEmissionLine ? 2 : 1, c: columnCount - 1 },
        },
      ];

      worksheet["!cols"] = nameColumns.map((col) => ({
        wch: Math.max(
          12,
          Math.round(Number.parseInt(col.width || "120", 10) / 8),
        ),
      }));

      const titleStyle = {
        font: { bold: true, sz: 14, color: { rgb: "1F1F1F" } },
        fill: { patternType: "solid", fgColor: { rgb: "E7B10A" } },
        alignment: { horizontal: "center", vertical: "center" },
      };

      const filterStyle = {
        font: { bold: true, sz: 11, color: { rgb: "1F1F1F" } },
        fill: { patternType: "solid", fgColor: { rgb: "E7B10A" } },
        alignment: { horizontal: "center", vertical: "center" },
      };

      const headerStyle = {
        font: { bold: true, color: { rgb: "1F1F1F" } },
        fill: { patternType: "solid", fgColor: { rgb: "E7B10A" } },
        border: {
          top: { style: "thin", color: { rgb: "FFFFFF" } },
          bottom: { style: "thin", color: { rgb: "FFFFFF" } },
          left: { style: "thin", color: { rgb: "FFFFFF" } },
          right: { style: "thin", color: { rgb: "FFFFFF" } },
        },
        alignment: { horizontal: "center", vertical: "center" },
      };

      const textStyle = {
        alignment: { horizontal: "left", vertical: "center" },
      };

      const applyStyle = (cellRef: string, style: any) => {
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = style;
        }
      };

      for (let col = 0; col < columnCount; col += 1) {
        applyStyle(XLSX.utils.encode_cell({ r: 0, c: col }), titleStyle);
        if (hasEmissionLine) {
          applyStyle(XLSX.utils.encode_cell({ r: 1, c: col }), filterStyle);
          applyStyle(XLSX.utils.encode_cell({ r: 2, c: col }), filterStyle);
        } else {
          applyStyle(XLSX.utils.encode_cell({ r: 1, c: col }), filterStyle);
        }
        applyStyle(XLSX.utils.encode_cell({ r: headerRowIndex, c: col }), headerStyle);
      }

      for (let row = dataStartRowIndex; row < exportRows.length; row += 1) {
        for (let col = 0; col < columnCount; col += 1) {
          applyStyle(XLSX.utils.encode_cell({ r: row, c: col }), textStyle);
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contratos Vencimento");
      XLSX.writeFile(workbook, "contratos-vencimento.xlsx", {
        bookType: "xlsx",
      });
    } catch (error) {
      toast.error(`Erro ao exportar Excel: ${error}`);
    }
  };

  const handleExportExcel = () => {
    handleExportExcelStyled();
  };

  return (
    <>
      <STitle>Contratos por Vencimento</STitle>
      <SContainerSearchAndButton>
        <CustomSearch
          width="450px"
          placeholder="Pesquise Contrato,Vendedor,Comprador ou Dt.Vencto."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Tooltip title="Filtrar contratos">
          <IconButton
            aria-label="filter"
            onClick={handleSelectionModal}
            sx={{ color: "#E7B10A" }}
          >
            <TbFilter />
          </IconButton>
        </Tooltip>

        <Tooltip title="Limpar filtros">
          <span>
            <IconButton
              aria-label="clearfilter"
              onClick={handleClearFilterModal}
              sx={{ color: "#E7B10A" }}
              disabled={isInitialFilter}
            >
              <TbFilterOff />
            </IconButton>
          </span>
        </Tooltip>

        <ReportFilter
          titleText="Filtrar contratos por vencimento"
          open={isSelectionModal}
          initialFilters={selectData}
          onClose={handleCloseModal}
          onChange={(filters) => setSelectData(filters)}
          onConfirm={fetchSelectData}
          visibleFields={[
            "seller",
            "buyer",
            "date_start",
            "date_end",
            "charge_date_start",
            "charge_date_end",
          ]}
          fieldLabels={{
            date_start: "Data Emissão Inicial",
            date_end: "Data Emissão Final",
            charge_date_start: "Data Cobrança Inicial",
            charge_date_end: "Data Cobrança Final",
          }}
        />

        <CustomButton $variant="success" width="150px" onClick={handlePrint}>
          Imprimir
        </CustomButton>

        <CustomButton
          $variant="success"
          width="150px"
          onClick={handleExportExcel}
        >
          Excel
        </CustomButton>

        <CustomTooltipLabel
          title={
            useInfiniteScroll
              ? "Voltar para paginação"
              : "Ativar scroll infinito"
          }
        >
          <IconButton
            onClick={() => setUseInfiniteScroll((prev) => !prev)}
            sx={{ color: "#E7B10A" }}
          >
            {!useInfiniteScroll ? <TbInfinity /> : <PiScroll />}
          </IconButton>
        </CustomTooltipLabel>
      </SContainerSearchAndButton>

      <CustomTable
        isLoading={isLoading}
        data={displayedData}
        columns={nameColumns}
        hasInfiniteScroll={!useInfiniteScroll}
        hasPagination={useInfiniteScroll}
        page={page}
        setPage={setPage}
        order={order}
        orderBy={orderBy}
        setOrder={setOrder}
        setOrderBy={setOrderBy}
      />
    </>
  );
}
