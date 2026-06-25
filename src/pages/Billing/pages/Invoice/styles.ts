import styled from "styled-components";
import { V } from "../../../../styles/variables";
import Switch from "@mui/material/Switch";
import { TextField } from "@mui/material";

export const STitle = styled.h2``;

export const SContainer = styled.div`
  width: max-content;
`;

export const SContainerSearchAndButton = styled.div`
  display: flex;
  gap: ${V.mdSpacing};
  flex-direction: row;
  padding-top: ${V.smSpacing};
  padding-bottom: ${V.mdSpacing};
  margin-left: -16px;
  flex-wrap: wrap;
  align-items: center;
`;

export const SCardContrato = styled.div`
  padding: 16px;
  //width: 850px;
  border-radius: 16px;
  background-color: ${(props) => props.theme["white"]};
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.16);
`;

export const SCardInfo = styled.div`
  padding: 16px;
  //width: 935px;
  border-radius: 16px;
  background-color: ${(props) => props.theme["white"]};
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.16);
`;

export const SButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
`;

export const SFilterToggle = styled(Switch)`
  &.MuiSwitch-root {
    width: 62px;
    height: 38px;
    padding: 8px;
  }

  & .MuiSwitch-switchBase {
    padding: 10px;
  }

  & .MuiSwitch-thumb {
    width: 14px;
    height: 14px;
  }

  & .MuiSwitch-track {
    border-radius: 999px;
    opacity: 1;
    background-color: ${(props) => props.theme["gray-300"]};
  }

  & .MuiSwitch-switchBase.Mui-checked {
    color: ${(props) => props.theme["yellow-500"]};
  }

  & .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track {
    background-color: ${(props) => props.theme["yellow-500"]};
  }
`;

export const SFilterLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme["gray-700"]};
  white-space: nowrap;
`;

export const SFilterToggleContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
`;

export const STextField = styled(TextField)`
  width: 100%;

  .MuiOutlinedInput-root {
    fieldset {
      border-color: ${(props) => props.theme["gray-300"]};
    }

    &:hover fieldset {
      border-color: ${(props) => props.theme["gray-500"]};
    }

    &.Mui-focused fieldset {
      border-color: ${(props) => props.theme["yellow-500"]};
      box-shadow: 0 0 0 4px rgba(231, 177, 10, 0.08);
    }
  }

  .MuiInputLabel-root {
    color: ${(props) => props.theme["gray-700"]};
  }

  .MuiInputLabel-root.Mui-focused {
    color: ${(props) => props.theme["yellow-500"]};
  }

  textarea::placeholder {
    color: ${(props) => props.theme["gray-500"]};
    opacity: 1;
  }
`;
