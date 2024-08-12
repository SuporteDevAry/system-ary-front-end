export type StepType = {
  label: string;
  elements: JSX.Element[];
};

export type FormDataContract = {
  numberBroker: string;
  seller: string;
  buyer: string;
  listEmailSeller: string;
  listEmailBuyer: string;
  product: string;
  nameProduct: string;
  crop: string;
  quality: string;
  quantity: string;
  price: string;
  typeCurrency: "Real" | "Dólar" | string;
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
