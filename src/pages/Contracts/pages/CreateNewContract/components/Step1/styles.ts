import styled from "styled-components";

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SContainerBase = styled.div`
  display: flex;
  gap: 16px;
  align-items: end;
`;

export const SContainerSeller = styled(SContainerBase)``;

export const SContainerBuyer = styled(SContainerBase)``;
