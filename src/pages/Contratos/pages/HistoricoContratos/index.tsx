import { useEffect, useState } from "react";
import CustomButton from "../../../../components/CustomButton";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import {
  IColumn,
  TableDataProps,
} from "../../../../components/CustomTable/types";
import { CustomTimeline } from "../../../../components/CustomTimeline";

export function HistoricoContratos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dataTable, setDataTable] = useState<TableDataProps[]>([]);

  const data = [
    { nr_contrato: "001", status: "Ativo", produto: "Soja" },
    { nr_contrato: "002", status: "Pendente", produto: "Milho" },
    { nr_contrato: "003", status: "Finalizado", produto: "Trigo" },
    { nr_contrato: "004", status: "Cancelado", produto: "Arroz" },
    { nr_contrato: "005", status: "Ativo", produto: "Cevada" },
    { nr_contrato: "006", status: "Pendente", produto: "Sorgo" },
    { nr_contrato: "007", status: "Finalizado", produto: "Aveia" },
    { nr_contrato: "008", status: "Cancelado", produto: "Centeio" },
    { nr_contrato: "009", status: "Ativo", produto: "Lentilha" },
    { nr_contrato: "010", status: "Pendente", produto: "Grão-de-bico" },
  ];

  const timelineEvents = [
    { date: "07/06/2024", time: "09:30 am", status: "A Conferir" },
    { date: "08/06/2024", time: "10:00 am", status: "Validado" },
    { date: "09/06/2024", time: "12:00 am", status: "Conferido" },
    { date: "10/06/2024", time: "9:00 am", status: "Enviado" },
  ];

  //   useEffect(() => {
  //     if (data) {
  //       setDataTable(data);
  //     }
  //   }, [data]);

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setDataTable(data);
    } else {
      const filteredData = data.filter((item) =>
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

  const nameColumns: IColumn[] = [
    { field: "status", header: "Status" },
    { field: "contract_details", header: "Em uso" },
    { field: "nr_contrato", header: "Nº Contrato" },
    { field: "produto", header: "Produto" },
    { field: "contract_details", header: "Detalhes do Contrato" },
    { field: "contract_details", header: "Criado por" },
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
        <CustomButton variant="primary" width="70px" onClick={handleSearch}>
          Search
        </CustomButton>
      </SContainerSearchAndButton>
      <CustomTable
        //isLoading={loading}
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
      />
    </SContainer>
  );
}
