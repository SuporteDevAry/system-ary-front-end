export interface IClientesProvider {
  children: JSX.Element;
}

export interface IClientes {
  id: string;
  code_client: string;
  nickname: string;
  name: string;
  address: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
  kind: string;
  cnpj_cpf: string;
  ins_est: string;
  ins_mun: string;
  telephone: string;
  cellphone: string;
  situation: string;
  created_at: string;
  updated_at: string;
}

export interface ICreateClientesData
  extends Omit<IClientes, "id" | "code_client" | "created_at" | "updated_at"> {}

export interface IUpdateClientesData
  extends Omit<IClientes, "id" | "code_client" | "created_at" | "updated_at"> {}

export interface IListCliente extends IClientes {
  [key: string]: any;
}
