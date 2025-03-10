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

export const SCardContainer = styled.span`
  display: inline-block;
  padding-right: 8px;
  margin-top: 8px;
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

export const SButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
`;

export const BoxContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: end;
  padding-top: 16px;
`;

export const SNumberContract = styled.span`
  display: flex;
  font-weight: 500;
  padding-top: 16px;
  font-size: 30px;
  color: ${(props) => props.theme["black-300"]};
  justify-content: end;
`;
