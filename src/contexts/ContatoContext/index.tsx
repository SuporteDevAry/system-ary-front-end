import { createContext, useContext } from "react";
import {
    IContatosProvider,
    ICreateContatosData,
    IUpdateContatosData,
} from "./types";
import { Api } from "../../services/api";

interface IContatosContext {
    listContatos: () => Promise<any>;
    createContato: (contatoData: ICreateContatosData) => Promise<any>;
    updateContato: (
        contatoCli_codigo: string,
        contatoSequencia: string,
        updateContatoData: any
    ) => void;
    deleteContato: (
        contatoCli_codigo: string,
        contatoSequencia: string
    ) => void;
}

const newContext = createContext<IContatosContext>({
    listContatos: () => Promise.resolve(),
    createContato: () => Promise.resolve(),
    updateContato: () => {},
    deleteContato: () => {},
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

    async function createContato(
        contatoData: ICreateContatosData
    ): Promise<any> {
        try {
            const response = await Api.post("/contato", contatoData);

            return response;
        } catch (error) {
            throw new Error(`${error}`);
        }
    }

    async function updateContato(
        contatoCli_codigo: string,
        contatoSequencia: string,
        updateContatoData: IUpdateContatosData
    ) {
        try {
            const response = await Api.patch(
                `/contato/${contatoCli_codigo}/${contatoSequencia}`,
                updateContatoData
            );
            return response;
        } catch (error) {
            console.error("Erro gravando dados do Contato:", error);
        }
    }

    async function deleteContato(
        contatoCli_codigo: string,
        contatoSequencia: string
    ) {
        try {
            const response = await Api.delete(
                `/contato/${contatoCli_codigo}/${contatoSequencia}`
            );

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
