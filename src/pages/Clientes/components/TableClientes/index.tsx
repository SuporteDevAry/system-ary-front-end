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
import { ModalEditCliente } from "../ModalEditCliente";

export function TableClientes() {
  const clienteContext = ClienteContext();
  const [clientes, setClientes] = useState<IListCliente[]>([]);
  const [isEditClienteModalOpen, setEditClienteModalOpen] = useState<boolean>(false);
  const [clienteForUpdate, setClienteForUpdate] = useState<IListCliente>(
    {} as IListCliente
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await clienteContext.listClientes();
        setClientes(response.data);

        console.log("front table clientes");
        console.table(response);

      } catch (error) {
        console.error("Erro lendo clientes:", error);
      }
    };

    fetchData();
  }, [clientes]);

  const handleCloseEditClienteModal = () => {
    setEditClienteModalOpen(false);
  };

  const handleUpdateCliente = async (cliente: IListCliente) => {
    setEditClienteModalOpen(true);
    setClienteForUpdate(cliente);
  };

  const handleDeleteCliente = (clienteCli_codigo: string) => {
    try {
      clienteContext.deleteCliente(clienteCli_codigo);
    } catch (error) {
      console.error("Erro excluindo cliente:", error);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="simple table">
          <TableHead>
            <STableRow>
              <STableHeaderCell>Código</STableHeaderCell>
              <STableHeaderCell>Nome</STableHeaderCell>
              <STableHeaderCell>CNPJ</STableHeaderCell>
              <STableHeaderCell>Cidade</STableHeaderCell>
              <STableHeaderCell>UF</STableHeaderCell>
              <STableHeaderCell align="left"></STableHeaderCell>
            </STableRow>
          </TableHead>
          <TableBody>
            {clientes?.map((cliente) => (
              <TableRow
                key={cliente.cli_codigo}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {cliente.cli_codigo}
                </TableCell>
                <TableCell align="left">{cliente.nome}</TableCell>
                <TableCell align="left">{cliente.cnpj}</TableCell>
                <TableCell align="left">{cliente.cidade}</TableCell>
                <TableCell align="left">{cliente.uf}</TableCell>
                <TableCell>
                  <SButtonContainer>
                    <SButtonEdit onClick={() => handleUpdateCliente(cliente)}>
                      Editar
                    </SButtonEdit>
                    <SButtonDelete onClick={() => handleDeleteCliente(cliente.cli_codigo)}>
                      Deletar
                    </SButtonDelete>
                  </SButtonContainer>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ModalEditCliente
        open={isEditClienteModalOpen}
        onClose={handleCloseEditClienteModal}
        cliente={clienteForUpdate}
      />
    </>
  );
}
