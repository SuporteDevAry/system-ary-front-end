import styled from "styled-components";
import { btnReset } from "../../styles/variables";

export const BoxContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: 16px;
`;

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
