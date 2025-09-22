import styled from "styled-components";
import { CustomTextArea } from "../CustomTextArea";

export const STitle = styled.h2``;

export const SFormContainer = styled.div`
  width: 700px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const BoxContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
`;

export const SCardInfo = styled.div`
  padding: 5px;
  width: 740px;
  border-radius: 16px;
  background-color: ${(props) => props.theme["white"]};
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.16);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
`;

export const SCardBase = styled.div`
  padding: 16px;
  border-radius: 16px;
  background-color: ${(props) => props.theme["white"]};
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.16);
  margin: 0 auto;
`;

export const SCardInfoNumber = styled(SCardBase)`
  width: 262px;
`;

export const SCardInfoActions = styled(SCardBase)`
  width: 462px;
`;

export const SBox = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

export const SKeyContainer = styled.div`
  display: flex;
  flex-direction: column;
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

export const SCustomTextArea = styled(CustomTextArea)`
  font-family: "Courier New", monospace;
  font-size: 12px;
  padding: 10px;
`;
