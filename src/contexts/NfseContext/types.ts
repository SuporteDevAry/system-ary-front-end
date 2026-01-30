export interface INfseProvider {
  children: JSX.Element;
}

export interface IEnviarLoteRequest {
  xml: string;
  provider?: "focusnfe" | "prefeitura";
}

export interface IEnviarLoteResponse {
  message: string;
  provider: string;
  protocolo: string;
  resultado?: any;
}
