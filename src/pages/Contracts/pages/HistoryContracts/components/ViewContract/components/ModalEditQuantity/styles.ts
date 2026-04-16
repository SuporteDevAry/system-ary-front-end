import { styled } from "styled-components";

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 4px;
`;

export const SBoxDatePicker = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  > * {
    min-width: 0;
    width: 100%;
    margin-top: 8px;
    margin-bottom: 16px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const SFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const SField = styled.div`
  min-width: 0;
  width: 100%;

  > * {
    width: 100%;
  }
`;

export const SWideField = styled(SField)`
  grid-column: 1 / -1;
`;

export const SText = styled.h4`
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-size: 1rem;
  letter-spacing: 0.6px;
  margin: 0;
`;

export const STextAreaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const STextArea = styled.textarea`
  width: 100%;
  min-height: 140px;
  box-sizing: border-box;
  color: ${(props) => props.theme["gray-600"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;
  border-width: 2px;
  padding: 16px;
  resize: vertical;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;
