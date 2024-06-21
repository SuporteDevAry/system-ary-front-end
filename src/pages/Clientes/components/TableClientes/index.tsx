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

import { insertMaskInCpf } from "../../../../helpers/front-end/insertMaskInCpf";
import { insertMaskInCnpj } from "../../../../helpers/front-end/insertMaskInCnpj";
import { ITableClientesProps } from "./types";

export function TableClientes({
    data,
    isLoading,
    onHandleUpdateCliente,
    onHandleDeleteCliente,
}: ITableClientesProps) {
    return (
        <>
            <TableContainer component={Paper}>
                <Table
                    id="tableClientes"
                    sx={{ minWidth: 700 }}
                    size="small"
                    aria-label="custom pagination table"
                >
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
                        {isLoading ? (
                            <p> Loading ...</p> // criar um gif animado para por aqui
                        ) : (
                            data?.map((clientes) => (
                                <TableRow
                                    key={clientes.id}
                                    sx={{
                                        "&:last-child td, &:last-child th": {
                                            border: 0,
                                        },
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        {clientes.cli_codigo}
                                    </TableCell>
                                    <TableCell align="left">
                                        {clientes.nome}
                                    </TableCell>
                                    <TableCell align="left">
                                        {clientes.natureza == "F"
                                            ? insertMaskInCpf(clientes.cnpj)
                                            : insertMaskInCnpj(clientes.cnpj)}
                                    </TableCell>
                                    <TableCell align="left">
                                        {clientes.cidade}
                                    </TableCell>
                                    <TableCell align="left">
                                        {clientes.uf}
                                    </TableCell>
                                    <TableCell>
                                        <SButtonContainer>
                                            <SButtonEdit
                                                onClick={() =>
                                                    onHandleUpdateCliente(
                                                        clientes
                                                    )
                                                }
                                            >
                                                Editar
                                            </SButtonEdit>
                                            <SButtonDelete
                                                onClick={() =>
                                                    onHandleDeleteCliente(
                                                        clientes.cli_codigo
                                                    )
                                                }
                                            >
                                                Deletar
                                            </SButtonDelete>
                                        </SButtonContainer>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
