import { useNavigate } from "react-router-dom";
import CustomButton from "../CustomButton";
import { SCardInfo, SContainer, SMain } from "./styles";
import { deleteUserLocalStorage } from "../../contexts/AuthProvider/util";
import { useAuth } from "../../contexts/AuthProvider";

export const ProtectedLayout = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSendLogin = () => {
    deleteUserLocalStorage();
    navigate("/login");
  };

  if (!auth.token) {
    return (
      <SContainer>
        <SCardInfo>
          <SMain>
            <h1>Que pena! Você não tem acesso a essa página!</h1>
            <div>Clique no botão abaixo para ir para o Login.</div>
            <CustomButton
              $variant={"primary"}
              width="180px"
              onClick={handleSendLogin}
            >
              Ir para Login
            </CustomButton>
          </SMain>
        </SCardInfo>
      </SContainer>
    );
  }

  return children;
};
