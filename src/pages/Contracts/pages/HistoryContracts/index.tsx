import { useCallback, useEffect, useMemo, useState } from "react";
import CustomButton from "../../../../components/CustomButton";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import { IColumn } from "../../../../components/CustomTable/types";
import { CustomTimeline } from "./components/CustomTimeline";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { useNavigate } from "react-router-dom";
import useTableSearch from "../../../../hooks/useTableSearch";
import { ReportFilter } from "../../../../components/ReportFilter";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";

export function HistoryContracts() {
  const contractContext = ContractContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allContracts, setAllContracts] = useState<IContractData[]>([]);
  const [listcontracts, setListContracts] = useState<IContractData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("created_at");
  const [isSelectionModal, setSelectionModal] = useState<boolean>(false);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState<boolean>(false);

  type SelectState = {
    date?: string;
  };

  const getInitialSelectData = (): SelectState => {
    return {
      date: "",
    };
  };

  const [selectData, setSelectData] = useState<SelectState>(
    getInitialSelectData()
  );

  const handleSelectionModal = () => setSelectionModal((prev) => !prev);
  const handleCloseModal = () => setSelectionModal(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await contractContext.listContracts();

      setAllContracts(response.data);
      setListContracts(response.data);
    } catch (error) {
      toast.error(
        `Erro ao tentar ler contratos, contacte o administrador do sistema: ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [contractContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const formatContracts = (contracts: any[]): IContractData[] => {
    return contracts.map((contract: any) => {
      const validProducts = ["O", "F", "OC", "OA", "SB", "EP"];
      const quantityTon = validProducts.includes(contract.product)
        ? Number(contract.quantity) / 1
        : Number(contract.quantity) / 1000;

      let total = 0;
      try {
        total = Number(
          String(contract.total_contract_value).replace(/[,]/g, ".")
        );
      } catch (e) {
        total = 0;
      }

      const commission = Number(
        String(
          contract.commission_seller == 0
            ? contract.commission_buyer
            : contract.commission_seller
        ).replace(",", ".")
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

  const fetchSelectData = useCallback(
    async (filters: SelectState) => {
      try {
        setIsLoading(true);
        const response = await contractContext.reportContracts(filters as any);
        const contractsArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.data || [];
        const formatted = formatContracts(contractsArray);
        setListContracts(formatted);
        setSelectData(filters);
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
    [contractContext, allContracts]
  );

  const handleClearFilter = () => {
    setSelectData(getInitialSelectData());
    setListContracts(allContracts);
    setSelectionModal(false);
  };

  // Considera que existe filtro ativo quando o `selectData` difere do inicial
  // ou quando a lista atual foi reduzida (filtro aplicado no servidor/local)
  const hasActiveFilter = useMemo(() => {
    const initial = getInitialSelectData();
    const selectIsInitial = selectData.date === initial.date;
    const listDiffers = listcontracts.length !== allContracts.length;
    return !selectIsInitial || listDiffers;
  }, [selectData, listcontracts, allContracts]);

  const { filteredData, handleSearch } = useTableSearch({
    data: listcontracts,
    searchTerm,
    searchableFields: [
      "number_contract",
      "status.status_current",
      "buyer.name",
      "seller.name",
    ],
  });

  useEffect(() => {
    handleSearch();
  }, [searchTerm, listcontracts, handleSearch]);

  const handleViewContract = (contract: IContractData) => {
    navigate("/contratos/historico/visualizar-contrato", {
      state: { contractForView: contract },
    });
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
    link.setAttribute("download", "historico-contratos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nameColumns: IColumn[] = useMemo(
    () => [
      {
        field: "status.status_current",
        header: "Status",
        width: "90px",
        sortable: true,
      },
      {
        field: "number_contract",
        header: "Nº Contrato",
        width: "160px",
        sortable: false,
      },
      {
        field: "contract_emission_date",
        header: "Data",
        width: "50px",
        sortable: false,
      },
      {
        field: "owner_contract",
        header: "Criado por",
        width: "90px",
        sortable: true,
      },
      {
        field: "seller.name",
        header: "Vendedor",
        width: "160px",
        sortable: true,
      },
      {
        field: "buyer.name",
        header: "Comprador",
        width: "150px",
        sortable: true,
      },
    ],
    []
  );

  const renderActionButtons = (row: any) => (
    <CustomButton
      $variant="secondary"
      width="75px"
      onClick={() => handleViewContract(row)}
    >
      Detalhes
    </CustomButton>
  );

  return (
    <SContainer>
      <STitle>Histórico de Contratos</STitle>

      <SContainerSearchAndButton>
        <CustomSearch
          width="400px"
          placeholder="Digite Nº Contrato, Vendedor, Comprador, Status"
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
              onClick={handleClearFilter}
              sx={{ color: "#E7B10A" }}
              disabled={!hasActiveFilter}
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
        collapsible
        renderChildren={(row) => (
          <CustomTimeline events={row.status.history || []} />
        )}
        dateFields={["contract_emission_date"]}
        actionButtons={renderActionButtons}
        maxChars={15}
        page={page}
        setPage={setPage}
        order={order}
        orderBy={orderBy}
        setOrder={setOrder}
        setOrderBy={setOrderBy}
      />
    </SContainer>
  );
}
