import { Checkbox, TableHead } from "@mui/material";
import styled from "styled-components";

export const SColumnHeader = styled.span`
  font-size: 16px;
  font-weight: 400;
  color: ${(props) => props.theme["white"]};
`;

export const SCheckbox = styled(Checkbox)`
  &.MuiCheckbox-root.Mui-checked {
    color: ${(props) => props.theme["yellow-600"]};
  }
`;

export const STableHead = styled(TableHead)`
  background-color: ${(props) => props.theme["gray-800"]};
`;
