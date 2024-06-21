import { useNavigate } from "react-router-dom";
import { TableClientes } from "./components/TableClientes";
import { BoxContainer, ButtonCreate, ButtonImprimir } from "./styles";

import CardContent from "@mui/material/CardContent";
import { ClienteContext } from "../../contexts/ClienteContext";
import { useEffect, useState } from "react";
import { IListCliente } from "../../contexts/ClienteContext/types";

export function Clientes() {
    const clienteContext = ClienteContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [clientes, setClientes] = useState<IListCliente[]>([]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await clienteContext.listClientes();
            setClientes(response.data);
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

    const handleImprimirClientes = () => {
        try {
            const conteudo =
                document?.getElementById("tableClientes")?.innerHTML;

            let estilo = "<style>";
            estilo += "table {width: 100%}";
            estilo +=
                "table, th, td {border: solid 2px #888; border-collapse: collapse;";
            estilo += "padding: 4px 8px; text-align: center;}";
            estilo += "</style>";

            const win = window.open("", "", "heigth=800;width:600");

            win?.document.write("<html><head>");
            win?.document.write("<title>Impressao</title>");
            win?.document.write(estilo);
            win?.document.write("</html></body>");
            win?.document.write(conteudo);
            win?.document.write("</body></html>");

            win?.print();
            win?.close();
        } catch (error) {
            console.error("Erro imprimindo clientes:", error);
        }
    };

    return (
        <>
            <h2>Clientes</h2>
            <BoxContainer>
                <ButtonCreate onClick={handleCreateCliente}>
                    {" "}
                    Criar Novo
                </ButtonCreate>
                <ButtonImprimir onClick={handleImprimirClientes}>
                    {" "}
                    Imprimir
                </ButtonImprimir>
            </BoxContainer>

            <CardContent>
                <TableClientes
                    isLoading={isLoading}
                    data={clientes}
                    onHandleUpdateCliente={handleUpdateCliente}
                    onHandleDeleteCliente={handleDeleteCliente}
                />
            </CardContent>
        </>
    );
}
