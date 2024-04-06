import { useEffect, useState } from "react";
import { Modal } from "../../../../components/Modal";
import CustomTable from "../CustomTable";
import { ModalUsersProps } from "./types";
import { UserContext } from "../../../../contexts/UserContext";
import { IListUser } from "../../../../contexts/UserContext/types";
import { IColumn } from "../CustomTable/types";

interface ISelectedUser {
  name: string;
  email: string;
}

export function ModalUsers({ open, onClose, onConfirm }: ModalUsersProps) {
  const userContext = UserContext();

  const [users, setUsers] = useState<IListUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ISelectedUser | null>(null);

  const fetchData = async () => {
    try {
      const response = await userContext.listUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (selectedUser) {
      onConfirm(selectedUser);
      onClose();
    }
  };

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
        <CustomTable
          data={users}
          columns={nameColumns}
          hasCheckbox
          //hasPagination
          onRowClick={(rowData) =>
            setSelectedUser({ name: rowData.name, email: rowData.email })
          }
        />
      </Modal>
    </>
  );
}
