import { createContext, useContext } from "react";
import {
  IContatosContext,
  IContatosProvider,
  ICreateContatosData,
  IUpdateContatosData,
} from "./types";
import { Api } from "../../services/api";
import { AxiosError } from "axios";

const newContext = createContext<IContatosContext>({
  listContatos: () => Promise.resolve(),
  createContato: () => Promise.resolve(),
  updateContato: () => {},
  deleteContato: () => {},
  getContactsByClient: () => Promise.resolve(),
});

export const ContatosProvider = ({ children }: IContatosProvider) => {
  async function listContatos(): Promise<any> {
    try {
      const response = await Api.get("/contatos");
      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
    }
  }

  async function getContactsByClient(clientId: string): Promise<any> {
    try {
      const response = await Api.get(`/contact/${clientId}`);

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
    }
  }

  async function createContato(contatoData: ICreateContatosData): Promise<any> {
    try {
      const response = await Api.post("/contact", contatoData);

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
    }
  }

  async function updateContato(
    contactId: string,
    updateContatoData: IUpdateContatosData
  ) {
    try {
      const response = await Api.patch(
        `/contact/${contactId}`,
        updateContatoData
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

  async function deleteContato(contactId: string) {
    try {
      const response = await Api.delete(`/contact/${contactId}/`);

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
        listContatos,
        createContato,
        updateContato,
        deleteContato,
        getContactsByClient,
      }}
    >
      {children}
    </newContext.Provider>
  );
};

export const ContatoContext = () => {
  const context = useContext(newContext);

  return context;
};
