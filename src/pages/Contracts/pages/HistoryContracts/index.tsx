import { useCallback, useEffect, useState } from "react";
import CustomButton from "../../../../components/CustomButton";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import {
  IColumn,
  TableDataProps,
} from "../../../../components/CustomTable/types";
import { CustomTimeline } from "../../../../components/CustomTimeline";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import {
  ContractStatus,
  IContractData,
  IUserInfo,
} from "../../../../contexts/ContractContext/types";

export type ITimelineEvent = {
  date: string;
  time: string;
  status: string;
  owner_change: IUserInfo;
};

export function HistoryContracts() {
  const contractContext = ContractContext();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listcontracts, setListContracts] = useState<IContractData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataTable, setDataTable] = useState<TableDataProps[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

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
      }));
      setDataTable(formattedData);

      const events: ITimelineEvent[] = contracts.flatMap((history) =>
        history.status.history.map((entry) => ({
          date: entry.date,
          time: entry.time,
          status: entry.status,
          owner_change: entry.owner_change,
        }))
      );
      setTimelineEvents(events);
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
    console.log("Como tá vindo o dado", dataTable);
    handleSearch();
  }, [searchTerm]);

  const nameColumns: IColumn[] = [
    { field: "status_current", header: "Status" },
    { field: "number_contract", header: "Nº Contrato" },
    { field: "created_at", header: "Data" },
    { field: "contract_details", header: "Detalhes do Contrato" },
    { field: "owner_contract", header: "Criado por" },
  ];

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
        //hasCheckbox
        hasPagination
        collapsible
        // onRowClick={(rowData) =>
        //   setSelectedCustomer({ name: rowData.nome, type: selectionType })
        // }
        onRowClick={(row) => console.log(row)}
        renderChildren={() => <CustomTimeline events={timelineEvents} />}
        dateFields={["created_at"]}
      />
    </SContainer>
  );
}
