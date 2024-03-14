import styled from "styled-components";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import { V } from "../../styles/variables";

export const SContainer = styled.div`
  width: 100%;
  display: flex;
  background: ${(props) => props.theme["gray-300"]};
`;

export const SFormContainer = styled.div`
  /* width: 50%;
  padding: 20px; */
  flex: 1;
`;

export const SDisplayContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 32px 0;
  gap: 8px;
`;

export const SPermissionsContainer = styled.div`
  width: 50%;
  display: flex;
  flex-wrap: wrap;
`;

export const SCardContainer = styled.div``;

export const SCard = styled(Card)`
  height: 130px;
  width: 180px;
  padding: ${V.mdSpacing};
  margin: ${V.mdSpacing};
  border-radius: 8px;

  &.MuiCard-root {
    background-color: ${(props) => props.theme["gray-100"]};
  }
`;

export const SCardIcon = styled.div`
  display: flex;
`;

export const SCardContent = styled.div`
  display: flex;
`;

export const SToogle = styled(Switch)`
  &.Mui-checked {
    color: ${(props) => props.theme["green-100"]};
  }

  &.MuiSwitch-track {
    background-color: "#cccccc"; // Altere a cor aqui para a cor desejada
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

export const SNameInput = styled(BaseInput)``;
export const SEmailInput = styled(BaseInput)``;
