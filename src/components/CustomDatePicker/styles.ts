import styled, { css } from "styled-components";
import { labelPositionVariant } from "./types";
import { HTMLAttributes } from "react";

interface SContainerProps extends HTMLAttributes<HTMLDivElement> {
  $labelPosition?: labelPositionVariant;
}

export const SContainer = styled.div<SContainerProps>`
  display: flex;
  gap: 8px;
  // Label pode ficar em cima do input com valor "top", ou pode ficar a esquerda com o valor "left"!
  ${({ $labelPosition }) =>
    $labelPosition === "top"
      ? css`
          flex-direction: column;
        `
      : $labelPosition === "left"
      ? css`
          align-items: center;
        `
      : null}
`;

export const SLabel = styled.span`
  padding-right: 10px;
`;

export const SBoxContent = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 8px;
`;
