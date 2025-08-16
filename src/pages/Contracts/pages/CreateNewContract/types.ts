import {
  ContractStatus,
  CustomerInfo,
} from "../../../../contexts/ContractContext/types";

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
  price: string;
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
  complement_destination?: string;
  number_external_contract_buyer: string;
  number_external_contract_seller: string;
  day_exchange_rate: string;
  payment_date: string;
  farm_direct: string;
  initial_pickup_date: string;
  final_pickup_date: string;
  internal_communication: string;
  type_quantity?: string;
  tableId?: string;
};

export interface StepProps {
  id: string;
  formData: FormDataContract;
  handleChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  updateFormData?: (data: Partial<FormDataContract>) => void;
  isEditMode?: boolean;
}
