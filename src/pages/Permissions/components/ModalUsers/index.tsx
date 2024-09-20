import { useCallback, useEffect, useState } from "react";
import { Modal } from "../../../../components/Modal";
import CustomTable from "../../../../components/CustomTable";
import { ISelectedUser, ModalUsersProps } from "./types";
import { UserContext } from "../../../../contexts/UserContext";
import { IListUser } from "../../../../contexts/UserContext/types";
import { IColumn } from "../../../../components/CustomTable/types";
import { CustomSearch } from "../../../../components/CustomSearch";
import { SBoxSearch } from "./styles";
import { toast } from "react-toastify";

export function ModalUsers({ open, onClose, onConfirm }: ModalUsersProps) {
  const userContext = UserContext();

  const [users, setUsers] = useState<IListUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ISelectedUser | null>(null);
  const [dataTable, setDataTable] = useState<IListUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const response = await userContext.listUsers();
      setUsers(response.data);
      setDataTable(response.data);
    } catch (error) {
      toast.error(
        `Erro ao tentar ler usuários, contacte o administrador do sistema ${error}`
      );
    }
  }, [useCallback]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (selectedUser) {
      onConfirm(selectedUser);
      onClose();
    }
  };

  const handleSearch = useCallback(() => {
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
  }, [searchTerm, users]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, handleSearch]);

  const nameColumns: IColumn[] = [
    { field: "name", header: "Nome", width: "200px", sortable: true },
    { field: "email", header: "E-mail", width: "800px", sortable: true },
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
        onHandleConfirm={handleConfirm}
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
