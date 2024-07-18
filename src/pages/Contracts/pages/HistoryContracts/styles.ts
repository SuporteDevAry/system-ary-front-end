import styled from "styled-components";
import { V } from "../../../../styles/variables";

export const STitle = styled.h2``;

export const SContainer = styled.div`
  width: 900px;
`;

export const SContainerSearchAndButton = styled.div`
  display: flex;
  gap: ${V.mdSpacing};
  flex-direction: row;
  padding-top: ${V.smSpacing};
  padding-bottom: ${V.mdSpacing};
  margin-left: -16px;
`;
