import { useCallback, useEffect, useMemo, useState } from "react";
import CustomTable from "../../../../components/CustomTable";
import { CustomSearch } from "../../../../components/CustomSearch";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { SContainerSearchAndButton, STitle } from "./styles";
import CustomButton from "../../../../components/CustomButton";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import IconButton from "@mui/material/IconButton";
import { Tooltip } from "@mui/material";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";

export function PaymentContract() {
  const contractContext = ContractContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listcontracts, setListContracts] = useState<IContractData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState("payment_date");
  const [isSelectionModal, setSelectionModal] = useState<boolean>(false);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState<boolean>(false);

  const getInitialSelectData = (): SelectState => {
    return {
      date_start: "",
      date_end: "",
      seller: "",
      buyer: "",
    };
  };

  const [selectData, setSelectData] = useState<SelectState>(
    getInitialSelectData(),
  );

  const handleSelectionModal = () => setSelectionModal((prev) => !prev);
  const handleCloseModal = () => setSelectionModal(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await contractContext.reportContracts(
        getInitialSelectData(),
      );
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

  const normalizeStr = (value?: string) =>
    (value || "")
      .toString()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const processedContracts = useMemo(() => {
    let processedData = [...listcontracts];

    if (searchTerm) {
      const normalizedSearchTerm = normalizeStr(searchTerm);
      processedData = processedData.filter((contract) => {
        const emissionDate = normalizeStr(contract.contract_emission_date);
        const contractNumber = normalizeStr(contract.number_contract);
        const sellerName = normalizeStr(contract.seller?.name);
        const buyerName = normalizeStr(contract.buyer?.name);
        const paymentDate = normalizeStr(contract.payment_date);

        return (
          emissionDate.includes(normalizedSearchTerm) ||
          contractNumber.includes(normalizedSearchTerm) ||
          sellerName.includes(normalizedSearchTerm) ||
          buyerName.includes(normalizedSearchTerm) ||
          paymentDate.includes(normalizedSearchTerm)
        );
      });
    }

    processedData.sort((a, b) => {
      const convertToISO = (dateString: string | undefined) => {
        if (!dateString) return ""; // evita erro se estiver undefined
        const [day, month, year] = dateString.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      };

      const aDate = new Date(convertToISO(a.payment_date)).getTime();
      const bDate = new Date(convertToISO(b.payment_date)).getTime();

      return order === "asc" ? aDate - bDate : bDate - aDate;
    });

    return processedData;
  }, [listcontracts, searchTerm, order]);

  const fetchSelectData = useCallback(
    async (filters: SelectState) => {
      try {
        setIsLoading(true);
        const response = await contractContext.reportContracts(filters);
        setSelectData(filters);
        const contractsArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.data || [];
        setListContracts(contractsArray);
        if (contractsArray.length > 0) {
          toast.success(`${contractsArray.length} contrato(s) encontrado(s)`);
        } else {
          toast.info("Nenhum contrato encontrado");
        }
        setSelectionModal(false);
      } catch (error) {
        toast.error(`Erro ao tentar ler contratos: ${error}`);
      } finally {
        setIsLoading(false);
      }
    },
    [contractContext],
  );

  const nameColumns: IColumn[] = useMemo(
    () => [
      {
        field: "contract_emission_date",
        header: "Data Emissão",
        width: "100px",
      },
      {
        field: "number_contract",
        header: "Contrato",
        width: "180px",
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
      },
      {
        field: "charge_date",
        header: "Dt.Cobrança",
        headerTooltip: "Data de Cobrança",
        width: "130px",
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

  const handleClearFilterModal = async () => {
    const initial = getInitialSelectData();
    setSelectData(initial);
    try {
      setIsLoading(true);
      const response = await contractContext.reportContracts(initial);
      const contractsArray = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || [];
      setListContracts(contractsArray);
    } catch (error) {
      toast.error(`Erro ao tentar ler contratos: ${error}`);
    } finally {
      setIsLoading(false);
      setSelectionModal(false);
    }
  };

  const isInitialFilter = useMemo(() => {
    const initial = getInitialSelectData();
    return (
      (selectData.date_start ?? "") === (initial.date_start ?? "") &&
      (selectData.date_end ?? "") === (initial.date_end ?? "") &&
      (selectData.seller?.trim() ?? "") === "" &&
      (selectData.buyer?.trim() ?? "") === ""
    );
  }, [selectData]);

  // Filtro de negócios agora é feito apenas no backend

  const handlePrint = (): void => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Quantidade de registros por página
    const pageSize = 30;

    // Função utilitária para extrair campo (suporta "a.b.c")
    const getValue = (row: any, field?: string) => {
      if (!field) return "";
      const parts = field.split(".");
      let value: any = row;
      for (const p of parts) {
        value = value?.[p];
        if (value === undefined || value === null) break;
      }
      // Formate datas se necessário (exemplo simples)
      return value ?? "";
    };

    // Gera o HTML do cabeçalho usando nameColumns
    const headerHtml = `<tr>
        ${nameColumns
          .map(
            (col) =>
              `<th style="border:1px solid black;padding:4px;font-size:9px;">${col.header}</th>`,
          )
          .join("")}
    </tr>`;

    // Gera linhas a partir de processedContracts
    const allRowsHtml = processedContracts.map((row) => {
      const cols = nameColumns
        .map((col) => {
          const raw = getValue(row, col.field);
          // escape simples
          const cell = String(raw ?? "")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          return `<td style="border:1px solid black;padding:4px;font-size:9px;">${cell}</td>`;
        })
        .join("");
      return `<tr>${cols}</tr>`;
    });

    // Começa a montar o documento
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
                </style>
            </head>
            <body>
                <h3>Ary Oleofar</h3>
                <h2>Contratos por Vencimento</h2>
    `);

    // Escreve as páginas
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

    printWindow.document.write(`
            </body>
        </html>
    `);

    printWindow.document.close();
    // Pequena proteção para garantir que o conteúdo seja carregado antes de mandar imprimir
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleExportCSV = () => {
    const headers = nameColumns
      .filter((col) => col.field)
      .map((col) => `"${col.header}"`)
      .join(";");

    const rows = processedContracts.map((row) => {
      return nameColumns
        .filter((col) => col.field)
        .map((col) => {
          const fields = col.field!.split(".");
          let value: any = row;
          for (const f of fields) {
            value = value?.[f];
          }
          return `"${value ?? ""}"`;
        })
        .join(";");
    });

    const BOM = "\uFEFF"; // UTF-8 BOM
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "contratos-vencimento.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          visibleFields={["seller", "buyer", "date_start", "date_end"]}
        />

        <CustomButton $variant="success" width="150px" onClick={handlePrint}>
          Imprimir
        </CustomButton>

        <CustomButton
          $variant="success"
          width="150px"
          onClick={handleExportCSV}
        >
          Exportar CSV
        </CustomButton>

        <Tooltip
          title={
            useInfiniteScroll
              ? "Ativar scroll infinito"
              : "Voltar para paginação"
          }
        >
          <IconButton
            onClick={() => setUseInfiniteScroll((prev) => !prev)}
            sx={{ color: "#E7B10A" }}
          >
            {!useInfiniteScroll ? <PiScroll /> : <TbInfinity />}
          </IconButton>
        </Tooltip>
      </SContainerSearchAndButton>

      <CustomTable
        isLoading={isLoading}
        data={processedContracts}
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
