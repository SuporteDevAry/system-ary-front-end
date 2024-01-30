import styled from "styled-components";
import bgImage from "../../assets/img/bg-soja.jpeg";

export const LogoImage = styled.img`
  max-width: 100%;
  height: auto;

  @media (max-width: 767px), handheld and (orientation: landscape) {
    max-width: 380px;
    height: 100px;
  }

  @media (max-width: 420px), handheld and (orientation: landscape) {
    max-width: 280px;
    height: 100px;
  }
`;

export const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: row;
`;

export const LoginContainer = styled.div`
  width: 100%;
  padding: 32px;
  background: ${(props) => props.theme["gray-300"]};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  @media (min-width: 767px), handheld and (orientation: landscape) {
    width: 40%;
  }
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 32px 0;
  gap: 8px;
`;

export const BoxInputUser = styled.div`
  position: relative;

  input {
    padding-left: 35px; /* Espaço para o ícone */
  }

  svg {
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    /* Estilos adicionais do ícone */
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const BoxInputPassword = styled.div<{ showPasswordIcon: boolean }>`
  position: relative;

  input {
    padding-left: ${({ showPasswordIcon }) =>
      showPasswordIcon ? "18px" : "35px"};

    /* Outros estilos do input */
  }

  svg {
    position: absolute;
    top: 50%;
    ${({ showPasswordIcon }) =>
      showPasswordIcon ? "right: 10px" : "left: 10px"};
    transform: translateY(-50%);
    /* Estilos adicionais do ícone */
    cursor: pointer;
    color: ${(props) => props.theme["gray-500"]};
  }
`;

const BaseInput = styled.input`
  width: 260px;
  height: 38px;
  display: flex;
  flex-direction: column;

  padding: 0 16px;

  color: ${(props) => props.theme["gray-500"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const UserInput = styled(BaseInput)``;

export const PasswordInput = styled(BaseInput)``;

export const ContainerImage = styled.div`
  padding: 32px;
  background: url(${bgImage}) no-repeat;
  background-size: cover;
  background-position: center;

  display: none;

  @media (min-width: 767px), handheld and (orientation: landscape) {
    width: 60%;
    display: block;
  }
`;

export const ButtonComponent = styled.button`
  color: ${(props) => props.theme["black"]};
  width: 260px;
  height: 38px;
  border-radius: 8px;
  border: none;
  background-color: ${(props) =>
    props.disabled ? props.theme["yellow-600"] : props.theme["yellow-600"]};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  outline: none;

  &:focus {
    box-shadow: none;
    border: none;
  }

  &:hover {
    color: ${(props) =>
      props.disabled ? props.theme["black"] : props.theme["white"]};
    background-color: ${(props) =>
      props.disabled ? props.theme["yellow-600"] : props.theme["black"]};
    border: none;
    outline: none;
  }
`;
