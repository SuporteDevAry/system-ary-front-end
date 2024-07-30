import styled, { css } from "styled-components";
import { labelPositionVariant } from "./types";
import { HTMLAttributes } from "react";
import { Select } from "@mui/material";
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

export const SLabel = styled.label`
  padding-right: 10px; // Espaçamento opcional entre o label e o input
`;

export const SSelect = styled(Select)<{ width?: string; height?: string }>`
  width: ${(props) => props.width || "260px"};
  height: ${(props) => props.height || "38px"};
  padding: 0 6px;
  border-width: 2px;

  &.MuiOutlinedInput-root {
    border-color: ${(props) => props.theme["gray-500"]};

    color: ${(props) => props.theme["gray-500"]};

    &.fieldset {
      color: ${(props) => props.theme["gray-500"]};
    }

    &:hover fieldset {
      border-color: ${(props) => props.theme["gray-100"]};
    }

    &.Mui-focused fieldset {
      box-shadow: none;
      border-color: ${(props) => props.theme["yellow-500"]};
    }
  }
`;
