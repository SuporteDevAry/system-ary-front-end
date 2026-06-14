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
    cancelarNFSe: (protocolo: string) => Promise<ICancelarNFSeResponse>;
    consultarRps: (rps_number: string) => Promise<IConsultarLoteResponse>;
    buscarIbgePorCep: (cep: string) => Promise<IBuscarIbgePorCepResponse>;
    buscarXmlPorCaminho: (caminho: string) => Promise<string>;
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
    cancelarNFSe: () =>
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
    buscarXmlPorCaminho: () => Promise.resolve(""),
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

            console.log("consultarLote", response.data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async function cancelarNFSe(
        protocolo: string,
    ): Promise<ICancelarNFSeResponse> {
        const protocoloBase = String(protocolo || "").trim();

        if (!protocoloBase) {
            throw new Error("Protocolo inválido para cancelamento de NFSe");
        }

        const candidateProtocoloPaths = [
            protocoloBase,
            /^LOTE-/i.test(protocoloBase)
                ? protocoloBase.replace(/^LOTE-/i, "")
                : `LOTE-${protocoloBase}`,
        ];

        const candidateEndpoints = [
            (value: string) => `/nfse/cancelar/${value}`,
            (value: string) => `/nfse/cancelar-lote/${value}`,
        ];

        let lastError: unknown = null;

        for (const currentProtocolo of candidateProtocoloPaths) {
            const encodedProtocolo = encodeURIComponent(currentProtocolo);
            for (const buildEndpoint of candidateEndpoints) {
                const endpoint = buildEndpoint(encodedProtocolo);

                try {
                    const response = await Api.post(endpoint);

                    console.log("Cancelamento - response: ", response.data);

                    return response.data;
                } catch (error) {
                    lastError = error;

                    try {
                        const response = await Api.delete(endpoint);

                        console.log("Cancelamento - response: ", response.data);

                        return response.data;
                    } catch (deleteError) {
                        lastError = deleteError;
                    }
                }
            }
        }

        throw lastError;
    }

    // Consulta status de uma RPS individual
    async function consultarRps(
        rps_number: string,
    ): Promise<IConsultarLoteResponse> {
        try {
            const response = await Api.get(`/nfse/consultar-rps/${rps_number}`);
            console.log("Consulta RPS - response: ", response.data);
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

    async function buscarXmlPorCaminho(caminho: string): Promise<string> {
        const caminhoTrimmed = String(caminho || "").trim();

        if (!caminhoTrimmed) {
            throw new Error("Caminho do XML inválido");
        }

        const S3_BASE_URL = "https://focusnfe.s3.sa-east-1.amazonaws.com";

        const fullUrl = /^https?:\/\//i.test(caminhoTrimmed)
            ? caminhoTrimmed
            : `${S3_BASE_URL}${caminhoTrimmed.startsWith("/") ? "" : "/"}${caminhoTrimmed}`;

        // Tenta via backend (evita CORS com S3)
        try {
            const backendResponse = await Api.get(
                `/nfse/buscar-xml-por-caminho?url=${encodeURIComponent(fullUrl)}`,
            );
            const data = backendResponse.data;
            if (typeof data === "string" && data.trim()) return data;
            const content =
                data?.xml || data?.xml_nfse || data?.conteudo || data?.content;
            if (typeof content === "string" && content.trim()) return content;
        } catch {
            // backend não tem o endpoint — tenta fetch direto
        }

        // Tenta fetch direto no S3
        const s3Response = await fetch(fullUrl);
        if (!s3Response.ok) {
            throw new Error(
                `Falha ao buscar XML no S3 (HTTP ${s3Response.status}): ${fullUrl}`,
            );
        }
        return s3Response.text();
    }

    return (
        <newContext.Provider
            value={{
                enviarLote,
                consultarLote,
                cancelarNFSe,
                consultarRps,
                buscarIbgePorCep,
                buscarXmlPorCaminho,
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
