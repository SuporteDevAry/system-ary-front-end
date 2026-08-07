import {
  ContractStatus,
  CustomerInfo,
} from "../../../../contexts/ContractContext/types";
import { IFixationItem } from "../../../../contexts/PriceFixationContractContext/types";

export type StepType = {
  label: string;
  elements: JSX.Element[];
};

export type FormDataContract = {
  number_broker: string;
  seller: CustomerInfo;
  buyer: CustomerInfo;
  list_email_seller: string[];
  list_email_buyer: string[];
  product: string;
  name_product: string;
  crop: string;
  quality: string;
  quantity: string;
  type_currency: "Real" | "Dólar" | string;
  // Preço de referência opcional (não é uma fixação de mercado — só um valor
  // inicial informativo até a primeira fixação real ser lançada no histórico).
  price?: string;
  day_exchange_rate?: string;
  type_icms: string;
  icms: string;
  payment: string;
  type_commission_seller?: string;
  commission_seller?: string;
  type_commission_seller_currency?: "Real" | "Dólar" | string;
  commission_seller_exchange_rate?: string;
  type_commission_buyer?: string;
  commission_buyer?: string;
  type_commission_buyer_currency?: "Real" | "Dólar" | string;
  commission_buyer_exchange_rate?: string;
  commission_seller_contract_value?: number;
  commission_buyer_contract_value?: number;
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
  id?: string;
  contract_emission_date: string;
  destination: string;
  complement_destination?: string;
  number_external_contract_buyer: string;
  number_external_contract_seller: string;
  payment_date: string;
  farm_direct: string;
  initial_pickup_date: string;
  final_pickup_date: string;
  internal_communication: string;
  type_quantity?: string;
  table_id?: string;
  final_quantity?: string;
  status_received?: string;
  commission_contract?: number;
  charge_date?: string;
  commission_receipt_date?: string;
  expected_receipt_date?: string;
  total_received?: number;
  // Campos do ciclo de fixação — inexistentes na criação, preenchidos conforme
  // fixações parciais/totais são lançadas no histórico.
  fixation_status?: string;
  fixed_quantity?: number;
  average_fixed_price?: number;
  fixation_items?: IFixationItem[];
};

export interface StepProps {
  id: string;
  formData: FormDataContract;
  handleChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  updateFormData?: (data: Partial<FormDataContract>) => void;
  isEditMode?: boolean;
}
