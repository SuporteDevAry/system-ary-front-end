import { useCallback, useEffect, useState } from "react";
import CustomButton from "../../../../components/CustomButton";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import {
  IColumn,
  TableDataProps,
} from "../../../../components/CustomTable/types";
import { CustomTimeline } from "./components/CustomTimeline";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { useNavigate } from "react-router-dom";

export function HistoryContracts() {
  const contractContext = ContractContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listcontracts, setListContracts] = useState<IContractData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataTable, setDataTable] = useState<TableDataProps[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await contractContext.listContracts();
      setListContracts(response.data);
      setDataTable(response.data);
      const contracts: IContractData[] = response.data;

      const formattedData: TableDataProps[] = contracts.map((contract) => ({
        ...contract,
        status_current: contract.status.status_current,
        history: contract.status.history.map((entry) => ({
          date: entry.date,
          time: entry.time,
          status: entry.status,
          owner_change: entry.owner_change,
        })),
      }));
      setDataTable(formattedData);
    } catch (error) {
      toast.error(
        `Erro ao tentar ler contratos, contacte o administrador do sistema ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [contractContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setDataTable(listcontracts);
    } else {
      const filteredData = listcontracts.filter((item) =>
        Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setDataTable(filteredData);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const handleViewContract = (contract: IContractData) => {
    navigate("/visualizar-contrato", {
      state: { contractForView: contract },
    });
  };

  const nameColumns: IColumn[] = [
    { field: "status_current", header: "Status" },
    { field: "number_contract", header: "Nº Contrato" },
    { field: "created_at", header: "Data" },
    { field: "owner_contract", header: "Criado por" },
  ];

  const renderActionButtons = useCallback(
    (row: any) => (
      <CustomButton
        $variant="secondary"
        width="180px"
        onClick={() => handleViewContract(row)}
      >
        Detalhes do contrato
      </CustomButton>
    ),
    []
  );

  return (
    <SContainer>
      <STitle>Histórico de Contratos</STitle>

      <SContainerSearchAndButton>
        <CustomSearch
          width="400px"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CustomButton $variant="primary" width="70px" onClick={handleSearch}>
          Search
        </CustomButton>
      </SContainerSearchAndButton>
      <CustomTable
        isLoading={isLoading}
        data={dataTable}
        columns={nameColumns}
        hasPagination
        collapsible
        renderChildren={(row) => <CustomTimeline events={row.history || []} />}
        dateFields={["created_at"]}
        actionButtons={renderActionButtons}
      />
    </SContainer>
  );
}
