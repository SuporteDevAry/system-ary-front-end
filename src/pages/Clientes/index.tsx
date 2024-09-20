import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BoxContainer, SButtonContainer, STitle } from "./styles";

import CardContent from "@mui/material/CardContent";
import { ClienteContext } from "../../contexts/ClienteContext";
import { IListCliente } from "../../contexts/ClienteContext/types";
import CustomTable from "../../components/CustomTable";
import { CustomSearch } from "../../components/CustomSearch";
import CustomButton from "../../components/CustomButton";
import { toast } from "react-toastify";
import { ModalDelete } from "../../components/ModalDelete";
import useTableSearch from "../../hooks/useTableSearch";
import { IColumn } from "../../components/CustomTable/types";

export function Clientes() {
  const clienteContext = ClienteContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clientes, setClientes] = useState<IListCliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModal, setDeleteModal] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<IListCliente | null>(
    null
  );
  const [modalContent, setModalContent] = useState<string>("");
  const [page, setPage] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await clienteContext.listClientes();
      setClientes(response.data);
    } catch (error) {
      toast.error(
        `Erro ao tentar ler clientes, contacte o administrador do sistema ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [clienteContext]);

  useEffect(() => {
    // Aqui verificaremos o estado pra ver se tem o update como true, para podermos atualizar a tabela conforme falado no componente do EditarCliente.
    if (location.state && location.state.updated) {
      fetchData();

      navigate(location.pathname, { state: {} });
    }
  }, [location.state, fetchData, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCliente = () => {
    navigate("/cliente-cadastrar");
  };

  const handleUpdateCliente = (clientes: IListCliente) => {
    navigate("/cliente-editar", {
      state: { clienteForUpdate: clientes },
    });
  };

  const handleViewCustomer = (clientes: IListCliente) => {
    navigate("/visualizar-cliente", {
      state: { clientForView: clientes },
    });
  };

  const handleDeleteCliente = async () => {
    if (!selectedClient) return;
    try {
      await clienteContext.deleteCliente(selectedClient.id);

      toast.success(
        `Cliente ${selectedClient.nickname} com id:${selectedClient.id}, foi deletado com sucesso!`
      );
      fetchData();
    } catch (error) {
      toast.error(
        `Erro ao tentar excluir cliente, contacte o administrador do sistema ${error}`
      );
    } finally {
      setDeleteModal(false);
      setSelectedClient(null);
    }
  };

  const handleOpenDeleteModal = (client: IListCliente) => {
    setModalContent(
      `Tem certeza que deseja deletar o cliente: ${client.nickname}?`
    );
    setSelectedClient(client);
    setDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(false);
    setSelectedClient(null);
    fetchData();
  };

  const { filteredData, handleSearch } = useTableSearch({
    data: clientes,
    searchTerm,
    setPage,
  });

  useEffect(() => {
    handleSearch();
  }, [searchTerm, handleSearch]);

  const nameColumns:  IColumn[] = useMemo(
    () => [
      { field: "code_client", header: "Código", width: "60px" },
      {
        field: "nickname",
        header: "Nome Fantasia",
        width: "190px",
        sortable: true,
      },
      { field: "cnpj_cpf", header: "CNPJ/CPF", width: "190px", sortable: true },
      { field: "city", header: "Cidade", width: "150px" },
      { field: "state", header: "UF", width: "80px" },
    ],
    []
  );

  const renderActionButtons = useCallback(
    (row: any) => (
      <SButtonContainer>
        <CustomButton
          $variant="secondary"
          width="80px"
          onClick={() => handleViewCustomer(row)}
        >
          Detalhes
        </CustomButton>
        <CustomButton
          $variant="primary"
          width="60px"
          onClick={() => handleUpdateCliente(row)}
        >
          Editar
        </CustomButton>
        <CustomButton
          $variant="danger"
          width="60px"
          onClick={() => handleOpenDeleteModal(row)}
        >
          Deletar
        </CustomButton>
      </SButtonContainer>
    ),
    [handleViewCustomer, handleUpdateCliente, handleOpenDeleteModal]
  );

  return (
    <>
      <STitle>Clientes</STitle>
      <BoxContainer>
        <CustomSearch
          width="400px"
          placeholder="Digite o Nome, CNPJ ou Cidade"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CustomButton
          $variant="success"
          width="180px"
          onClick={handleCreateCliente}
        >
          Criar Novo Cliente
        </CustomButton>
      </BoxContainer>

      <CardContent>
        <CustomTable
          data={filteredData}
          columns={nameColumns}
          isLoading={isLoading}
          hasPagination={true}
          actionButtons={renderActionButtons}
          page={page}
          setPage={setPage}
        />
      </CardContent>
      {selectedClient && (
        <ModalDelete
          open={isDeleteModal}
          onClose={handleCloseDeleteModal}
          content={modalContent}
          onConfirm={handleDeleteCliente}
        />
      )}
    </>
  );
}
