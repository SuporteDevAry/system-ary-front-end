import { IContractData } from "../ContractContext/types";

export interface ISendEmailProvider {
  children: JSX.Element;
}

export interface ISendEmailData {
  contractData: IContractData;
  templateName: string;
  sender: string;
  number_contract: string;
}

export interface ISendEmailContext {
  sendEmail: (emailSendData: ISendEmailData) => Promise<any>;
}
