import styled from "styled-components";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { btnReset } from "../../styles/variables";

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

export const ButtonGravar = styled.button`
  background-color: ${({ theme }) => theme["yellow-100"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;

export const ButtonCancelar = styled.button`
  background-color: ${({ theme }) => theme["gray-300"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
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

export const BoxContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: 16px;
`;

export const SFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 32px 0;
  gap: 8px;
`;


const BaseInput = styled.input`
  width: 260px;
  height: 38px;
  display: flex;
  flex-direction: column;

  padding: 0 16px;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SCli_codigoInput = styled(BaseInput)``;
export const SSequenciaInput = styled(BaseInput)``;
export const SGrupoInput = styled(BaseInput)``;
export const SNomeInput = styled(BaseInput)``;
export const SCargoInput = styled(BaseInput)``;
export const SEmailInput = styled(BaseInput)``;
export const STelefoneInput = styled(BaseInput)``;
export const SCelularInput = styled(BaseInput)``;
export const SRecebe_emailInput = styled(BaseInput)``;
