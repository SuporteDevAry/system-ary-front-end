import { useNavigate } from "react-router-dom";
import { BoxContainer, SButtonContainer, STitle } from "./styles";

import CardContent from "@mui/material/CardContent";
import { ClienteContext } from "../../contexts/ClienteContext";
import { useEffect, useState } from "react";
import { IListCliente } from "../../contexts/ClienteContext/types";
import CustomTable from "../../components/CustomTable";
import { CustomSearch } from "../../components/CustomSearch";
import CustomButton from "../../components/CustomButton";
import { toast } from "react-toastify";

export function Clientes() {
  const clienteContext = ClienteContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clientes, setClientes] = useState<IListCliente[]>([]);
  const [dataTable, setDataTable] = useState<IListCliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCliente = async () => {
    navigate("/cliente-cadastrar");
  };

  const handleUpdateCliente = async (clientes: IListCliente) => {
    navigate("/cliente-editar", {
      state: { clienteForUpdate: clientes },
    });
  };

  const handleViewCustomer = async (clientes: IListCliente) => {
    navigate("/visualizar-cliente", {
      state: { clientForView: clientes },
    });
  };

  const handleDeleteCliente = (clientId: string) => {
    try {
      clienteContext.deleteCliente(clientId);
      fetchData();
      toast.success(`Cliente com id:${clientId}, foi deletado com sucesso!`);
    } catch (error) {
      console.error("Erro excluindo cliente:", error);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setDataTable(clientes);
    } else {
      const filteredData = clientes.filter((item) =>
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

  const nameColumns = [
    { field: "code_client", header: "Código" },
    { field: "nickname", header: "Nome Fantasia" },
    { field: "cnpj_cpf", header: "CNPJ/CPF" },
    { field: "city", header: "Cidade" },
    { field: "state", header: "UF" },
  ];

  const renderActionButtons = (row: any) => (
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
        onClick={() => handleDeleteCliente(row.id)}
      >
        Deletar
      </CustomButton>
    </SButtonContainer>
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
    </>
  );
}
