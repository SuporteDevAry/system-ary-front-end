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

export interface IConsultarLoteRequest {
  protocolo: string;
}

export interface ICancelarNFSeResponse {
  message: string;
  provider: string;
  protocolo: string;
  resultado?: any;
}
export interface IConsultarLoteResponse {
  message: string;
  provider: string;
  protocolo: string;
  resultado?: any;
}

export interface IBuscarIbgePorCepResponse {
  message?: string;
  codigo_ibge?: string;
  ibge?: string;
  codigo_municipio?: string;
  codigo_municipio_ibge?: string;
  municipio_ibge?: string;
  resultado?: any;
  data?: any;
}
