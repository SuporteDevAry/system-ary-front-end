export interface IBrokerProvider {
  children: JSX.Element;
}

export interface IBroker {
  id: string;
  mesa: string;
  broker: string;
  product: string;
  broker_name: string;
  broker_nick: string;
  broker_abbrev: string;
  company_name: string;
  cnpj_cpf: string;
  bank_number: string;
  bank_name: string;
  ag_number: string;
  account_number: string;
  date_ini: string;
  date_fin: string;
  commision: number;
  cctipo: string;
  ccdesconto: number;
  sca: string;
  aj_prolab: number;
  created_at: string;
  updated_at: string;
}

export interface ICreateBrokerData
  extends Omit<IBroker, "id" | "created_at" | "updated_at"> {}

export interface IUpdateBrokerData
  extends Partial<Omit<IBroker, "id" | "created_at" | "updated_at">> {}
