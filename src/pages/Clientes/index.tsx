import { useNavigate } from "react-router-dom";
import {
  BoxContainer,
  ButtonCreate,
  SButtonContainer,
  SButtonDelete,
  SButtonEdit,
  STitle,
} from "./styles";

import CardContent from "@mui/material/CardContent";
import { ClienteContext } from "../../contexts/ClienteContext";
import { useEffect, useState } from "react";
import { IListCliente } from "../../contexts/ClienteContext/types";
import CustomTable from "../../components/CustomTable";
import { CustomSearch } from "../../components/CustomSearch";

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

  const handleDeleteCliente = (clienteCli_codigo: string) => {
    try {
      clienteContext.deleteCliente(clienteCli_codigo);
      fetchData();
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
    { field: "cli_codigo", header: "Código" },
    { field: "nome", header: "Nome" },
    { field: "cnpj", header: "CNPJ/CPF" },
    { field: "cidade", header: "Cidade" },
    { field: "uf", header: "UF" },
  ];

  const renderActionButtons = (row: any) => (
    <SButtonContainer>
      <SButtonEdit onClick={() => handleUpdateCliente(row)}>Editar</SButtonEdit>
      <SButtonDelete onClick={() => handleDeleteCliente(row.cli_codigo)}>
        Deletar
      </SButtonDelete>
    </SButtonContainer>
  );

  return (
    <>
      <STitle>Clientes</STitle>
      <BoxContainer>
        <CustomSearch
          width="400px"
          placeholder="Digite o Nome ou Código ou CNPJ"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ButtonCreate onClick={handleCreateCliente}> Criar Novo</ButtonCreate>
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
