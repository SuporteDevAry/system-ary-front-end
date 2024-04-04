export interface ModalUsersProps {
  open: boolean;
  onClose: () => void;
  //user: IListUser;
  onConfirm: (selectedUserData: { name: string; email: string }) => void;
}
