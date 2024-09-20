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

  const handleSearch = useCallback(() => {
    if (searchTerm.trim() === "") {
      setDataTable(listcontracts);
    } else {
      const filteredData = listcontracts.filter((item) => {
        const searchableFields = [
          item.status?.status_current || "",
          item.seller?.name || "",
          item.buyer?.name || "",
          item.number_contract?.toString() || "",
          item.owner_contract?.toString() || "",
          // Adicione outros campos que deseja filtrar, se necessário (created_at)
        ];

        return searchableFields.some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

      setDataTable(filteredData);
    }
  }, [searchTerm, listcontracts]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, handleSearch]);

  const handleViewContract = (contract: IContractData) => {
    navigate("/visualizar-contrato", {
      state: { contractForView: contract },
    });
  };

  const nameColumns: IColumn[] = [
    {
      field: "status.status_current",
      header: "Status",
      width: "100px",
      sortable: true,
    },
    {
      field: "number_contract",
      header: "Nº Contrato",
      width: "190px",
      sortable: true,
    },
    { field: "created_at", header: "Data", width: "50px", sortable: true },
    {
      field: "owner_contract",
      header: "Criado por",
      width: "100px",
      sortable: true,
    },
    {
      field: "seller.name",
      header: "Vendedor",
      width: "150px",
      sortable: true,
    },
    {
      field: "buyer.name",
      header: "Comprador",
      width: "150px",
      sortable: true,
    },
  ];

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
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* <CustomButton $variant="primary" width="90px" onClick={handleSearch}>
          Pesquisar
        </CustomButton> */}
      </SContainerSearchAndButton>
      <CustomTable
        isLoading={isLoading}
        data={dataTable}
        columns={nameColumns}
        hasPagination
        collapsible
        renderChildren={(row) => (
          <CustomTimeline events={row.status.history || []} />
        )}
        dateFields={["created_at"]}
        actionButtons={renderActionButtons}
        maxChars={15}
      />
    </SContainer>
  );
}
