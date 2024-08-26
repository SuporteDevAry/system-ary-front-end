export type StepType = {
  label: string;
  elements: JSX.Element[];
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
};

export type FormDataContract = {
  numberBroker: string;
  seller: CustomerInfo;
  buyer: CustomerInfo;
  listEmailSeller: string;
  listEmailBuyer: string;
  product: string;
  nameProduct: string;
  crop: string;
  quality: string;
  quantity: string;
  typeCurrency: "Real" | "Dólar" | string;
  price: string;
  typeICMS: string;
  icms: string;
  payment: string;
  commissionSeller: string;
  commissionBuyer: string;
  typePickup: string;
  pickup: string;
  pickupLocation: string;
  inspection: string;
  observation: string;
};

export interface StepProps {
  formData: FormDataContract;
  handleChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  updateFormData?: (data: Partial<FormDataContract>) => void;
}
