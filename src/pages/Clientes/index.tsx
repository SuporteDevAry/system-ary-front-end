import { useState } from "react";
import { ModalCreateNewCliente } from "./components/ModalCreateNewCliente";
import { TableClientes } from "./components/TableClientes";
import { BoxContainer, ButtonCreate } from "./styles";

import CardContent from "@mui/material/CardContent";

export function Clientes() {
  const [isNewClienteModalOpen, setNewClienteModalOpen] = useState(false);

  const handleCreateNewCliente = () => {
    setNewClienteModalOpen(true);
  };

  const handleCloseNewClienteModal = () => {
    setNewClienteModalOpen(false);
  };

  return (
    <>
      <h2>Clientes</h2>
      <BoxContainer>
        <ButtonCreate onClick={handleCreateNewCliente}> Criar Novo</ButtonCreate>
      </BoxContainer>

      <CardContent>
        <TableClientes />
      </CardContent>

      <ModalCreateNewCliente
        open={isNewClienteModalOpen}
        onClose={handleCloseNewClienteModal}
      />
    </>
  );
}
