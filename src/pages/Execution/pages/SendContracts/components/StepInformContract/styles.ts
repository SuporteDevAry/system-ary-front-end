import styled from "styled-components";
import { V } from "../../../../../../styles/variables";

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const STitle = styled.h2``;

export const SContainerSearchAndButton = styled.div`
  display: flex;
  gap: ${V.mdSpacing};
  flex-direction: row;
  padding-top: ${V.smSpacing};
  padding-bottom: ${V.mdSpacing};
  margin-left: -16px;
`;
