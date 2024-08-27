export interface IContractsProvider {
  children: JSX.Element;
}

export type CustomerInfo = {
  name: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  cnpj_cpf?: string;
  ins_est?: string;
};

export interface IContractData {
  number_broker: string;
  seller: CustomerInfo;
  buyer: CustomerInfo;
  list_email_seller: string[];
  list_email_buyer: string[];
  product: string;
  name_product: string;
  crop: string;
  quality: string;
  quantity: number;
  type_currency: string;
  price: number;
  type_icms: string;
  icms: string;
  payment: string;
  commission_seller: number;
  commission_buyer: number;
  type_pickup: string;
  pickup: string;
  pickup_location: string;
  inspection: string;
  observation: string;
  owner_contract: string;
  total_contract_value: number;
  quantity_kg: number;
  quantity_bag: number;
}

export interface IContractContext {
  listContracts: () => Promise<any>;
  createContract: (contractData: IContractData) => Promise<any>;
}
