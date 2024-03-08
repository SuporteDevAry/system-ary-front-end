import styled from "styled-components";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

export const STableRow = styled(TableRow)`
  background-color: ${({ theme }) => theme["gray-300"]};
  font-weight: 900;
`;

export const STableHeaderCell = styled(TableCell)`
  &.MuiTableCell-head {
    font-weight: 900;
    font-size: 16px;
    font-family: "Roboto", sans-serif;
  }
`;

export const SButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
`;
