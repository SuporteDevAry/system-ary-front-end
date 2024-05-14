export type StepType = {
  label: string;
  elements: JSX.Element[];
  /* icon: React.ReactNode; */
};

export type FormDataContract = {
  seller: string;
  buyer: string;
  product: string;
  quality: string;
  quantity: string;
  price: number;
  icms: number;
  payment: string;
  pickup: string;
  pickupLocation: string;
  inspection: string;
  observation: string;
};

export interface StepProps {
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}
