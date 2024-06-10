import { useEffect, useState } from "react";
import { Modal } from "../../../../../../components/Modal";
import { ISelectedCustomer, ModalClientesProps } from "./types";
import CustomTable from "../../../../../../components/CustomTable";
import { IColumn } from "../../../../../../components/CustomTable/types";

export function ModalClientes({
  onClose,
  onConfirm,
  open,
  data,
  loading,
  selectionType,
}: ModalClientesProps) {
  const [selectedCustomer, setSelectedCustomer] =
    useState<ISelectedCustomer | null>(null);

  const handleConfirm = () => {
    if (selectedCustomer) {
      console.log("Salvo no Modal", selectedCustomer);
      onConfirm(selectedCustomer);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    //To Remove
    console.log("Passei no Modal", data);
  }, []);

  const nameColumns: IColumn[] = [
    { field: "nome", header: "Nome" },
    { field: "cnpj", header: "CNPJ/CPF" },
    { field: "cidade", header: "Cidade" },
    { field: "uf", header: "UF" },
  ];

  return (
    <>
      <Modal
        titleText={`Selecione um ${
          selectionType === "buyer" ? "Comprador" : "Vendedor"
        }!`}
        open={open}
        confirmButton="Confirmar"
        cancelButton="Cancelar"
        variantCancel={"primary"}
        variantConfirm={"success"}
        onClose={handleClose}
        onHandleCreate={handleConfirm}
      >
        <CustomTable
          isLoading={loading}
          data={data}
          columns={nameColumns}
          hasCheckbox
          hasPagination
          onRowClick={(rowData) =>
            setSelectedCustomer({ name: rowData.nome, type: selectionType })
          }
        />
      </Modal>
    </>
  );
}
