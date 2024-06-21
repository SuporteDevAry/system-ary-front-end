import { useEffect, useState } from "react";
import { ModalCreateNewUser } from "./components/ModalCreateNewUser";
import { TableUsers } from "./components/TableUsers";
import { BoxContainer, STitle } from "./styles";
import CardContent from "@mui/material/CardContent";
import CustomButton from "../../components/CustomButton";
import { ModalEditUser } from "./components/ModalEditUser";
import { UserContext } from "../../contexts/UserContext";
import { IListUser } from "../../contexts/UserContext/types";
import { toast } from "react-toastify";
import { CustomSearch } from "../../components/CustomSearch";

export function Users() {
  const userContext = UserContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<IListUser[]>([]);
  const [isNewUserModalOpen, setNewUserModalOpen] = useState<boolean>(false);
  const [isEditUserModalOpen, setEditUserModalOpen] = useState<boolean>(false);
  const [userForUpdate, setUserForUpdate] = useState<IListUser>(
    {} as IListUser
  );
  const [dataTable, setDataTable] = useState<IListUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await userContext.listUsers();
      setUsers(response.data);
      setDataTable(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNewUser = async () => {
    setNewUserModalOpen(true);
  };

  const handleCloseNewUserModal = () => {
    setNewUserModalOpen(false);
    fetchData();
  };

  const handleCloseEditUserModal = () => {
    setEditUserModalOpen(false);
    fetchData();
  };

  const handleUpdateUser = async (user: IListUser) => {
    setEditUserModalOpen(true);
    setUserForUpdate(user);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const userDeleted = users.filter((i) => i.id === userId);
      await userContext.deleteUser(userId);

      fetchData();

      toast.success(
        `Usuário ${userDeleted[0].name}, foi deletado com sucesso!`
      );
    } catch (error) {
      console.error("Error deleting user:", error);
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

  return (
    <>
      <STitle>Usuários</STitle>
      <BoxContainer>
        <CustomSearch
          width="400px"
          placeholder="Digite o nome ou o e-mail do usuário!"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CustomButton
          variant={"success"}
          width="100px"
          onClick={handleCreateNewUser}
        >
          Criar Novo
        </CustomButton>
      </BoxContainer>

      <CardContent>
        <TableUsers
          isLoading={isLoading}
          data={dataTable}
          onHandleUpdateUser={handleUpdateUser}
          onHandleDeleteUser={handleDeleteUser}
        />
      </CardContent>

      <ModalCreateNewUser
        open={isNewUserModalOpen}
        onClose={handleCloseNewUserModal}
      />

      <ModalEditUser
        open={isEditUserModalOpen}
        onClose={handleCloseEditUserModal}
        user={userForUpdate}
      />
    </>
  );
}
