import { ApiResponse } from "../../services/api";
import { IAccounts } from "../ClienteContext/types";

export interface IContractsProvider {
  children: JSX.Element;
}

export type IUserInfo = {
  name: string;
  email: string;
  permissions?: string[];
};

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
  account?: IAccounts[];
};

export type ContractStatus = {
  status_current: string;
  history: Array<{
    date: string;
    time: string;
    status: string;
    owner_change: IUserInfo;
  }>;
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
  type_commission_seller?: string;
  commission_seller?: string;
  type_commission_buyer?: string;
  commission_buyer?: string;
  type_pickup: string;
  pickup: string;
  pickup_location: string;
  inspection: string;
  observation: string;
  owner_contract: string;
  total_contract_value: number;
  quantity_kg: number;
  quantity_bag: number;
  status: ContractStatus;
  number_contract?: string;
  id?: string;
  contract_emission_date: string;
  destination: string;
  number_external_contract_buyer: string;
  number_external_contract_seller: string;
  day_exchange_rate: string;
  payment_date: string;
  farm_direct: string;
  initial_pickup_date: string;
  final_pickup_date: string;
  internal_communication: string;
}

export interface IContractContext {
  getGrainContractById: (
    contractId: string
  ) => Promise<ApiResponse<IContractData>>;
  listContracts: () => Promise<any>;
  createContract: (contractData: IContractData) => Promise<any>;
  updateContract: (
    contractId: string,
    contractData: IContractData
  ) => Promise<any>;
  deleteContract: (
    contractId: string,
    contractData: IContractData
  ) => Promise<any>;
}
