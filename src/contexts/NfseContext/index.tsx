import { createContext, useContext } from "react";
import {
    INfseProvider,
    IEnviarLoteRequest,
    IEnviarLoteResponse,
    IConsultarLoteResponse,
} from "./types";
import { Api } from "../../services/api";
import { AxiosError } from "axios";

interface INfseContext {
    enviarLote: (data: IEnviarLoteRequest) => Promise<IEnviarLoteResponse>;
    consultarLote: (protocolo: string) => Promise<IConsultarLoteResponse>;
}

const newContext = createContext<INfseContext>({
    enviarLote: () =>
        Promise.resolve({
            message: "",
            provider: "",
            protocolo: "",
        }),
    consultarLote: () =>
        Promise.resolve({
            message: "",
            provider: "",
            protocolo: "",
        }),
});

export const NfseProvider = ({ children }: INfseProvider) => {
    async function enviarLote(
        data: IEnviarLoteRequest,
    ): Promise<IEnviarLoteResponse> {
        try {
            const response = await Api.post("/nfse/enviar-lote", data);

            return response.data;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
            throw new Error("Erro ao enviar lote de NFSe");
        }
    }

    async function consultarLote(
        protocolo: string,
    ): Promise<IConsultarLoteResponse> {
        try {
            const response = await Api.get(`/nfse/${protocolo}`);

            console.log("Consulta - response: ", response.data);

            return response.data;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage =
                    (err.response.data as { message?: string }).message ||
                    "Erro ao consultar NFSe";
                throw new Error(errorMessage);
            }

            throw new Error("Erro ao consultar NFSe");
        }
    }

    return (
        <newContext.Provider
            value={{
                enviarLote,
                consultarLote,
            }}
        >
            {children}
        </newContext.Provider>
    );
};

export const NfseContext = () => {
    const context = useContext(newContext);
    return context;
};
