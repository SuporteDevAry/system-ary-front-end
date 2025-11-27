import { useCallback, useEffect, useMemo, useState } from "react";
import { TbFilter, TbFilterOff } from "react-icons/tb";

import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { SContainerSearchAndButton, STitle } from "./styles";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomButton from "../../../../components/CustomButton";
import CustomTable from "../../../../components/CustomTable";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { toast } from "react-toastify";

export function ReportsAllContracts() {
  const contractContext = ContractContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listcontracts, setListContracts] = useState<IContractData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState("contract_emission_date");
  const [isSelectionModal, setSelectionModal] = useState<boolean>(false);

  const getInitialSelectData = (): SelectState => ({
    seller: "",
    buyer: "",
    year: "",
    month: "",
    product: "",
    name_product: "",
  });

  const [selectData, setSelectData] = useState<SelectState>(
    getInitialSelectData()
  );

  const handleSelectionModal = () => setSelectionModal((prev) => !prev);
  const handleCloseModal = () => setSelectionModal(false);

  // use ReportFilter.onChange to update `selectData`

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await contractContext.listContracts();
      setListContracts(response.data);
    } catch (error) {
      toast.error(`Erro ao tentar ler contratos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [contractContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchSelectData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // prepare filters
      const filters: any = {};
      if (selectData.seller && selectData.seller.trim())
        filters.seller = selectData.seller.trim();
      if (selectData.buyer && selectData.buyer.trim())
        filters.buyer = selectData.buyer.trim();
      if (selectData.year && String(selectData.year).trim())
        filters.year = parseInt(String(selectData.year).trim(), 10);
      if (selectData.month && String(selectData.month).trim())
        filters.month = parseInt(String(selectData.month).trim(), 10);
      if (selectData.product && selectData.product.trim())
        filters.product = selectData.product.trim();
      if (selectData.name_product && selectData.name_product.trim())
        filters.name_product = selectData.name_product.trim();

      console.log("Filters being sent:", filters);

      const response = await contractContext.reportContracts(filters);

      console.log("Full response from reportContracts:", response);
      console.log("Response data type:", typeof response.data);
      console.log("Response data:", response.data);

      // Garante que estamos extraindo um array
      const contractsData = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as any)?.data)
        ? (response.data as any).data
        : [];

      console.log("Contracts to be set:", contractsData);
      console.log("Contracts length:", contractsData.length);

      if (contractsData && contractsData.length > 0) {
        setListContracts(contractsData);
        toast.success(`${contractsData.length} contrato(s) encontrado(s)`);
      } else {
        setListContracts([]);
        toast.info("Nenhum contrato encontrado");
      }
      setSelectionModal(false);
    } catch (error) {
      console.error("Erro ao tentar ler contratos:", error);
      toast.error(`Erro ao tentar ler contratos: ${error}`);
      setListContracts([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectData, contractContext]);

  const nameColumns: IColumn[] = useMemo(
    () => [
      { field: "contract_emission_date", header: "Data", width: "100px" },
      { field: "number_contract", header: "Contrato", width: "180px" },
      { field: "seller.name", header: "Vendedor", width: "200px" },
      { field: "buyer.name", header: "Comprador", width: "200px" },
      { field: "product", header: "Produto", width: "80px" },
      { field: "name_product", header: "Nome Produto", width: "200px" },
      { field: "price", header: "Preço", width: "200px" },
      { field: "quantity", header: "Quantidade", width: "200px" },
      { field: "final_quantity", header: "Quantidade Final", width: "200px" },
      { field: "total_contract", header: "Total do Contrato", width: "200px" },
      { field: "type_currency", header: "BRL/USD", width: "200px" },
      { field: "day_exchange_rate", header: "Câmbio", width: "200px" },
    ],
    []
  );

  const processedContracts = useMemo<IContractData[]>(() => {
    let processedData: IContractData[] = [...listcontracts];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      processedData = processedData.filter((contract) => {
        return (
          contract.contract_emission_date?.includes(lowerSearchTerm) ||
          contract.number_contract?.includes(lowerSearchTerm) ||
          contract.seller?.name?.toLowerCase().includes(lowerSearchTerm) ||
          contract.buyer?.name?.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }

    processedData.sort((a, b) => {
      const convertToISO = (dateString: string | undefined) => {
        if (!dateString) return "";
        const [day, month, year] = dateString.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      };

      const aDate = new Date(convertToISO(a.contract_emission_date)).getTime();
      const bDate = new Date(convertToISO(b.contract_emission_date)).getTime();

      return order === "asc" ? aDate - bDate : bDate - aDate;
    });

    return processedData;
  }, [listcontracts, searchTerm, order]);

  const handleClearFilterModal = () => {
    setSelectData(getInitialSelectData());
    fetchData();
    setSelectionModal(false);
  };

  const isInitialFilter = useMemo(() => {
    const initial = getInitialSelectData();
    return (
      (selectData.seller ?? "") === (initial.seller ?? "") &&
      (selectData.buyer ?? "") === (initial.buyer ?? "") &&
      (selectData.year ?? "") === (initial.year ?? "") &&
      (selectData.month ?? "") === (initial.month ?? "") &&
      (selectData.product ?? "") === (initial.product ?? "") &&
      (selectData.name_product ?? "") === (initial.name_product ?? "")
    );
  }, [selectData]);

  const handlePrint = (): void => {
    // basic reuse of printing logic can be added later
    window.print();
  };

  const handleExportCSV = () => {
    const headers = nameColumns.map((col) => `"${col.header}"`).join(";");

    const rows = processedContracts.map((row) => {
      return nameColumns
        .map((col) => {
          const fields = (col.field || "").split(".");
          let value: any = row as any;
          for (const f of fields) value = value?.[f];
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
    link.setAttribute("download", "relatorio-contratos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <STitle>Relatórios de Contratos</STitle>
      <SContainerSearchAndButton>
        <CustomSearch
          width="450px"
          placeholder="Filtre por qualquer coluna..."
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
          open={isSelectionModal}
          initialFilters={selectData}
          onClose={handleCloseModal}
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
      </SContainerSearchAndButton>

      <CustomTable
        isLoading={isLoading}
        data={processedContracts}
        columns={nameColumns}
        hasPagination={true}
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
