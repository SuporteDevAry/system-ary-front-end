import { styled } from "styled-components";

export const SContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 200px auto;
`;

export const SCardInfo = styled.div`
  padding: 16px;
  width: 984px;
  border-radius: 16px;
  background-color: ${(props) => props.theme["white"]};
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.16);
`;

export const SMain = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
`;
