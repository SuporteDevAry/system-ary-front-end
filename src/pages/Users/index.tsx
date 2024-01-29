import { useState } from "react";
import { ModalCreateNewUser } from "./components/ModalCreateNewUser";
import { TableUsers } from "./components/TableUsers";
import { BoxContainer, ButtonCreate } from "./styles";

import CardContent from "@mui/material/CardContent";

export function Users() {
  const [isNewUserModalOpen, setNewUserModalOpen] = useState(false);

  const handleCreateNewUser = () => {
    console.log("abriu");
    setNewUserModalOpen(true);
  };

  const handleCloseNewUserModal = () => {
    setNewUserModalOpen(false);
  };

  return (
    <>
      <h2>Usuários</h2>
      <BoxContainer>
        <ButtonCreate onClick={handleCreateNewUser}> Criar Novo</ButtonCreate>
      </BoxContainer>

      <CardContent>
        <TableUsers />
      </CardContent>

      <ModalCreateNewUser
        open={isNewUserModalOpen}
        onClose={handleCloseNewUserModal}
      />
    </>
  );
}
