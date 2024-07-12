import { useNavigate } from "react-router-dom";
import { TableContatos } from "./components/TableContatos";
import { BoxContainer, ButtonCreate } from "./styles";
import CardContent from "@mui/material/CardContent";

export function Contatos() {
  const navigate = useNavigate();
 
  const handleCreateContato = async () => {
   navigate("/contatos-cadastrar")
  };

  return (
    <>
      <h2>Contatos do Cliente</h2>
      <BoxContainer>
        <ButtonCreate onClick={handleCreateContato}> Criar Novo</ButtonCreate>
      </BoxContainer>
      
      <CardContent>
        <TableContatos />
      </CardContent>

    </>
  );
}
