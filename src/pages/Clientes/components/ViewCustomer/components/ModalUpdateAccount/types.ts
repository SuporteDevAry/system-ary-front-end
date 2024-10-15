import { IListAccounts } from "../../../../../../contexts/ClienteContext/types";

export interface ModalUpdateAccountProps {
  open: boolean;
  onClose: () => void;
  dataAccount: IListAccounts;
  codeCliente: string;
}
