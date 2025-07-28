import { IListUser } from "../../../../contexts/UserContext/types";

export interface ModalEditUserProps {
  open: boolean;
  onClose: () => void;
  user: IListUser;
  readOnly?: boolean;
  titleText?: string;
}
