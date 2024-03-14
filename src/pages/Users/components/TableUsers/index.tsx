import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { SButtonContainer, STableHeaderCell, STableRow } from "./styles";
import CustomButton from "../../../../components/CustomButton";
import { ITableUsersProps } from "./types";

export function TableUsers({
  users,
  isLoading,
  onHandleUpdateUser,
  onHandleDeleteUser,
}: ITableUsersProps) {
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
            {isLoading ? (
              <p> Loading ...</p> // criar um gif animado para por aqui
            ) : (
              users?.map((user) => (
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
                      <CustomButton
                        variant={"primary"}
                        width="80px"
                        onClick={() => onHandleUpdateUser(user)}
                      >
                        Editar
                      </CustomButton>
                      <CustomButton
                        variant={"danger"}
                        width="80px"
                        onClick={() => onHandleDeleteUser(user.id)}
                      >
                        Deletar
                      </CustomButton>
                    </SButtonContainer>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
