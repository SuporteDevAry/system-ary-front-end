import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import useTableSearch from "../../../../hooks/useTableSearch";
import { SCard, SContainer, SContainerSearchAndButton, STitle } from "./styles";
import CustomButton from "../../../../components/CustomButton";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useUserPermissions } from "../../../../hooks";

export function ControlContracts() {
  const { canViewContractControl } = useUserPermissions();
  const contractContext = ContractContext();
  const [isSelectionModal, setSelectionModal] = useState<boolean>(false);
  const getInitialSelectData = (): SelectState => ({
    seller: "",
    buyer: "",
    date_start: "",
    date_end: "",
    year: "",
    month: "",
    product: "",
    name_product: "",
    product_types: "",
  });

  const [selectData, setSelectData] = useState<SelectState>(
    getInitialSelectData(),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listcontracts, setListContracts] = useState<IContractData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState("contract_emission_date");
  const [useInfiniteScroll, setUseInfiniteScroll] = useState<boolean>(false);

  const handleOpenFilter = () => setSelectionModal(true);
  const handleCloseFilter = () => setSelectionModal(false);

  const handleClearFilter = () => {
    setSelectData(getInitialSelectData());
    fetchData();
    setSelectionModal(false);
  };

  const isInitialFilter = useMemo(() => {
    const initial = getInitialSelectData();
    const productTypesEmpty =
      !selectData.product_types ||
      (Array.isArray(selectData.product_types)
        ? selectData.product_types.length === 0
        : selectData.product_types === "");
    return (
      (selectData.seller ?? "") === (initial.seller ?? "") &&
      (selectData.buyer ?? "") === (initial.buyer ?? "") &&
      (selectData.date_start ?? "") === (initial.date_start ?? "") &&
      (selectData.date_end ?? "") === (initial.date_end ?? "") &&
      String(selectData.year ?? "") === String(initial.year ?? "") &&
      String(selectData.month ?? "") === String(initial.month ?? "") &&
      (selectData.product ?? "") === (initial.product ?? "") &&
      (selectData.name_product ?? "") === (initial.name_product ?? "") &&
      productTypesEmpty
    );
  }, [selectData]);

  const fetchSelectData = useCallback(
    async (filters: SelectState) => {
      try {
        setIsLoading(true);
        const { date_start, date_end, ...rawApiFilters } = filters as any;

        const apiFilters = Object.entries(rawApiFilters).reduce(
          (acc, [key, value]) => {
            if (value === "" || value === null || value === undefined) {
              return acc;
            }

            acc[key] = value;
            return acc;
          },
          {} as Record<string, any>,
        );

        const hasDateRange =
          (typeof date_start === "string" && date_start !== "") ||
          (typeof date_end === "string" && date_end !== "");

        if (hasDateRange) {
          if (date_start) {
            apiFilters.date_start = date_start;
          }
          if (date_end) {
            apiFilters.date_end = date_end;
          }

          delete apiFilters.date;
          delete apiFilters.month;
          delete apiFilters.year;
        }

        const response = await contractContext.reportContracts(apiFilters);
        const contractsArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.data || [];

        const parseIsoDate = (date?: string) => {
          if (!date || typeof date !== "string") return null;
          const [year, month, day] = date.split("-").map(Number);
          if (!year || !month || !day) return null;
          return new Date(year, month - 1, day);
        };

        const parseContractDate = (date?: string) => {
          if (!date || typeof date !== "string") return null;
          const [day, month, year] = date.split("/").map(Number);
          if (!year || !month || !day) return null;
          return new Date(year, month - 1, day);
        };

        const startDate = parseIsoDate(date_start);
        const endDate = parseIsoDate(date_end);

        const contractsInRange = contractsArray.filter((contract: any) => {
          if (!startDate && !endDate) return true;

          const emissionDate = parseContractDate(
            contract.contract_emission_date,
          );
          if (!emissionDate) return false;

          const matchStart = startDate ? emissionDate >= startDate : true;
          const matchEnd = endDate ? emissionDate <= endDate : true;

          return matchStart && matchEnd;
        });

        const formatted = formatContracts(contractsInRange);
        setListContracts(formatted);
        if (formatted && formatted.length > 0) {
          toast.success(`${formatted.length} contrato(s) encontrado(s)`);
        } else {
          toast.info("Nenhum contrato encontrado");
        }
        setSelectionModal(false);
      } catch (error) {
        console.error("Erro ao buscar contratos filtrados:", error);
        toast.error(`Erro ao tentar ler contratos: ${error}`);
        setListContracts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [contractContext],
  );

  const { filteredData } = useTableSearch({
    data: listcontracts,
    searchTerm,
    searchableFields: ["contract_emission_date", "product", "number_contract"],
  });

  const nameColumns: IColumn[] = useMemo(
    () => [
      {
        field: "status.status_current",
        header: "Status",
        width: "90px",
        sortable: true,
      },
      {
        field: "contract_emission_date",
        header: "Data",
        width: "50px",
        sortable: true,
      },
      {
        field: "product",
        header: "Sigla",
        width: "50px",
      },
      {
        field: "number_contract",
        header: "Nº Contrato",
        width: "120px",
      },
      {
        field: "seller.name",
        header: "Vendedor",
        width: "160px",
      },
      {
        field: "buyer.name",
        header: "Comprador",
        width: "150px",
      },
      {
        field: "number_external_contract_buyer",
        header: "Nº Ctr. Comprador",
        width: "100px",
      },
      {
        field: "name_product",
        header: "Produto",
        width: "150px",
      },
      {
        field: "quantity",
        header: "Quantidade",
        width: "150px",
      },
      {
        field: "price",
        header: "Preço",
        width: "150px",
      },
      {
        field: "type_currency",
        header: "Moeda",
        width: "150px",
      },
      {
        field: "total_contract_value",
        header: "Valor Contrato",
        width: "150px",
      },
      {
        field: "pickup",
        header: "Embarque",
        width: "150px",
      },
      {
        field: "payment",
        header: "Pagamento",
        width: "150px",
      },
      {
        field: "payment_date",
        header: "Data Pagamento",
        width: "150px",
      },
      {
        field: "type_commission",
        header: "P/V",
        width: "50px",
      },
      {
        field: "resp_commission",
        header: "C/V",
        width: "20px",
      },
      {
        field: "commission",
        header: "Comissão",
        width: "150px",
      },
      {
        field: "commission_value",
        header: "Vlr. Comissão",
        width: "150px",
      },
      {
        field: "charge_date",
        header: "Data Cobrança",
        width: "150px",
      },
      {
        field: "expected_receipt_date",
        header: "Dt.Prev.Recbto.",
        width: "150px",
      },
      {
        field: "total_received",
        header: "Vlr.Tot.Recebido",
        width: "150px",
      },
      {
        field: "status_received",
        header: "Liquidado",
      },
      {
        field: "internal_communication",
        header: "Comunicação Interna",
        width: "200px",
      },
    ],
    [],
  );

  const formatContracts = (contracts: any[]): IContractData[] => {
    return contracts.map((contract: any) => {
      const validProducts = ["O", "F", "OC", "OA", "SB", "EP"];
      const quantityTon = validProducts.includes(contract.product)
        ? Number(contract.quantity) / 1
        : Number(contract.quantity) / 1000;

      let total = 0;
      try {
        total = Number(
          String(contract.total_contract_value).replace(/[,]/g, "."),
        );
      } catch (e) {
        total = 0;
      }

      const commission = Number(
        String(
          contract.commission_seller == 0
            ? contract.commission_buyer
            : contract.commission_seller,
        ).replace(",", "."),
      );

      const type_commission =
        contract.commission_seller != 0
          ? contract.type_commission_seller == "Percentual"
            ? "P"
            : "V"
          : contract.type_commission_buyer != 0
            ? contract.type_commission_buyer == "Percentual"
              ? "P"
              : "V"
            : "?";

      const commissionValue =
        type_commission == "P" ? (total * commission) / 100 : commission;

      const resp_commission = contract.commission_seller == 0 ? "C" : "V";

      const formattedCommission = isNaN(commissionValue)
        ? ""
        : commissionValue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });

      return {
        ...contract,
        quantity: quantityTon,
        type_commission: type_commission,
        resp_commission: resp_commission,
        commission: commission,
        commission_value: formattedCommission,
      } as IContractData;
    });
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await contractContext.listContracts();
      const contractsArray = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || [];
      const updatedContracts = formatContracts(contractsArray);
      setListContracts(updatedContracts);
    } catch (error) {
      toast.error(`Erro ao tentar ler contratos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [contractContext]);

  useEffect(() => {
    if (canViewContractControl) {
      fetchData();
    }
  }, [fetchData, canViewContractControl]);

  const handlePrint = (): void => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const pageSize = 20;

    const getValue = (row: any, field?: string) => {
      if (!field) return "";
      const parts = field.split(".");
      let value: any = row;
      for (const p of parts) {
        value = value?.[p];
        if (value === undefined || value === null) break;
      }
      return value ?? "";
    };

    const headerHtml = `<tr>${nameColumns
      .map(
        (col) =>
          `<th style="border:1px solid #999;padding:3px;font-size:7px;background:#f0f0f0;white-space:nowrap;">${col.header}</th>`,
      )
      .join("")}</tr>`;

    const allRowsHtml = filteredData.map((row) => {
      const cols = nameColumns
        .map((col) => {
          const raw = getValue(row, col.field);
          const cell = String(raw ?? "")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          return `<td style="border:1px solid #ccc;padding:3px;font-size:7px;">${cell}</td>`;
        })
        .join("");
      return `<tr>${cols}</tr>`;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Controle de Contratos</title>
          <style>
            @page { size: A4 landscape; margin: 8mm; }
            body { font-family: Arial, sans-serif; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 8mm; }
            th, td { border: 1px solid #ccc; padding: 3px; font-size: 7px; }
            th { background-color: #f0f0f0; }
            .page-break { page-break-after: always; }
            h3 { text-align: left; margin: 0 0 4px 0; font-size: 11px; }
            h4 { text-align: center; margin: 0 0 8px 0; font-size: 10px; }
          </style>
        </head>
        <body>
          <h3>Ary Oleofar</h3>
          <h4>Controle de Contratos</h4>
    `);

    for (let i = 0; i < allRowsHtml.length; i += pageSize) {
      const pageRows = allRowsHtml.slice(i, i + pageSize).join("");
      printWindow.document.write(`
        <table>
          <thead>${headerHtml}</thead>
          <tbody>${pageRows}</tbody>
        </table>
      `);
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
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleExportCSV = () => {
    const headers = nameColumns
      .filter((col) => col.field)
      .map((col) => `"${col.header}"`)
      .join(";");

    const rows = filteredData.map((row) => {
      return nameColumns
        .filter((col) => col.field)
        .map((col) => {
          const fields = col.field!.split(".");
          let value: any = row;
          for (const f of fields) {
            value = value?.[f];
          }

          // Corrige campos numéricos com vírgula decimal
          if (
            col.field === "quantity" ||
            col.field === "price" ||
            col.field === "total_contract_value" ||
            col.field === "commission" ||
            col.field === "total_received"
          ) {
            const number = parseFloat(String(value).replace(",", "."));
            if (!isNaN(number)) {
              value = number
                .toFixed(2) // duas casas decimais
                .replace(".", ","); // troca ponto por vírgula
            }
          }

          if (col.field === "commission_value") {
            value = String(value).replace("R$", "").replace(".", "").trim();
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
    link.setAttribute("download", "controle-contratos-execucao.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!canViewContractControl) {
    return (
      <SContainer>
        <STitle>Acesso restrito</STitle>
        <SCard>Você não tem permissão para acessar o Controle de Contratos.</SCard>
      </SContainer>
    );
  }

  return (
    <SContainer>
      <STitle>Controle de Contratos</STitle>

      <SCard>
        <SContainerSearchAndButton>
          <CustomSearch
            width="400px"
            placeholder="Filtre Data, Sigla ou Nº Contrato"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Tooltip title="Filtrar contratos">
            <IconButton
              aria-label="filter"
              onClick={handleOpenFilter}
              sx={{ color: "#E7B10A" }}
            >
              <TbFilter />
            </IconButton>
          </Tooltip>
          <Tooltip title="Limpar filtros">
            <span>
              <IconButton
                aria-label="clearfilter"
                onClick={handleClearFilter}
                sx={{ color: "#E7B10A" }}
                disabled={isInitialFilter}
              >
                <TbFilterOff />
              </IconButton>
            </span>
          </Tooltip>
          <ReportFilter
            open={isSelectionModal}
            initialFilters={selectData}
            onClose={handleCloseFilter}
            onChange={(f) => setSelectData(f)}
            onConfirm={fetchSelectData}
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
                ? "Voltar para paginação"
                : "Ativar scroll infinito"
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
          data={filteredData}
          columns={nameColumns}
          hasInfiniteScroll={!useInfiniteScroll}
          hasPagination={useInfiniteScroll}
          maxChars={15}
          page={page}
          setPage={setPage}
          order={order}
          orderBy={orderBy}
          setOrder={setOrder}
          setOrderBy={setOrderBy}
          dateFields={["created_at"]}
        />
      </SCard>
    </SContainer>
  );
}
