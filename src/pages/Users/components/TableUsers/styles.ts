import styled from "styled-components";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { btnReset } from "../../../../styles/variables";

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

export const SButtonEdit = styled.button`
  ${btnReset};
  background-color: ${({ theme }) => theme["gray-300"]};
  border-radius: 5px;
  padding: 8px;
  color: ${({ theme }) => theme["black-200"]};

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;

export const SButtonDelete = styled.button`
  ${btnReset};
  background-color: ${({ theme }) => theme["red-500"]};
  border-radius: 5px;
  padding: 8px;
  color: ${({ theme }) => theme["white-100"]};

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;
