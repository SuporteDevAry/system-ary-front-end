import { createContext, useContext } from "react";
import { IClientesProvider, ICreateClientesData, IUpdateClientesData } from "./types";
import { Api } from "../../services/api"; 

interface IClienteContext {
  listClientes: () => Promise<any>;
  createCliente: (clienteData: ICreateClientesData) => Promise<any>;
  updateCliente: (clienteCli_codigo: string, updateClienteData: any) => void;
  deleteCliente: (clienteCli_codigo: string) => void;
}

const newContext = createContext<IClienteContext>({
  listClientes: () => Promise.resolve(),
  createCliente: () => Promise.resolve(),
  updateCliente: () => {},
  deleteCliente: () => {},
});

export const ClientesProvider = ({ children }: IClientesProvider) => {

  async function listClientes(): Promise<any> {
    try {
      const response = await Api.get("/clientes");
      return response;
    } catch (error) {
      console.error("Erro incluindo Cliente:", error);
      throw error;
    }
  }

  async function createCliente(clienteData: ICreateClientesData): Promise<any> {
    try {
      const response = await Api.post("/cliente", clienteData);

      return response;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async function updateCliente(clienteCli_codigo: string, updateClienteData: IUpdateClientesData) {
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
