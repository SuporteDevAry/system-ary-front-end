import { Checkbox } from "@mui/material";
import styled from "styled-components";

export const SColumnHeader = styled.span`
  font-size: 16px;
  font-weight: 400;
`;

export const SCheckbox = styled(Checkbox)`
  &.MuiCheckbox-root.Mui-checked {
    color: ${(props) => props.theme["yellow-600"]};
  }
`;
