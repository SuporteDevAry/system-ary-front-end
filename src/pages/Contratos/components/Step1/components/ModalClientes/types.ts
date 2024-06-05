export interface ModalClientesProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedData: {}) => void;

  onConfirm: (selectedUserData: { name: string; }) => void;
}


export interface ISelectedCustomer {
  name: string;
}