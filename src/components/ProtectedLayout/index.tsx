import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider/useAuth";
import CustomButton from "../CustomButton";
import { SCardInfo, SContainer, SMain } from "./styles";

export const ProtectedLayout = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSendLogin = () => {
    navigate("/login");
  };

  if (!auth.token) {
    return (
      <SContainer>
        <SCardInfo>
          <SMain>
            <h1>Que pena! Você não tem acesso a essa página!</h1>
            <p>Clique no botão abaixo para ir para o Login.</p>
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
