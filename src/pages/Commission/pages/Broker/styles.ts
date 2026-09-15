import styled from "styled-components";
import { V } from "../../../../styles/variables";

export const SContainer = styled.div`
  min-width: -webkit-fill-available;
  width: 1000px;
`;

export const STitle = styled.h2`
  padding-left: ${V.mdSpacing};
`;

export const BoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  padding-right: 16px;
  gap: ${V.mdSpacing};
  flex-wrap: wrap;
`;

export const SButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
`;

export const SForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${V.smSpacing};
  padding: ${V.mdSpacing} ${V.mdSpacing} 0;
  max-width: 1100px;
`;

export const SFieldsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${V.smSpacing};
  align-items: flex-start;
`;

export const SButtons = styled.div`
  display: flex;
  gap: ${V.smSpacing};
  justify-content: flex-end;
  padding: ${V.mdSpacing};
`;
