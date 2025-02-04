import { IContractData } from "../../../../contexts/ContractContext/types";

export type StepType = {
  label: string;
  elements: JSX.Element[];
};

export interface FormDataSendContract extends IContractData {
  //list_email_ocult_copy: string[];
}

export interface StepProps {
  id: string;
  formData?: FormDataSendContract;
  handleChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  updateFormData?: (data: Partial<FormDataSendContract>) => void;
}
