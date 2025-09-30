import { IContractData } from "../../../../../../../../contexts/ContractContext/types";

export interface IModalEditQuantityProps {
  open: boolean;
  dataContract: IContractData | null;
  onClose: () => void;
  onConfirm: () => void;
  onHandleChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } }
  ) => void;
}
