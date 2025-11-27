import styled from "styled-components";
import { V } from "../../styles/variables";
import { TextField } from "@mui/material";

export const SFormContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${V.smSpacing};
  padding-top: ${V.smSpacing};
  padding-bottom: ${V.smSpacing};
`;

export const STextField = styled(TextField)`
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

  input::placeholder {
    color: ${(props) => props.theme["gray-500"]};
    opacity: 1;
  }
`;
