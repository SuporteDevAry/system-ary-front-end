import { styled } from "styled-components";

export const STitle = styled.h2``;

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  align-items: start;
`;

export const SCardInfo = styled.div`
  padding: 16px;
  width: 740px;
  border-radius: 16px;
  background-color: ${(props) => props.theme["white"]};
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.16);
  margin: 0 auto;
`;

export const SBox = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

export const SKeyContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 8px;
  padding-left: 16px;
`;

export const SkeyName = styled.span`
  font-weight: bold;
  color: ${(props) => props.theme["black"]};
`;

export const SKeyValue = styled.span`
  display: inline-block;
  font-weight: 500;
  padding-left: 8px;
  color: ${(props) => props.theme["black-300"]};
`;
