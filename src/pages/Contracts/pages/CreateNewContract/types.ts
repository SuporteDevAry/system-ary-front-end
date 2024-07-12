export type StepType = {
  label: string;
  elements: JSX.Element[];
};

export type FormDataContract = {
  numberBroker: string;
  seller: string;
  buyer: string;
  product: string;
  nameProduct: string;
  crop: string;
  quality: string;
  quantity: string;
  price: string;
  icms: string;
  payment: string;
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
