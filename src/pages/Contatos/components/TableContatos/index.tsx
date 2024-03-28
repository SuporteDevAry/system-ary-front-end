import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import {
    SButtonContainer,
    SButtonDelete,
    SButtonEdit,
    STableHeaderCell,
    STableRow,
} from "./styles";
import { ContatoContext } from "../../../../contexts/ContatoContext";
import { useEffect, useState } from "react";
import { IListContatos } from "../../../../contexts/ContatoContext/types";
import { useNavigate } from "react-router-dom";

import { Divider, IconButton, InputBase, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ClienteContext } from "../../../../contexts/ClienteContext";
import { IListCliente } from "../../../../contexts/ClienteContext/types";

const objClienteContato: Record<string, any> = { data: [] };

export function TableContatos() {
    const contatoContext = ContatoContext();
    const navigate = useNavigate();
    const [contatos, setContatos] = useState<IListContatos[]>([]);

    const clienteContext = ClienteContext();
    const [clientes, setClientes] = useState<IListCliente[]>([]);

    type TClienteContato = {
        id: string;
        cli_codigo: string;
        cli_nome: string;
        cnpj: string;
        cidade: string;
        uf: string;
        sequencia: string;
        grupo: string;
        nome: string;
        email: string;
    };

    const fetchData = async () => {
        try {
            const response = await contatoContext.listContatos();
            setContatos(response.data);

            const resCliente = await clienteContext.listClientes();
            setClientes(resCliente.data);
        } catch (error) {
            console.error("Erro lendo contatos:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateContato = async (contatos: IListContatos) => {
        navigate("/contatos-editar", { state: { contatoForUpdate: contatos } });
    };

    const handleDeleteContato = (
        contatoCli_codigo: string,
        contatoSequencia: string
    ) => {
        try {
            contatoContext.deleteContato(contatoCli_codigo, contatoSequencia);
            fetchData();
        } catch (error) {
            console.error("Erro excluindo contato:", error);
        }
    };

    const [busca, setBusca] = useState("");

    const handleSearch = async () => {
        const lcBusca = busca.toLowerCase();

        var clientesFiltrado = clientes.filter(function (cliente: {
            nome: any;
        }) {
            var nome = cliente.nome.toLowerCase();
            var lcNome = nome.match(lcBusca);
            return lcNome == lcBusca;
        });

        //console.log('busca', lcBusca);
        //console.log('clientes', clientes);
        //console.log("contatos", contatos);
        //console.log("clientesFiltrado", clientesFiltrado);

        //var clienteContato = [{}];

        objClienteContato.data = [];

        clientesFiltrado.map((cliente) => {
            contatos.map((contato) => {
                if (cliente.cli_codigo == contato.cli_codigo) {
                    objClienteContato?.data.push({
                        id: contato.id,
                        cli_codigo: cliente.cli_codigo,
                        cli_nome: cliente.nome,
                        cnpj: cliente.cnpj,
                        cidade: cliente.cidade,
                        uf: cliente.uf,
                        sequencia: contato.sequencia,
                        grupo: contato.grupo,
                        nome: contato.nome,
                        email: contato.email,
                    });
                }
            });
        });

        //console.log("clienteContato", objClienteContato);

        fetchData();
    };

    return (
        <>
            <Paper
                component="form"
                sx={{
                    p: "2px 4px",
                    display: "flex",
                    alignItems: "left",
                    width: 500,
                    marginRight: 10,
                }}
            >
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    name={busca}
                    onBlur={(ev) => setBusca(ev.target.value)}
                    placeholder="Use parte do Nome, CNPJ ou Cidade"
                    inputProps={{
                        "aria-label": "Use parte do Nome, CNPJ ou Cidade",
                    }}
                />
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton
                    type="button"
                    sx={{ p: "10px" }}
                    aria-label="search"
                    color="warning"
                    onClick={handleSearch}
                >
                    <SearchIcon />
                </IconButton>
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            </Paper>
            <TableContainer component={Paper}>
                <Table
                    sx={{ minWidth: 700 }}
                    size="small"
                    aria-label="custom pagination table"
                >
                    <TableHead>
                        <STableRow>
                            <STableHeaderCell>Cód.Cliente</STableHeaderCell>
                            <STableHeaderCell>Nome Cliente</STableHeaderCell>
                            <STableHeaderCell>CNPJ</STableHeaderCell>
                            <STableHeaderCell>Cidade</STableHeaderCell>
                            <STableHeaderCell>UF</STableHeaderCell>
                            <STableHeaderCell>Seq</STableHeaderCell>
                            <STableHeaderCell>Grupo</STableHeaderCell>
                            <STableHeaderCell>Nome</STableHeaderCell>
                            <STableHeaderCell>E-mail</STableHeaderCell>
                            <STableHeaderCell align="left"></STableHeaderCell>
                        </STableRow>
                    </TableHead>
                    <TableBody>
                        {objClienteContato.data.map(
                            (cliContato: TClienteContato) => (
                                <TableRow
                                    key={cliContato.id}
                                    sx={{
                                        "&:last-child td, &:last-child th": {
                                            border: 0,
                                        },
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        {cliContato.cli_codigo}
                                    </TableCell>
                                    <TableCell align="left">
                                        {cliContato.cli_nome}
                                    </TableCell>
                                    <TableCell align="left">
                                        {cliContato.cnpj}
                                    </TableCell>
                                    <TableCell align="left">
                                        {cliContato.cidade}
                                    </TableCell>
                                    <TableCell align="left">
                                        {cliContato.uf}
                                    </TableCell>
                                    <TableCell align="left">
                                        {cliContato.sequencia}
                                    </TableCell>
                                    <TableCell align="left">
                                        {cliContato.grupo}
                                    </TableCell>
                                    <TableCell align="left">
                                        {cliContato.nome}
                                    </TableCell>
                                    <TableCell align="left">
                                        {cliContato.email}
                                    </TableCell>
                                    <TableCell>
                                        <SButtonContainer>
                                            <SButtonEdit
                                                onClick={() =>
                                                    handleUpdateContato(
                                                        cliContato
                                                    )
                                                }
                                            >
                                                Editar
                                            </SButtonEdit>
                                            <SButtonDelete
                                                onClick={() =>
                                                    handleDeleteContato(
                                                        cliContato.cli_codigo,
                                                        cliContato.sequencia
                                                    )
                                                }
                                            >
                                                Deletar
                                            </SButtonDelete>
                                        </SButtonContainer>
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
