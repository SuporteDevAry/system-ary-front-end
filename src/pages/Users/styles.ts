import styled from "styled-components";
import { V } from "../../styles/variables";

export const STitle = styled.h1`
  padding-left: ${V.mdSpacing};
`;

export const BoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  padding-right: 18px;
`;

export const SButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
`;
