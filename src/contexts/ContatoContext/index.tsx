import { createContext, useContext } from "react";
import {
  IContatosContext,
  IContatosProvider,
  ICreateContatosData,
  IUpdateContatosData,
} from "./types";
import { Api } from "../../services/api";

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
      console.error("Erro listando Contatos:", error);
      throw error;
    }
  }

  async function getContactsByClient(clientId: string): Promise<any> {
    try {
      const response = await Api.get(`/contact/${clientId}`);

      return response;
    } catch (error) {
      console.error("Error ao buscar Contatos por Cliente:", error);
    }
  }

  async function createContato(contatoData: ICreateContatosData): Promise<any> {
    try {
      const response = await Api.post("/contact", contatoData);

      return response;
    } catch (error) {
      throw new Error(`${error}`);
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
      console.error("Erro gravando dados do Contato:", error);
    }
  }

  async function deleteContato(contactId: string) {
    try {
      const response = await Api.delete(`/contact/${contactId}/`);

      return response;
    } catch (error) {
      console.error("Error excluindo Contato:", error);
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
