/*

import { Api } from "../../services/api";
import { ICreateClienteData, IUpdateClienteData } from "./types";


export const addCliente = async (clienteData: ICreateClienteData) => {
    try {
        const response = await Api.post("/api/cliente", clienteData);
        console.log("util.ts");
        console.log(response);
        return response;
    } catch (error) {
        console.error("Erro incluindo Cliente:", error);
    }
};

export const updateCliente = async (
    clienteCli_codigo: string,
    updateClienteData: IUpdateClienteData
) => {
    try {
        const response = await Api.patch(`/api/cliente/${clienteCli_codigo}`, updateClienteData);
        return response;
    } catch (error) {
        console.error("Erro alterando dados do Cliente:", error);
    }
};
*/
