import styled from "styled-components";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SFormControlLabel = styled(FormControlLabel)`
  padding-right: 110px;
`;

export const SCheckbox = styled(Checkbox)`
  &.MuiCheckbox-root.Mui-checked {
    color: ${(props) => props.theme["yellow-600"]};
  }
`;
