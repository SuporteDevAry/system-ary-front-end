import { useEffect, useState } from "react";
import { Modal } from "../../../../../../components/Modal";
import { ISelectedCustomer, ModalClientesProps } from "./types";
import CustomTable from "../../../../../../components/CustomTable";
import { IColumn } from "../../../../../../components/CustomTable/types";

export function ModalClientes({
  onClose,
  onConfirm,
  open,
}: ModalClientesProps) {
  const [selectedCustomer, setSelectedCustomer] =
    useState<ISelectedCustomer | null>(null);

  const handleConfirm = () => {
    if (selectedCustomer) {
      onConfirm(selectedCustomer);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    console.log("Passei no Modal", open);
  }, []);

  const nameColumns: IColumn[] = [
    { field: "name", header: "Nome" },
    { field: "email", header: "E-mail" },
  ];

  return (
    <>
      <Modal
        titleText={"Selecione o usuário, que deseja alterar as permissões!"}
        open={open}
        confirmButton="Confirmar"
        cancelButton="Cancelar"
        variantCancel={"primary"}
        variantConfirm={"success"}
        onClose={handleClose}
        onHandleCreate={handleConfirm}
      >
        {
          <>
            <p>Search</p>
            <p>Button</p>
            <p>Tabela</p>
          </>
        }

        <CustomTable
          data={[]}
          columns={nameColumns}
          hasCheckbox
          //hasPagination
          onRowClick={(rowData) => setSelectedCustomer({ name: rowData.name })}
        />
      </Modal>
    </>
  );
}
