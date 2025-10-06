import styled from "styled-components";
import { V } from "../../../../styles/variables";

export const STitle = styled.h2``;

export const SContainer = styled.div`
  width: 100%;
`;

export const SContainerSearchAndButton = styled.div`
  display: flex;
  gap: ${V.mdSpacing};
  flex-direction: row;
  padding-top: ${V.smSpacing};
  padding-bottom: ${V.mdSpacing};
  //margin-left: -16px;
`;

// export const SContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 16px;
//   justify-content: center;
//   align-items: start;
// `;

export const SCardContrato = styled.div`
  padding: 16px;
  //width: 850px;
  border-radius: 16px;
  background-color: ${(props) => props.theme["white"]};
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.16);
`;

export const SCardInfo = styled.div`
  padding: 16px;
  //width: 935px;
  border-radius: 16px;
  background-color: ${(props) => props.theme["white"]};
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.16);
`;

export const SCardContainer = styled.span`
  display: inline-block;
  padding-right: 8px;
  margin-top: 8px;
  padding-left: 16px;
`;

export const BoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  padding-right: 16px;
`;

export const SButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
`;