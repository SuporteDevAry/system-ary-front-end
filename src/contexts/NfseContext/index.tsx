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
  consultarRps: (rps_number: string) => Promise<IConsultarLoteResponse>;
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
  consultarRps: () =>
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
        const errorMessage = (err.response.data as { message: string }).message;
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

      console.log("Consulta - response: ", response.data);

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

  return (
    <newContext.Provider
      value={{
        enviarLote,
        consultarLote,
        consultarRps,
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
