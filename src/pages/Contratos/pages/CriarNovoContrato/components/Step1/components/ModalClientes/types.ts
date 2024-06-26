import { IListCliente } from "../../../../../../../../contexts/ClienteContext/types";

export interface ModalClientesProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedCustomerData: { name: string; type: string }) => void;
  data: IListCliente[];
  loading: boolean;
  selectionType: string;
}

export interface ISelectedCustomer {
  name: string;
  type: string;
}
