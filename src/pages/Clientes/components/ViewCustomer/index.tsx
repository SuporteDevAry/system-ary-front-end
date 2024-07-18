import { useEffect, useState } from "react";
import {
  BoxContainer,
  SButtonContainer,
  SCardContainer,
  SCardInfo,
  SContainer,
  SKeyContainer,
  SkeyName,
  SKeyValue,
  STitle,
} from "./styles";
import { CardContent } from "@mui/material";
import CustomTable from "../../../../components/CustomTable";
import CustomButton from "../../../../components/CustomButton";
import { CustomSearch } from "../../../../components/CustomSearch";
import { useLocation } from "react-router-dom";
import { IListCliente } from "../../../../contexts/ClienteContext/types";
export function ViewCustomer(): JSX.Element {
  const location = useLocation();

  const dataClient: IListCliente = location.state?.clientForView;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataTable, setDataTable] = useState<string[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const [customerContactsList, setCustomerContactsList] = useState<string[]>(
    []
  );
  const list = [
    {
      name: "Andre",
      email: "andre@dev.com",
      sector: "Desenvolviment Software",
      telephone: "1197900-0007",
      cellphone: "1197900-0007",
    },
    {
      name: "Denyse",
      email: "denyse@dev.com",
      sector: "Desenvolviment Software",
      telephone: "1197900-0007",
      cellphone: "1197900-0007",
    },
  ];

  useEffect(() => {
    console.log("##OPAAClientsss", dataClient);
    setCustomerContactsList(list);
    setIsLoading(false);
  }, []);
  //   const handleUpdateCustomerContact = async (customerContacts: []) => {
  //     setEditUserModalOpen(true);
  //     setUserForUpdate(user);
  //   };

  //   const handleDeleteCustomerContact = (customerContactId: string) => {
  //     try {
  //       clienteContext.deleteCliente(customerContactId);
  //       fetchData();
  //     } catch (error) {
  //       console.error("Erro excluindo cliente:", error);
  //     }
  //   };

  //   const handleSearch = () => {
  //     if (searchTerm.trim() === "") {
  //       setDataTable(customerContactsList);
  //     } else {
  //       const filteredData = [customerContactsList.filter((item) =>
  //         Object.values(item).some((value) =>
  //           value.toString().toLowerCase().includes(searchTerm.toLowerCase())
  //         )
  //       );
  //       setDataTable(filteredData);
  //     }
  //   };

  //   useEffect(() => {
  //     handleSearch();
  //   }, [searchTerm]);

  const nameColumnsFromDataClient = [
    { field: "code_client", header: "Código:" },
    { field: "name", header: "Nome:" },
    { field: "nickname", header: "Apelido:" },
    { field: "address", header: "Endereço:" },
    { field: "number", header: " Nº:" },
    { field: "complement", header: "Complemento:" },
    { field: "district", header: "Bairro:" },
    { field: "city", header: "Cidade:" },
    { field: "state", header: "UF:" },
    { field: "cnpj_cpf", header: "CNPJ/CPF:" },
    { field: "situation", header: "Situação:" },
    { field: "telephone", header: "Telefone:" },
    { field: "cellphone", header: "Celular:" },
  ];

  const nameColumnsFromContacts = [
    { field: "name", header: "Nome" },
    { field: "email", header: "E-mail" },
    { field: "sector", header: "Setor" },
    { field: "telephone", header: "Telefone" },
    { field: "cellphone", header: "Celular" },
  ];

  const renderActionButtons = (row: any) => (
    <SButtonContainer>
      <CustomButton
        variant={"primary"}
        width="80px"
        onClick={() => {
          alert("Editar contato");
          row;
        }} //() => handleUpdateCustomerContact(row)}
      >
        Editar
      </CustomButton>
      <CustomButton
        variant={"danger"}
        width="80px"
        onClick={() => {
          alert("Deletar contato");
          row;
        }} //() => handleDeleteCustomerContact(row.id)}
      >
        Deletar
      </CustomButton>
    </SButtonContainer>
  );

  return (
    <SContainer>
      <STitle>Dados do Cliente</STitle>

      <SCardInfo>
        {nameColumnsFromDataClient.map((column) => {
          const isAddressField = [
            "address",
            "number",
            "complement",
            "district",
            "city",
            "state",
          ].includes(column.field);

          return isAddressField ? (
            <SCardContainer>
              <SkeyName>
                {column.header}
                <SKeyValue>{dataClient[column.field]}</SKeyValue>
              </SkeyName>
            </SCardContainer>
          ) : (
            <SKeyContainer>
              <SkeyName>
                {column.header}
                <SKeyValue>{dataClient[column.field]}</SKeyValue>
              </SkeyName>
            </SKeyContainer>
          );
        })}
      </SCardInfo>

      <STitle>Contatos do Cliente</STitle>

      <SCardInfo>
        <BoxContainer>
          <CustomSearch
            width="400px"
            placeholder="Digite o Nome ou Código ou CNPJ"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <CustomButton
            onClick={() => alert("Criar uma novo contato")}
            variant={"success"}
            width="180px"
          >
            Criar Novo Contato
          </CustomButton>
        </BoxContainer>
        <CardContent>
          <CustomTable
            data={list}
            columns={nameColumnsFromContacts}
            isLoading={isLoading}
            hasPagination={true}
            actionButtons={renderActionButtons}
          />
        </CardContent>
      </SCardInfo>
    </SContainer>
  );
}
