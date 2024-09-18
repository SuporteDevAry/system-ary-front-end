import { IListCliente } from "../../../../../../../../contexts/ClienteContext/types";
import { CustomerInfo } from "../../../../../../../../contexts/ContractContext/types";

export interface ModalClientesProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (
    selectedCustomerData: CustomerInfo & { type: "buyer" | "seller" }
  ) => void;
  data: IListCliente[];
  loading: boolean;
  selectionType: "seller" | "buyer";
}

export interface ISelectedCustomer extends CustomerInfo {
  type: "seller" | "buyer";
}
