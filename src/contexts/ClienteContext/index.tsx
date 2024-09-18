import { createContext, useContext } from "react";
import {
  IClientesProvider,
  ICreateClientesData,
  IUpdateClientesData,
} from "./types";
import { Api } from "../../services/api";
import { AxiosError } from "axios";

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
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
    }
  }

  async function createCliente(clienteData: ICreateClientesData): Promise<any> {
    try {
      const response = await Api.post("/client", clienteData);

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
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
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
    }
  }

  async function deleteCliente(clientId: string) {
    try {
      const response = await Api.delete(`/client/${clientId}`);

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
    }
  }

  async function getClientById(clientId: string) {
    try {
      const response = await Api.get(`/client/client-by-id/${clientId}`);

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
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
