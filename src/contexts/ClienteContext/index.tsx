import { createContext, useContext } from "react";
import {
  IClientesProvider,
  ICreateClientesData,
  IUpdateClientesData,
} from "./types";
import { Api } from "../../services/api";

interface IClienteContext {
  listClientes: () => Promise<any>;
  createCliente: (clienteData: ICreateClientesData) => Promise<any>;
  updateCliente: (clientId: string, updateClienteData: any) => void;
  deleteCliente: (clientId: string) => void;
  getClientById: (clientId: string) => void;
}

const newContext = createContext<IClienteContext>({
  listClientes: () => Promise.resolve(),
  createCliente: () => Promise.resolve(),
  updateCliente: () => {},
  deleteCliente: () => {},
  getClientById: () => {},
});

export const ClientesProvider = ({ children }: IClientesProvider) => {
  async function listClientes(): Promise<any> {
    try {
      const response = await Api.get("/clients");

      return response;
    } catch (error) {
      console.error("Erro incluindo Cliente:", error);
      throw error;
    }
  }

  async function createCliente(clienteData: ICreateClientesData): Promise<any> {
    try {
      const response = await Api.post("/client", clienteData);

      return response;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async function updateCliente(
    clientId: string,
    updateClienteData: IUpdateClientesData
  ) {
    try {
      const response = await Api.patch(
        `/client/${clientId}`,
        updateClienteData
      );
      return response;
    } catch (error) {
      console.error("Erro ao salvar dados do Cliente:", error);
    }
  }

  async function deleteCliente(clientId: string) {
    try {
      const response = await Api.delete(`/client/${clientId}`);

      return response;
    } catch (error) {
      console.error("Error ao excluir Cliente:", error);
    }
  }

  async function getClientById(clientId: string) {
    try {
      const response = await Api.get(`/client/client-by-id/${clientId}`);

      return response;
    } catch (error) {
      console.error("Error ao buscar Cliente:", error);
    }
  }

  return (
    <newContext.Provider
      value={{
        listClientes,
        createCliente,
        updateCliente,
        deleteCliente,
        getClientById,
      }}
    >
      {children}
    </newContext.Provider>
  );
};

export const ClienteContext = () => {
  const context = useContext(newContext);

  return context;
};
