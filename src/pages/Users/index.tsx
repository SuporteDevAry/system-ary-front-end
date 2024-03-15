import { useEffect, useState } from "react";
import { ModalCreateNewUser } from "./components/ModalCreateNewUser";
import { TableUsers } from "./components/TableUsers";
import { BoxContainer } from "./styles";
import CardContent from "@mui/material/CardContent";
import CustomButton from "../../components/CustomButton";
import { ModalEditUser } from "./components/ModalEditUser";
import { UserContext } from "../../contexts/UserContext";
import { IListUser } from "../../contexts/UserContext/types";
import { toast } from "react-toastify";

export function Users() {
  const userContext = UserContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<IListUser[]>([]);
  const [isNewUserModalOpen, setNewUserModalOpen] = useState<boolean>(false);
  const [isEditUserModalOpen, setEditUserModalOpen] = useState<boolean>(false);
  const [userForUpdate, setUserForUpdate] = useState<IListUser>(
    {} as IListUser
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await userContext.listUsers();
      setUsers(response.data);
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

  return (
    <>
      <h2>Usuários</h2>
      <BoxContainer>
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
          data={users}
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
