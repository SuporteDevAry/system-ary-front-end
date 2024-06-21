import { useEffect, useState } from "react";
import { Modal } from "../../../../components/Modal";
import CustomTable from "../../../../components/CustomTable";
import { ISelectedUser, ModalUsersProps } from "./types";
import { UserContext } from "../../../../contexts/UserContext";
import { IListUser } from "../../../../contexts/UserContext/types";
import { IColumn } from "../../../../components/CustomTable/types";
import { CustomSearch } from "../../../../components/CustomSearch";
import { SBoxSearch } from "./styles";

export function ModalUsers({ open, onClose, onConfirm }: ModalUsersProps) {
  const userContext = UserContext();

  const [users, setUsers] = useState<IListUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ISelectedUser | null>(null);
  const [dataTable, setDataTable] = useState<IListUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const response = await userContext.listUsers();
      setUsers(response.data);
      setDataTable(response.data);
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

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setDataTable(users);
    } else {
      const filteredData = users.filter((item) =>
        Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setDataTable(filteredData);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

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
        maxWidth="md"
        fullWidth
      >
        <SBoxSearch>
          <CustomSearch
            width="400px"
            placeholder="Digite o nome ou o e-mail do usuário!"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SBoxSearch>
        <CustomTable
          data={dataTable}
          columns={nameColumns}
          hasCheckbox
          hasPagination
          onRowClick={(rowData) =>
            setSelectedUser({ name: rowData.name, email: rowData.email })
          }
        />
      </Modal>
    </>
  );
}
