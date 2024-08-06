import { useNavigate } from "react-router-dom";
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

export function Clientes() {
    const clienteContext = ClienteContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [clientes, setClientes] = useState<IListCliente[]>([]);
    const [dataTable, setDataTable] = useState<IListCliente[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleteModal, setDeleteModal] = useState<boolean>(false);
    const [selectedClient, setSelectedClient] = useState<IListCliente | null>(
        null
    );
    const [modalContent, setModalContent] = useState<string>("");

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await clienteContext.listClientes();
            setClientes(response.data);
            setDataTable(response.data);
        } catch (error) {
            console.error("Erro lendo clientes:", error);
        } finally {
            setIsLoading(false);
        }
    }, [clienteContext]);

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
            fetchData();
            toast.success(
                `Cliente ${selectedClient.nickname} com id:${selectedClient.id}, foi deletado com sucesso!`
            );
        } catch (error) {
            console.error("Erro excluindo cliente:", error);
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

    const handleSearch = useCallback(() => {
        if (searchTerm.trim() === "") {
            setDataTable(clientes);
        } else {
            const filteredData = clientes.filter((item) =>
                Object.values(item).some((value) =>
                    value
                        .toString()
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                )
            );
            setDataTable(filteredData);
        }
    }, [searchTerm, clientes]);

    useEffect(() => {
        handleSearch();
    }, [searchTerm, handleSearch]);

    const nameColumns = useMemo(
        () => [
            { field: "code_client", header: "Código" },
            { field: "nickname", header: "Nome Fantasia" },
            { field: "cnpj_cpf", header: "CNPJ/CPF" },
            { field: "city", header: "Cidade" },
            { field: "state", header: "UF" },
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
                    data={dataTable}
                    columns={nameColumns}
                    isLoading={isLoading}
                    hasPagination={true}
                    actionButtons={renderActionButtons}
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
