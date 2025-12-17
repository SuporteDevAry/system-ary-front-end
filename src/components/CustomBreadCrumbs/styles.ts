import styled from "styled-components";
import { Link as MuiLink } from "@mui/material";

export const StyledBreadcrumbLink = styled(MuiLink)`
  &:hover {
    color: ${({ theme }) => theme["yellow-600"]} !important;
  }
`;

export const StyledHomeBreadcrumbLink = styled(MuiLink)`
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme["yellow-600"]} !important;
  }
`;
