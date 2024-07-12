export interface ModalUsersProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedUserData: { name: string; email: string }) => void;
}

export interface ISelectedUser {
  name: string;
  email: string;
}
