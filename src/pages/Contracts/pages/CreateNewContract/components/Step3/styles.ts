import styled from "styled-components";

export const SContainer = styled.div`
  column-count: 2;
  gap: 16px;

  > * {
    padding-bottom: 8px;
  }
`;

export const SContentBox = styled.div`
  display: flex;
  gap: 8px;
`;

export const SCommissionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SLabel = styled.span`
  padding-right: 10px;
`;

export const SRadioGroup = styled.div`
  display: flex;
  gap: 8px;
  padding-left: 4px;
`;

export const SRadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;

  input {
    margin-right: 4px;
  }
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
