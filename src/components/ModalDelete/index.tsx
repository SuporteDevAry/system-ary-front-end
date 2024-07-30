import { Modal } from "../Modal";
import { IModalDeleteProps } from "./types";

export function ModalDelete({
  open,
  onClose,
  content,
  onConfirm,
}: IModalDeleteProps) {
  const handleClose = () => {
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      titleText={"Atenção!"}
      open={open}
      confirmButton="Deletar"
      cancelButton="Fechar"
      onClose={handleClose}
      onHandleConfirm={handleConfirm}
      variantCancel={"primary"}
      variantConfirm={"danger"}
    >
      <div>{content}</div>
    </Modal>
  );
}
