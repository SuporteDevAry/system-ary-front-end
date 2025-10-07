import { styled } from "styled-components";

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SText = styled.h4`
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-size: 1rem;
  letter-spacing: 0.6px;
`;

export const STextArea = styled.textarea`
  color: ${(props) => props.theme["gray-600"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;
  max-width: 800px;
  height: 140px;
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
