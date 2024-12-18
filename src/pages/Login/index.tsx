import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  LoginContainer,
  ContainerImage,
  ButtonComponent,
  FormContainer,
  UserInput,
  PasswordInput,
  BoxInputPassword,
  BoxInputUser,
  LogoImage,
} from "./styles";

import { logoAryLogin } from "../../assets";

// ícones
import { FaUserCircle } from "react-icons/fa";
import { FaEye, FaLock } from "react-icons/fa";
import { RiEyeCloseLine } from "react-icons/ri";

import { isEmailValid } from "../../helpers/back-end/utils";
import { useAuth } from "../../contexts/AuthProvider";

export function Login() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setIsButtonDisabled(!(formData.email && formData.password));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    if (!isEmailValid(email)) {
      toast.error(
        "Formato de e-mail inválido, verifique se seu e-mail está correto."
      );
      return;
    }

    try {
      const loginSuccess = await auth.authenticate(
        formData.email,
        formData.password
      );

      if (loginSuccess) {
        navigate("/dashboard");
      } else {
        toast.error("Usuário ou senha incorretos.");
      }
    } catch (error) {
      toast.error("Erro ao autenticar. Tente novamente mais tarde.");
    }
  };

  return (
    <>
      <Container>
        <LoginContainer>
          <LogoImage src={logoAryLogin} alt="logo da empresa" />

          <form onSubmit={handleSubmit} autoComplete="off" action="">
            <FormContainer>
              <BoxInputUser>
                <FaUserCircle size={20} />
                <UserInput
                  placeholder="Usuário"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </BoxInputUser>
              <BoxInputPassword
                $showPasswordIcon={formData?.password.length > 0}
              >
                <PasswordInput
                  placeholder="Senha"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />

                {formData?.password.length > 0 ? (
                  showPassword ? (
                    <FaEye size={20} onClick={togglePasswordVisibility} />
                  ) : (
                    <RiEyeCloseLine
                      size={20}
                      onClick={togglePasswordVisibility}
                    />
                  )
                ) : (
                  <FaLock size={20} onClick={togglePasswordVisibility} />
                )}
              </BoxInputPassword>
            </FormContainer>

            <ButtonComponent type="submit" disabled={isButtonDisabled}>
              Entrar
            </ButtonComponent>
          </form>
        </LoginContainer>
        <ContainerImage />
      </Container>
    </>
  );
}
