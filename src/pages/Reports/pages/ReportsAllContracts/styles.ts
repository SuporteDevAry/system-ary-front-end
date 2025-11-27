import styled from "styled-components";
import { V } from "../../../../styles/variables";

export const STitle = styled.h2`
  padding-left: ${V.mdSpacing};
  display: flex;
  gap: 4;
  flex-direction: row;
`;

export const SContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 30px;
  max-height: 500px;

  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

  @media (max-width: 768px), handheld and (orientation: landscape) {
    display: grid;
  }
`;

export const SContainerSearchAndButton = styled.div`
  display: flex;
  gap: ${V.mdSpacing};
  flex-direction: row;
  padding-top: ${V.smSpacing};
  padding-bottom: ${V.mdSpacing};
  margin-left: -16px;
`;

export const SFormContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${V.smSpacing};
  padding-top: ${V.smSpacing};
  padding-bottom: ${V.smSpacing};
`;

export const SCardContainer = styled.span`
  display: flex;
  gap: ${V.mdSpacing};
  padding-top: ${V.smSpacing};
  padding-bottom: ${V.mdSpacing};
`;
