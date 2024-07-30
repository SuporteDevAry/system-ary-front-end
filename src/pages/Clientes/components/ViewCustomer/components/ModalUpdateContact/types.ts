import { IListContatos } from "../../../../../../contexts/ContatoContext/types";

export interface ModalUpdateContactProps {
  open: boolean;
  onClose: () => void;
  dataContact: IListContatos;
}
