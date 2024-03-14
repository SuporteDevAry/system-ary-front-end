import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import {
  SButtonContainer,
  SButtonDelete,
  SButtonEdit,
  STableHeaderCell,
  STableRow,
} from "./styles";
import { ClienteContext } from "../../../../contexts/ClienteContext";
import { useEffect, useState } from "react";
import { IListCliente } from "../../../../contexts/ClienteContext/types";
import { useNavigate } from "react-router-dom";
import { insertMaskInCpf } from "../../../../components/insertMaskInCpf";
import { insertMaskInCnpj } from "../../../../components/insertMaskInCnpj";

export function TableClientes() {
  const clienteContext = ClienteContext();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<IListCliente[]>([]);

  const fetchData = async () => {
    try {
      const response = await clienteContext.listClientes();
      setClientes(response.data);
    } catch (error) {
      console.error("Erro lendo clientes:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleUpdateCliente = async (clientes: IListCliente) => {

    navigate("/cliente-editar", {state: {clienteForUpdate: clientes}})
    
  };

  const handleDeleteCliente = (clienteCli_codigo: string) => {
    try {

      
      clienteContext.deleteCliente(clienteCli_codigo);
      fetchData();

    } catch (error) {
      console.error("Erro excluindo cliente:", error);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} size="small" aria-label="custom pagination table">
          <TableHead>
            <STableRow>
              <STableHeaderCell>Código</STableHeaderCell>
              <STableHeaderCell>Nome</STableHeaderCell>
              <STableHeaderCell>CNPJ/CPF</STableHeaderCell>
              <STableHeaderCell>Cidade</STableHeaderCell>
              <STableHeaderCell>UF</STableHeaderCell>
              <STableHeaderCell align="left"></STableHeaderCell>
            </STableRow>
          </TableHead>
          <TableBody>
            {clientes?.map((clientes) => (
              <TableRow
                key={clientes.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {clientes.cli_codigo}
                </TableCell>
                <TableCell align="left">{clientes.nome}</TableCell>
                <TableCell align="left">{clientes.natureza == "F" ? insertMaskInCpf(clientes.cnpj) : insertMaskInCnpj(clientes.cnpj)}</TableCell>
                <TableCell align="left">{clientes.cidade}</TableCell>
                <TableCell align="left">{clientes.uf}</TableCell>
                <TableCell>
                  <SButtonContainer>
                    <SButtonEdit onClick={() => handleUpdateCliente(clientes)}>
                      Editar
                    </SButtonEdit>
                    <SButtonDelete onClick={() => handleDeleteCliente(clientes.cli_codigo)}>
                      Deletar
                    </SButtonDelete>
                  </SButtonContainer>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
