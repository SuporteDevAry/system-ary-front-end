import { useNavigate } from "react-router-dom";
import { TableClientes } from "./components/TableClientes";
import { BoxContainer, ButtonCreate } from "./styles";

import CardContent from "@mui/material/CardContent";

export function Clientes() {
  const navigate = useNavigate();
 

  const handleCreateCliente = async () => {
   navigate("/cliente-cadastrar")
  };

  return (
    <>
      <h2>Clientes</h2>
      <BoxContainer>
        <ButtonCreate onClick={handleCreateCliente}> Criar Novo</ButtonCreate>
      </BoxContainer>

      <CardContent>
        <TableClientes />
      </CardContent>

    </>
  );
}
