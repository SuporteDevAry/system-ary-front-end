import { createContext, useContext } from "react";
import {
  INfseProvider,
  IEnviarLoteRequest,
  IEnviarLoteResponse,
} from "./types";
import { Api } from "../../services/api";
import { AxiosError } from "axios";

interface INfseContext {
  enviarLote: (data: IEnviarLoteRequest) => Promise<IEnviarLoteResponse>;
}

const newContext = createContext<INfseContext>({
  enviarLote: () =>
    Promise.resolve({
      message: "",
      provider: "",
      protocolo: "",
    }),
});

export const NfseProvider = ({ children }: INfseProvider) => {
  async function enviarLote(
    data: IEnviarLoteRequest
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

  return (
    <newContext.Provider
      value={{
        enviarLote,
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
