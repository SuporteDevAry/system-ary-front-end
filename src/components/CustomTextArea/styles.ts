import { styled } from "styled-components";

export const SContainer = styled.div``;

export const SText = styled.h4`
  font-weight: 500;
  padding-bottom: 8px;
`;

export const STextArea = styled.textarea<{ width?: string; height?: string }>`
  color: ${(props) => props.theme["gray-600"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;
  max-width: 800px;
  width: ${(props) => props.width || "260px"};
  height: ${(props) => props.height || "200px"};
  border-width: 2px;
  padding: 16px 16px 0;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;
