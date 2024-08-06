import styled from "styled-components";

import { V } from "../../styles/variables";

export const STitle = styled.h2`
  padding-left: ${V.mdSpacing};
`;

export const BoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  padding-right: 16px;
`;

<<<<<<< HEAD
export const SButtonContainer = styled.div`
=======
export const ButtonCreate = styled.button`
  ${btnReset};
  background-color: ${({ theme }) => theme["yellow-100"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;

export const ButtonGravar = styled.button`
  ${btnReset};
  background-color: ${({ theme }) => theme["yellow-100"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;

export const ButtonCancelar = styled.button`
  ${btnReset};
  background-color: ${({ theme }) => theme["gray-300"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;

export const ButtonImprimir = styled.button`
  ${btnReset};
  background-color: ${({ theme }) => theme["gray-300"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;


export const SFormContainer = styled.div`
  width: 750px;
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: 32px 0;
`;

export const SFormEndereco = styled.div`
  width: 750px;
>>>>>>> feature/notification
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
`;
