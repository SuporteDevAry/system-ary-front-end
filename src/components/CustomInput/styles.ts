import styled from "styled-components";

export const SContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px; // Espaçamento opcional entre os inputs
`;

export const SLabel = styled.label`
  margin-right: 10px; // Espaçamento opcional entre o label e o input
`;

export const SCustomInput = styled.input`
  width: ${(props) => props.width || "260px"};
  height: ${(props) => props.height || "38px"};
  padding: 0 16px;

  color: ${(props) => props.theme["gray-500"]};
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
