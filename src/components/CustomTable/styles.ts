import { Checkbox, TableHead, TableSortLabel } from "@mui/material";
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
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: ${(props) => props.theme["gray-800"]};
`;

export const CustomTableSortLabel = styled(TableSortLabel)`
  &.MuiTableSortLabel-icon {
    color: ${(props) => props.theme["yellow-100"]};
    opacity: 1;
  }

  &.MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon {
    color: ${(props) => props.theme["yellow-100"]};
  }

  &:hover {
    & .MuiTableSortLabel-icon {
      color: ${(props) => props.theme["yellow-100"]};
      opacity: 1;
    }
  }
`;
