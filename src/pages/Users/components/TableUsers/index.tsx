import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import {
  SButtonContainer,
  SButtonDelete,
  SButtonEdit,
  STableHeaderCell,
  STableRow,
} from "./styles";
import { UserContext } from "../../../../contexts/UserContext";
import { useEffect, useState } from "react";
import { IListUser } from "../../../../contexts/UserContext/types";
import { ModalEditUser } from "../ModalEditUser";

export function TableUsers() {
  const userContext = UserContext();
  const [users, setUsers] = useState<IListUser[]>([]);
  const [isEditUserModalOpen, setEditUserModalOpen] = useState<boolean>(false);
  const [userForUpdate, setUserForUpdate] = useState<IListUser>(
    {} as IListUser
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await userContext.listUsers();
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, [users]);

  const handleCloseEditUserModal = () => {
    setEditUserModalOpen(false);
  };

  const handleUpdateUser = async (user: IListUser) => {
    setEditUserModalOpen(true);
    setUserForUpdate(user);
  };

  const handleDeleteUser = (userId: string) => {
    try {
      userContext.deleteUser(userId);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="simple table">
          <TableHead>
            <STableRow>
              <STableHeaderCell>Nome</STableHeaderCell>
              <STableHeaderCell align="left">E-mail</STableHeaderCell>
              <STableHeaderCell align="left">Data de Criação</STableHeaderCell>
              <STableHeaderCell align="left"></STableHeaderCell>
            </STableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {user.name}
                </TableCell>
                <TableCell align="left">{user.email}</TableCell>
                <TableCell align="left">{user.created_at}</TableCell>
                <TableCell>
                  <SButtonContainer>
                    <SButtonEdit onClick={() => handleUpdateUser(user)}>
                      Editar
                    </SButtonEdit>
                    <SButtonDelete onClick={() => handleDeleteUser(user.id)}>
                      Deletar
                    </SButtonDelete>
                  </SButtonContainer>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ModalEditUser
        open={isEditUserModalOpen}
        onClose={handleCloseEditUserModal}
        user={userForUpdate}
      />
    </>
  );
}
