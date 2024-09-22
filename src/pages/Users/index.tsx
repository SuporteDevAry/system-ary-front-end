import { useCallback, useEffect, useMemo, useState } from "react";
import { ModalCreateNewUser } from "./components/ModalCreateNewUser";
import { BoxContainer, SButtonContainer, STitle } from "./styles";
import CardContent from "@mui/material/CardContent";
import CustomButton from "../../components/CustomButton";
import { ModalEditUser } from "./components/ModalEditUser";
import { UserContext } from "../../contexts/UserContext";
import { IListUser } from "../../contexts/UserContext/types";
import { toast } from "react-toastify";
import { CustomSearch } from "../../components/CustomSearch";
import CustomTable from "../../components/CustomTable";

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
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userContext.listUsers();
      setUsers(response.data);
      setDataTable(response.data);
    } catch (error) {
      toast.error(
        `Erro ao tentar ler usuários, contacte o administrador do sistema ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [userContext]);

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
      toast.error(
        `Erro ao tentar deletar usuário, contacte o administrador do sistema ${error}`
      );
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

  const nameColumns = useMemo(
    () => [
      { field: "name", header: "Nome", width: "150px", sortable: true },
      { field: "email", header: "E-mail", width: "150px", sortable: true },
      {
        field: "created_at",
        header: "Data de Criação",
        width: "150px",
      },
    ],
    []
  );

  const renderActionButtons = (row: any) => (
    <SButtonContainer>
      <CustomButton
        $variant={"primary"}
        width="80px"
        onClick={() => handleUpdateUser(row)}
      >
        Editar
      </CustomButton>
      <CustomButton
        $variant={"danger"}
        width="80px"
        onClick={() => handleDeleteUser(row.id)}
      >
        Deletar
      </CustomButton>
    </SButtonContainer>
  );

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
          $variant={"success"}
          width="100px"
          onClick={handleCreateNewUser}
        >
          Criar Novo
        </CustomButton>
      </BoxContainer>

      <CardContent>
        <CustomTable
          data={dataTable}
          columns={nameColumns}
          isLoading={isLoading}
          hasPagination={true}
          actionButtons={renderActionButtons}
          dateFields={["created_at"]}
          order={order}
          orderBy={orderBy}
          setOrder={setOrder}
          setOrderBy={setOrderBy}
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
