import styled, { keyframes } from "styled-components";

const loaderDot = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
`;

export const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
`;

export const LoaderDot = styled.div<{ $delay: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme["black-300"]};
  margin: 0 10px;
  animation: ${loaderDot} 1.5s infinite ease-in-out;
  animation-delay: ${({ $delay }) => $delay};
`;
