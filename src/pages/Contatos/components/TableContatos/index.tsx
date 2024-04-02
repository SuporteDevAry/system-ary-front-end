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

export interface TClienteContato {
    id: string;
    cli_codigo: string;
    cli_nome: string;
    cnpj: string;
    cidade: string;
    uf: string;
    sequencia: string;
    grupo: string;
    nome: string;
    cargo: string;
    email: string;
    telefone: string;
    celular: string;
    recebe_email: string;
}

export function TableContatos() {
    const contatoContext = ContatoContext();
    const navigate = useNavigate();
    const [contatos, setContatos] = useState<IListContatos[]>([]);

    const clienteContext = ClienteContext();
    const [clientes, setClientes] = useState<IListCliente[]>([]);

    const [objClienteContato, setObjClienteContato] = useState<
        TClienteContato[]
    >([]);

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

    const handleUpdateContato = async (contatos: TClienteContato) => {
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

        const clientesFiltrado = clientes.filter((cliente) => {
            const nome = cliente.nome.toLowerCase();
            const cnpj = cliente.cnpj.toLowerCase();
            const cidade = cliente.cidade.toLowerCase();

            if (nome.includes(lcBusca)) {
                return nome.includes(lcBusca);
            }
            if (cnpj.includes(lcBusca)) {
                return cnpj.includes(lcBusca);
            }
            if (cidade.includes(lcBusca)) {
                return cidade.includes(lcBusca);
            }
        });

        const novoObjClienteContato = clientesFiltrado.flatMap((cliente) => {
            return contatos
                .filter((contato) => contato.cli_codigo === cliente.cli_codigo)
                .map((contato) => ({
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
                    telefone: contato.telefone,
                    celular: contato.celular,
                    cargo: contato.cargo,
                    recebe_email: contato.recebe_email,
                }));
        });

        setObjClienteContato(novoObjClienteContato as TClienteContato[]);

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
                            <STableHeaderCell>Cód</STableHeaderCell>
                            <STableHeaderCell>Nome Cliente</STableHeaderCell>
                            <STableHeaderCell>CNPJ</STableHeaderCell>
                            <STableHeaderCell>Cidade</STableHeaderCell>
                            <STableHeaderCell>UF</STableHeaderCell>
                            <STableHeaderCell>Seq</STableHeaderCell>
                            <STableHeaderCell>Contato</STableHeaderCell>
                            <STableHeaderCell align="left"></STableHeaderCell>
                        </STableRow>
                    </TableHead>
                    <TableBody>
                        {objClienteContato.map(
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
                                        {cliContato.nome}
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
