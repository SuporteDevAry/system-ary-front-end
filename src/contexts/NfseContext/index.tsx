import { createContext, useContext } from "react";
import {
    INfseProvider,
    IEnviarLoteRequest,
    IEnviarLoteResponse,
    IConsultarLoteResponse,
    IBuscarIbgePorCepResponse,
    ICancelarNFSeResponse,
} from "./types";
import { Api } from "../../services/api";
import { AxiosError } from "axios";

interface INfseContext {
    enviarLote: (data: IEnviarLoteRequest) => Promise<IEnviarLoteResponse>;
    consultarLote: (protocolo: string) => Promise<IConsultarLoteResponse>;
    cancelarNFSe: (
        lote: string,
        justificativa: string,
    ) => Promise<ICancelarNFSeResponse>;
    consultarRps: (rps_number: string) => Promise<IConsultarLoteResponse>;
    buscarIbgePorCep: (cep: string) => Promise<IBuscarIbgePorCepResponse>;
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
    cancelarNFSe: (_lote: string, _justificativa: string) =>
        Promise.resolve({
            message: "",
            provider: "",
            protocolo: "",
        }),
    consultarRps: () =>
        Promise.resolve({
            message: "",
            provider: "",
            protocolo: "",
        }),
    buscarIbgePorCep: () =>
        Promise.resolve({
            message: "",
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
            const response = await Api.get(`/nfse/consultar-lote/${protocolo}`);

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async function cancelarNFSe(
        lote: string,
        justificativa: string,
    ): Promise<ICancelarNFSeResponse> {
        const loteBase = String(lote || "").trim();
        const justificativaBase = String(justificativa || "").trim();

        if (!loteBase) {
            throw new Error("Lote inválido para cancelamento de NFSe");
        }

        if (!justificativaBase) {
            throw new Error("Justificativa inválida para cancelamento de NFSe");
        }

        const body = { justificativa: justificativaBase };
        const endpoint = `/nfse/${encodeURIComponent(loteBase)}`;

        try {
            const response = await Api.delete(endpoint, {
                data: body,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Consulta status de uma RPS individual
    async function consultarRps(
        rps_number: string,
    ): Promise<IConsultarLoteResponse> {
        try {
            const response = await Api.get(`/nfse/consultar-rps/${rps_number}`);
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            if (err.response && err.response.data) {
                const errorMessage =
                    (err.response.data as { message?: string }).message ||
                    "Erro ao consultar RPS";
                throw new Error(errorMessage);
            }
            throw new Error("Erro ao consultar RPS");
        }
    }

    async function buscarIbgePorCep(
        cep: string,
    ): Promise<IBuscarIbgePorCepResponse> {
        const cepLimpo = String(cep || "").replace(/\D/g, "");

        if (!cepLimpo) {
            throw new Error("CEP invalido para consulta do IBGE");
        }

        const extractCode = (payload: any) => {
            if (!payload) return "";

            if (typeof payload === "string") {
                const normalized = payload.replace(/\D/g, "");
                return normalized.length === 7 ? normalized : "";
            }

            const candidates = [
                payload,
                payload?.data,
                payload?.resultado,
                payload?.resultado?.data,
                payload?.data?.resultado,
            ];

            for (const item of candidates) {
                const rawCode =
                    item?.codigo_ibge ||
                    item?.codigo_municipio_ibge ||
                    item?.codigo_municipio ||
                    item?.municipio_ibge ||
                    item?.ibge ||
                    item?.codigoIBGE ||
                    item?.codigoIbge;

                const normalized = String(rawCode || "").replace(/\D/g, "");

                if (normalized.length === 7) {
                    return normalized;
                }
            }

            return "";
        };

        const resolveFromBackend = async () => {
            const candidatePaths = [
                `/nfse/buscarIbgePorCep/${cepLimpo}`,
                `/nfse/buscar-ibge-por-cep/${cepLimpo}`,
                `/nfse/buscarIbgePorCep?cep=${cepLimpo}`,
                `/nfse/buscar-ibge-por-cep?cep=${cepLimpo}`,
            ];

            let lastError: unknown = null;

            for (const path of candidatePaths) {
                try {
                    const response = await Api.get(path);
                    const payload = response.data;
                    const codigo_ibge = extractCode(payload);

                    if (!codigo_ibge) {
                        throw new Error(
                            "O backend nao retornou um codigo IBGE valido",
                        );
                    }

                    if (typeof payload === "string") {
                        return { codigo_ibge };
                    }

                    return {
                        ...payload,
                        codigo_ibge,
                    };
                } catch (error) {
                    lastError = error;
                }
            }

            const err = lastError as AxiosError;
            if (err?.response?.data) {
                const errorMessage =
                    (err.response.data as { message?: string }).message ||
                    "Erro ao buscar IBGE por CEP";
                throw new Error(errorMessage);
            }

            throw new Error("Erro ao buscar IBGE por CEP");
        };

        const resolveFromViaCep = async () => {
            const viaCepBaseUrl =
                process.env.REACT_APP_URL_VIA_CEP || "https://viacep.com.br/ws";
            const response = await fetch(`${viaCepBaseUrl}/${cepLimpo}/json/`);

            if (!response.ok) {
                throw new Error("ViaCEP retornou um status invalido.");
            }

            const payload = await response.json();
            const codigo_ibge = extractCode(payload);

            if (!codigo_ibge) {
                throw new Error(
                    `ViaCEP nao retornou codigo IBGE para o CEP: ${cepLimpo}`,
                );
            }

            return {
                ...payload,
                codigo_ibge,
            };
        };

        try {
            return await resolveFromBackend();
        } catch {
            return await resolveFromViaCep();
        }
    }

    return (
        <newContext.Provider
            value={{
                enviarLote,
                consultarLote,
                cancelarNFSe,
                consultarRps,
                buscarIbgePorCep,
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
