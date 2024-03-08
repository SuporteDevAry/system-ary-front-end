import { Api } from "../../services/api";
import { ICreateClienteData } from "./types";

interface IUpdateClienteData {
    nome: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    natureza: string;
    cnpj: string;
    ins_est: string;
    ins_mun: string;
    email: string;
    telefone: string;
    celular: string;
    situacao: string;
}

export const addCliente = async (clienteData: ICreateClienteData) => {
    try {
        const response = await Api.post("/api/cliente", clienteData);
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
