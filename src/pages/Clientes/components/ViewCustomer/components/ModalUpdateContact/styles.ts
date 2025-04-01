import styled from "styled-components";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

export const SFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
`;

export const SFormControlLabel = styled(FormControlLabel)`
  padding-right: 110px;
`;

export const SCheckbox = styled(Checkbox)`
  &.MuiCheckbox-root.Mui-checked {
    color: ${(props) => props.theme["yellow-600"]};
  }
`;