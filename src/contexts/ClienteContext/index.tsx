import { createContext, useContext } from "react";
import { IClienteProvider, ICreateClienteData } from "./types";
import { Api } from "../../services/api";

interface IClienteContext {
  listClientes: () => Promise<any>;
  createCliente: (clienteData: ICreateClienteData) => Promise<any>;
  updateCliente: (clienteCli_codigo: string, updateClienteData: any) => void;
  deleteCliente: (clienteCli_codigo: string) => void;
}

/*
export interface ICreateClienteData {
  cli_codigo: string;
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
*/

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

const newContext = createContext<IClienteContext>({
  listClientes: () => Promise.resolve([]),
  createCliente: () => Promise.resolve(),
  updateCliente: () => {},
  deleteCliente: () => {},
});

export const ClienteProvider = ({ children }: IClienteProvider) => {
  async function listClientes(): Promise<any> {
    try {
      const response = await Api.get("/clientes");

      console.log("front 2");
      console.table(response);

      return response;
    } catch (error) {
      console.error("Erro incluindo Cliente:", error);
      throw error;
    }
  }

  async function createCliente(clienteData: ICreateClienteData): Promise<any> {
    try {
      const response = await Api.post("/cliente", clienteData);

      return response;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async function updateCliente(clienteCli_codigo: string, updateClienteData: IUpdateClienteData) {
    try {
      const response = await Api.patch(`/cliente/${clienteCli_codigo}`, updateClienteData);
      return response;
    } catch (error) {
      console.error("Erro gravando dados do Cliente:", error);
    }
  }

  async function deleteCliente(clienteCli_codigo: string) {
    try {
      const response = await Api.delete(`/cliente/${clienteCli_codigo}`);

      return response;
    } catch (error) {
      console.error("Error excluindo Cliente:", error);
    }
  }

  return (
    <newContext.Provider
      value={{ listClientes, createCliente, updateCliente, deleteCliente }}
    >
      {children}
    </newContext.Provider>
  );
};

export const ClienteContext = () => {
  const context = useContext(newContext);

  return context;
};
