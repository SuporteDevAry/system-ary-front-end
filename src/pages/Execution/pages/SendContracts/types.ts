import { IContractData } from "../../../../contexts/ContractContext/types";

export type StepType = {
  label: string;
  elements: JSX.Element[];
};

export interface FormDataSendContract extends IContractData {
  copy_correct: string;
  // Presente somente quando type_contract === "AF": id do contrato pai
  // (o "id" do formData nesse caso é o id do próprio item de fixação).
  fixation_contract_id?: string;
}

export interface StepProps {
  id: string;
  formData?: FormDataSendContract;
  handleChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  updateFormData?: (data: Partial<FormDataSendContract>) => void;
}
