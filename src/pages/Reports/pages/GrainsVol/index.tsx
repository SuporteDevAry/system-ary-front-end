import { useCallback, useEffect, useMemo, useState } from "react";
import CustomTable from "../../../../components/CustomTable";
import { CustomSearch } from "../../../../components/CustomSearch";
import useTableSearch from "../../../../hooks/useTableSearch";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import CustomButton from "../../../../components/CustomButton";
import IconButton from "@mui/material/IconButton";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import CustomTooltipLabel from "../../../../components/CustomTooltipLabel";

export function GrainsVol() {
  const contractContext = ContractContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allContracts, setAllContracts] = useState<IContractData[]>([]);
  const [listcontracts, setListContracts] = useState<IContractData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState("quantity");
  const [isSelectionModal, setSelectionModal] = useState<boolean>(false);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState<boolean>(false);

  const getInitialSelectData = (): SelectState => ({
    seller: "",
    buyer: "",
    date_start: "",
    date_end: "",
    product: "",
  });

  const [selectData, setSelectData] = useState<SelectState>(
    getInitialSelectData(),
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await contractContext.listContracts();

      const filteredContracts = response.data.filter(
        (contract: {
          total_contract_value: any;
          price: any;
          commission_seller: any;
          commission_buyer: any;
          type_commission_seller: any;
          type_commission_buyer: any;
          type_commission: any;
          resp_commission: any;
          commission: any;
          quantity: any;
          product: any;
          name_product: any;
          day_exchange_rate: any;
          type_currency: any;
        }) =>
          (contract.name_product &&
            contract.name_product.toUpperCase() === "SOJA EM GRÃOS") ||
          contract.name_product.toUpperCase() === "MILHO EM GRÃOS" ||
          contract.name_product.toUpperCase() === "TRIGO" ||
          contract.name_product.toUpperCase() === "SORGO",
      );

      const updatedContracts = filteredContracts.map(
        (contract: {
          price: any;
          total_contract_value: any;
          commission_seller: any;
          commission_buyer: any;
          type_commission_seller: any;
          type_commission_buyer: any;
          type_commission: any;
          resp_commission: any;
          commission: any;
          quantity: any;
          product: any;
          name_product: any;
          day_exchange_rate: any;
          type_currency: any;
        }) => {
          // 02/01/2025 - Carlos - Farelo e Óleo não divide por 60
          // Só iremos remover essa regra das siglas, caso o cliente aceite a sugestão da reunião do dia 09/04/2025
          const validProducts = ["O", "F", "OC", "OA", "SB", "EP"];
          const quantityTon = validProducts.includes(contract.product)
            ? Number(contract.quantity) / 1
            : Number(contract.quantity) / 1000;

          const total =
            contract.type_currency == "Dólar"
              ? Number(contract.total_contract_value.replace(/[,]/g, ".")) *
                Number(contract.day_exchange_rate.replace(/[,]/g, "."))
              : Number(contract.total_contract_value.replace(/[,]/g, "."));

          const commission = Number(
            contract.commission_seller == 0
              ? contract.commission_buyer.replace(",", ".")
              : contract.commission_seller.replace(",", "."),
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

          const formattedCommission = commissionValue.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          const formattedTotal = total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          const formattedPrice = Number(
            contract.type_currency == "Dólar"
              ? Number(contract.price.replace(/[,]/g, ".")) *
                  Number(contract.day_exchange_rate.replace(/[,]/g, "."))
              : contract.price,
          ).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          const formattedDayExchange =
            contract.day_exchange_rate != 0 || contract.type_currency == "Dólar"
              ? Number(
                  contract.day_exchange_rate.replace(/[,]/g, "."),
                ).toLocaleString("pt-BR", {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })
              : "";

          return {
            ...contract,
            quantity: quantityTon,
            type_commission: type_commission,
            resp_commission: resp_commission,
            commission: commission,
            commission_value: formattedCommission,
            total_contract_real: formattedTotal,
            price_real: formattedPrice,
            day_exchange_formatted: formattedDayExchange,
          };
        },
      );

      setAllContracts(updatedContracts);
      setListContracts(updatedContracts);
    } catch (error) {
      toast.error(`Erro ao tentar ler contratos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [contractContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectionModal = () => setSelectionModal((prev) => !prev);
  const handleCloseModal = () => setSelectionModal(false);

  const isInitialFilter = useMemo(() => {
    const initial = getInitialSelectData();
    return (
      (selectData.seller ?? "") === (initial.seller ?? "") &&
      (selectData.buyer ?? "") === (initial.buyer ?? "") &&
      (selectData.date_start ?? "") === (initial.date_start ?? "") &&
      (selectData.date_end ?? "") === (initial.date_end ?? "") &&
      (selectData.product ?? "") === (initial.product ?? "")
    );
  }, [selectData]);

  const handleClearFilterModal = () => {
    setSelectData(getInitialSelectData());
    setListContracts(allContracts);
    setSelectionModal(false);
  };

  const fetchSelectData = useCallback(
    (filters: SelectState) => {
      try {
        setIsLoading(true);

        const normalize = (value?: string) =>
          (value || "")
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

        const parseIsoDate = (date?: string) => {
          if (!date) return null;
          const [year, month, day] = date.split("-").map(Number);
          if (!year || !month || !day) return null;
          return new Date(year, month - 1, day);
        };

        const parseBrDate = (date?: string) => {
          if (!date) return null;
          const [day, month, year] = date.split("/").map(Number);
          if (!year || !month || !day) return null;
          return new Date(year, month - 1, day);
        };

        const sellerTerms = (filters.seller || "")
          .split(",")
          .map((item) => normalize(item))
          .filter(Boolean);

        const buyerTerms = (filters.buyer || "")
          .split(",")
          .map((item) => normalize(item))
          .filter(Boolean);

        const productTerm = normalize(filters.product as string);

        const startDate = parseIsoDate(filters.date_start as string);
        const endDate = parseIsoDate(filters.date_end as string);

        const filtered = allContracts.filter((contract: any) => {
          const sellerName = normalize(contract?.seller?.name);
          const buyerName = normalize(contract?.buyer?.name);
          const product = normalize(contract?.product);
          const emissionDate = parseBrDate(contract?.contract_emission_date);

          const matchSeller =
            sellerTerms.length === 0 ||
            sellerTerms.some((term) => sellerName.includes(term));

          const matchBuyer =
            buyerTerms.length === 0 ||
            buyerTerms.some((term) => buyerName.includes(term));

          const matchProduct = !productTerm || product.includes(productTerm);

          const matchStart = startDate
            ? emissionDate
              ? emissionDate >= startDate
              : false
            : true;

          const matchEnd = endDate
            ? emissionDate
              ? emissionDate <= endDate
              : false
            : true;

          return (
            matchSeller && matchBuyer && matchProduct && matchStart && matchEnd
          );
        });

        setSelectData(filters);
        setListContracts(filtered);

        if (filtered.length > 0) {
          toast.success(`${filtered.length} contrato(s) encontrado(s)`);
        } else {
          toast.info("Nenhum contrato encontrado");
        }

        setSelectionModal(false);
      } catch (error) {
        toast.error(`Erro ao aplicar filtros: ${error}`);
      } finally {
        setIsLoading(false);
      }
    },
    [allContracts],
  );

  const { filteredData } = useTableSearch({
    data: listcontracts,
    searchTerm,
    searchableFields: [
      "contract_emission_date",
      "number_contract",
      "product",
      "seller.name",
      "buyer.name",
    ],
  });

  const nameColumns: IColumn[] = useMemo(
    () => [
      {
        field: "contract_emission_date",
        header: "DATA",
        width: "100px",
        sortable: true,
      },
      {
        field: "product",
        header: "SIGLA",
        width: "80px",
      },
      {
        field: "number_contract",
        header: "CONTRATO",
        width: "180px",
        sortable: true,
      },
      {
        field: "seller.name",
        header: "VENDEDOR",
        width: "200px",
      },
      {
        field: "buyer.name",
        header: "COMPRADOR",
        width: "200px",
      },
      {
        field: "quantity",
        header: "QUANTIDADE (TON)",
        width: "150px",
        sortable: true,
      },
      {
        field: "price_real",
        header: "PREÇO R$",
        width: "150px",
      },
      {
        field: "type_currency",
        header: "MOEDA",
        width: "20px",
      },
      {
        field: "day_exchange_formatted",
        header: "TAXA",
        width: "20px",
      },
      {
        field: "total_contract_real",
        header: "VALOR CONTRATO R$",
        width: "20px",
      },
      {
        field: "type_commission",
        header: "P/V",
        width: "20px",
      },
      {
        field: "resp_commission",
        header: "C/V",
        width: "20px",
      },
      {
        field: "commission",
        header: "COMISSÃO",
        width: "100px",
      },
      {
        field: "commission_value",
        header: "COMISSÃO R$",
        width: "130px",
      },
    ],
    [],
  );

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };

  const sortedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      const aRaw = getNestedValue(a, orderBy);
      const bRaw = getNestedValue(b, orderBy);

      // Tenta converter para número decimal com . como separador
      const aNum =
        typeof aRaw === "string"
          ? parseFloat(aRaw.replace(".", "").replace(",", "."))
          : Number(aRaw);
      const bNum =
        typeof bRaw === "string"
          ? parseFloat(bRaw.replace(".", "").replace(",", "."))
          : Number(bRaw);

      return order === "asc" ? aNum - bNum : bNum - aNum;
    });
    return sorted;
  }, [filteredData, order, orderBy]);

  const handlePrint = (): void => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const pageSize = 25;

    printWindow.document.write(`
        <html>
            <head>
                <title>Grãos Volume - Produto</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 80%; border-collapse: collapse; margin-bottom: 10px; }
                    th, td { border: 1px solid black; padding: 5px; font-size: 8px; }
                    .page-break { page-break-after: always; }
                    h3 { text-align: left; }
                    h2 { text-align: center; }
                </style>
            </head>
            <body>
                <h3>Ary Oleofar</h3>
                <h4>Grãos Volume - Produto</h4>
        `);

    for (let i = 0; i < sortedData.length; i += pageSize) {
      const pageRows = sortedData.slice(i, i + pageSize);

      printWindow.document.write(`<table><thead><tr>`);
      nameColumns.forEach((col) => {
        printWindow.document.write(
          `<th style="width: ${col.width}px;">${col.header}</th>`,
        );
      });
      printWindow.document.write(`</tr></thead><tbody>`);

      pageRows.forEach((row) => {
        printWindow.document.write(`<tr>`);
        nameColumns.forEach((col) => {
          const fields = col.field.split(".");
          let value: any = row;
          for (const f of fields) {
            value = value?.[f];
          }
          printWindow.document.write(`<td>${value ?? ""}</td>`);
        });
        printWindow.document.write(`</tr>`);
      });

      printWindow.document.write(`</tbody></table>`);

      if (i + pageSize < sortedData.length) {
        printWindow.document.write(`<div class="page-break"></div>`);
      }
    }

    printWindow.document.write(`
            </body>
        </html>
        `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleExportCSV = () => {
    const headers = nameColumns
      .filter((col) => col.field)
      .map((col) => `"${col.header}"`)
      .join(";");

    const rows = sortedData.map((row) => {
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
            col.field === "commission"
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

    const BOM = "\uFEFF";
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "graos-volume-produto.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <STitle>Grãos Volume - Produto</STitle>
      <SContainerSearchAndButton>
        <CustomSearch
          width="450px"
          placeholder="Filtre por Data,Sigla,Contrato,Comprador ou Vendedor"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <CustomTooltipLabel title="Filtrar contratos">
          <IconButton
            aria-label="filter"
            onClick={handleSelectionModal}
            sx={{ color: "#E7B10A" }}
          >
            <TbFilter />
          </IconButton>
        </CustomTooltipLabel>

        <CustomTooltipLabel title="Limpar filtros">
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
        </CustomTooltipLabel>

        <ReportFilter
          titleText="Grãos Volume"
          open={isSelectionModal}
          initialFilters={selectData}
          onClose={handleCloseModal}
          onChange={(filters) => setSelectData(filters)}
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
            {!useInfiniteScroll ? <PiScroll /> : <TbInfinity />}
          </IconButton>
        </CustomTooltipLabel>
      </SContainerSearchAndButton>
      <SContainer>
        <CustomTable
          isLoading={isLoading}
          data={sortedData}
          columns={nameColumns}
          hasInfiniteScroll={!useInfiniteScroll}
          hasPagination={useInfiniteScroll}
          //maxChars={15}
          page={page}
          setPage={setPage}
          order={order}
          orderBy={orderBy}
          setOrder={setOrder}
          setOrderBy={setOrderBy}
        />
      </SContainer>
    </>
  );
}
