export type StepType = {
  label: string;
  elements: JSX.Element[];
};

export type FormDataSendContract = {
  list_email_seller: string[];
  list_email_buyer: string[];
  list_email_ocult_copy: string[];
  number_contract?: string;
  sended_contract: boolean;
};

export interface StepProps {
  id: string;
  formData: FormDataSendContract;
  handleChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  updateFormData?: (data: Partial<FormDataSendContract>) => void;
}
