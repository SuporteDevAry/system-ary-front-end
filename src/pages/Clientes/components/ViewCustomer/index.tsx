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
import { insertMaskInCpf } from "../../../../helpers/front-end/insertMaskInCpf";
import { insertMaskInCnpj } from "../../../../helpers/front-end/insertMaskInCnpj";
import { ContatoContext } from "../../../../contexts/ContatoContext";
import { IListContatos } from "../../../../contexts/ContatoContext/types";
import { ModalCreateNewContact } from "./components/ModalCreateNewContact";
import { ModalUpdateContact } from "./components/ModalUpdateContact";
export function ViewCustomer(): JSX.Element {
  const location = useLocation();

  const [dataClient, setDataClient] = useState<IListCliente | null>(null);
  const contactContext = ContatoContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerContactsList, setCustomerContactsList] = useState<
    IListContatos[]
  >([]);
  const [dataTable, setDataTable] = useState<IListContatos[]>([]);
  const [isNewContactModal, setNewContactModal] = useState<boolean>(false);
  const [isUpdateContactModal, setUpdateContactModal] =
    useState<boolean>(false);

  const [contactForUpdate, setContactForUpdate] = useState<IListContatos>(
    {} as IListContatos
  );

  useEffect(() => {
    const clientForView: IListCliente = location.state?.clientForView;
    setDataClient(clientForView);
  }, [location]);

  const fetchData = async () => {
    if (!dataClient) return;
    try {
      setIsLoading(true);
      const response = await contactContext.getContactsByClient(
        dataClient.code_client
      );
      setCustomerContactsList(response.data);
      setDataTable(response.data);
    } catch (error) {
      console.error("Erro lendo clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dataClient) {
      fetchData();
    }
  }, [dataClient]);

  const handleCreateNewContact = async () => {
    setNewContactModal(true);
  };

  const handleCloseNewContactModal = () => {
    setNewContactModal(false);
    fetchData();
  };

  const handleUpdateCustomerContact = async (contact: IListContatos) => {
    setUpdateContactModal(true);
    setContactForUpdate(contact);
  };

  const handleCloseUpdateContactModal = () => {
    setUpdateContactModal(false);
    fetchData();
  };

  const handleDeleteCustomerContact = (contactId: string) => {
    try {
      contactContext.deleteContato(contactId);
      fetchData();
    } catch (error) {
      console.error("Erro excluindo cliente:", error);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setDataTable(customerContactsList);
    } else {
      const filteredData = customerContactsList.filter((item) =>
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

  const nameColumnsFromDataClient = [
    { field: "code_client", header: "Código:" },
    { field: "name", header: "Razão Social:" },
    { field: "nickname", header: "Nome Fantasia:" },
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

  const formatCellValue = (row: any, column: { field: string }): string => {
    if (column.field === "cnpj_cpf") {
      return row.kind === "F"
        ? insertMaskInCpf(row.cnpj_cpf)
        : insertMaskInCnpj(row.cnpj_cpf);
    }

    return row[column.field];
  };

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
        $variant={"primary"}
        width="80px"
        onClick={() => handleUpdateCustomerContact(row)}
      >
        Editar
      </CustomButton>
      <CustomButton
        $variant={"danger"}
        width="80px"
        onClick={() => handleDeleteCustomerContact(row.id)}
      >
        Deletar
      </CustomButton>
    </SButtonContainer>
  );

  return (
    <>
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

            const formattedValue = dataClient
              ? formatCellValue(dataClient, column)
              : "";

            return isAddressField ? (
              <SCardContainer key={column.field}>
                <SkeyName>
                  {column.header}
                  <SKeyValue>{dataClient?.[column.field]}</SKeyValue>
                </SkeyName>
              </SCardContainer>
            ) : (
              <SKeyContainer key={column.field}>
                <SkeyName>
                  {column.header}
                  <SKeyValue>{formattedValue}</SKeyValue>
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
              placeholder="Digite o Nome ou E-mail"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CustomButton
              onClick={handleCreateNewContact}
              $variant={"success"}
              width="180px"
            >
              Criar Novo Contato
            </CustomButton>
          </BoxContainer>
          <CardContent>
            <CustomTable
              data={dataTable}
              columns={nameColumnsFromContacts}
              isLoading={isLoading}
              hasPagination={true}
              actionButtons={renderActionButtons}
            />
          </CardContent>
        </SCardInfo>
      </SContainer>

      <ModalCreateNewContact
        open={isNewContactModal}
        onClose={handleCloseNewContactModal}
      />
      <ModalUpdateContact
        open={isUpdateContactModal}
        onClose={handleCloseUpdateContactModal}
        dataContact={contactForUpdate}
      />
    </>
  );
}
