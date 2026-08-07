import { ApiResponse } from "../../services/api";
import { CustomerInfo, ContractStatus } from "../ContractContext/types";

export interface IPriceFixationContractsProvider {
  children: JSX.Element;
}

export interface IFixationItem {
  id?: string;
  fixation_contract_id?: string;
  number_contract?: string;
  quantity: number;
  // Preço/saca (BRL), calculado pelo backend a partir de cbot_value/premium/
  // conversion_factor/fobbings/exchange_rate — não é digitado pelo usuário,
  // por isso é opcional aqui (ausente no payload de criação, presente na resposta).
  price?: number;
  type_currency?: string;
  exchange_rate?: number | string;
  exchange_rate_date?: string;
  fixation_date: string;
  reference_month?: string;
  cbot_code?: string;
  cbot_value?: number;
  premium?: number;
  conversion_factor?: number;
  fobbings?: number;
  ppe_usd?: number;
  price_usd_per_saca?: number;
  item_value?: number;
  created_by_name?: string;
  created_by_email?: string;
  created_at?: string;
  pdf_file_name?: string;
  pdf_file_size_kb?: number;
  pdf_pages?: number;
  email_sent?: boolean;
  email_sent_at?: string;
}

// Fixação pendente de envio, já enriquecida com os dados do contrato pai —
// retornada por listPendingFixationItems, consumida pela tela "Enviar Contratos".
export interface IPendingFixationItem extends IFixationItem {
  parent_number_contract: string;
  seller: CustomerInfo;
  buyer: CustomerInfo;
  list_email_seller: string[];
  list_email_buyer: string[];
  contract_emission_date: string;
}

export interface IPriceFixationContractData {
  id?: string;
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
  type_currency?: string;
  price?: number;
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
  total_contract_value?: number;
  quantity_kg: number;
  quantity_bag: number;
  status: ContractStatus;
  number_contract?: string;
  contract_emission_date: string;
  destination: string;
  number_external_contract_buyer: string;
  number_external_contract_seller: string;
  day_exchange_rate?: string;
  payment_date: string;
  farm_direct: string;
  initial_pickup_date: string;
  final_pickup_date: string;
  internal_communication: string;
  complement_destination?: string;
  type_quantity?: string;
  table_id?: string;
  final_quantity: number;
  status_received?: string;
  commission_contract?: number;
  charge_date?: string;
  commission_receipt_date?: string;
  expected_receipt_date?: string;
  total_received?: number;
  contract_emission_datetime?: string;
  commission_seller_contract_value?: number;
  commission_buyer_contract_value?: number;
  commission_seller_exchange_rate?: number;
  commission_buyer_exchange_rate?: number;
  type_commission_seller_currency?: string;
  type_commission_buyer_currency?: string;
  fixation_status?: string;
  fixed_quantity?: number;
  average_fixed_price?: number;
  fixation_items?: IFixationItem[];
}

export interface IPriceFixationContractContext {
  getFixationContractById: (
    contractId: string,
  ) => Promise<ApiResponse<IPriceFixationContractData>>;
  listFixationContracts: () => Promise<any>;
  createFixationContract: (
    contractData: IPriceFixationContractData,
  ) => Promise<any>;
  updateFixationContract: (
    contractId: string,
    contractData: IPriceFixationContractData,
  ) => Promise<any>;
  deleteFixationContract: (
    contractId: string,
    contractData: IPriceFixationContractData,
  ) => Promise<any>;
  addFixationItem: (
    contractId: string,
    item: IFixationItem,
  ) => Promise<any>;
  listFixationItems: (contractId: string) => Promise<ApiResponse<IFixationItem[]>>;
  updateFixationItemPdfMetadata: (
    contractId: string,
    itemId: string,
    metadata: Pick<IFixationItem, "pdf_file_name" | "pdf_file_size_kb" | "pdf_pages">,
  ) => Promise<ApiResponse<IFixationItem>>;
  listPendingFixationItems: () => Promise<ApiResponse<IPendingFixationItem[]>>;
  sendFixationEmail: (
    contractId: string,
    itemId: string,
    data: { sender: string; list_email_seller?: string[]; list_email_buyer?: string[] },
  ) => Promise<any>;
}
