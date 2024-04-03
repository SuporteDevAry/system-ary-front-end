import styled from "styled-components";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { btnReset } from "../../styles/variables";


export const SFormContainer = styled.div`
  width: 750px;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: space-between;
  flex-wrap: nowrap;
  padding: 10px 0;
  //gap: 1px;
`;

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

const BaseInput = styled.input`
  width: 260px;
  height: 30px;
  display: flex;
  flex-direction: column;

  padding: 0 10px;

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

export const SCli_codigoInput = styled(BaseInput)`
  width: 100px;
`;
export const SSequenciaInput = styled(BaseInput)`
  width: 100px;
`;
export const SGrupoInput = styled(BaseInput)`
  width: 50%;
`;
export const SNomeInput = styled(BaseInput)`
   width: 70%;
`;
export const SCargoInput = styled(BaseInput)`
  width: 70%;
 `;
export const SEmailInput = styled(BaseInput)`
  width: 50%;
 `;
export const STelefoneInput = styled(BaseInput)`
  width: 30%;
 `;
export const SCelularInput = styled(BaseInput)`
  width: 30%;
`;
export const SRecebe_emailInput = styled(BaseInput)``;
