
import styled from "styled-components";

export const SButtonApaga = styled.button`
  background-color: ${({ theme }) => theme["yellow-100"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;

export const SButtonMarcaLida = styled.button`
  background-color: ${({ theme }) => theme["yellow-100"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;
