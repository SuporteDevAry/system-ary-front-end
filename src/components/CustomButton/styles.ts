import { ReactNode } from "react";
import styled, { DefaultTheme } from "styled-components";

export type ButtonVariant = "primary" | "secondary" | "danger" | "success";

export interface CustomButtonProps {
  variant: ButtonVariant;
  width?: string;
  height?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

const getColor = (theme: DefaultTheme, type: ButtonVariant) =>
  ({
    primary: theme["gray-300"],
    secondary: theme["gray-100"],
    success: theme["yellow-600"],
    danger: theme["red"],
  }[type]);

export const SButton = styled.button<CustomButtonProps>`
  color: ${({ theme }) => theme["black"]};
  width: ${(props) => props.width || "260px"};
  height: ${(props) => props.height || "38px"};
  border-radius: 8px;
  border: none;
  background-color: ${({ theme, disabled, variant }) =>
    disabled ? theme["gray-500"] : getColor(theme, variant)};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  outline: none;

  &:focus {
    box-shadow: none;
    border: none;
  }

  &:hover {
    color: ${({ theme, variant, disabled }) =>
      disabled ? getColor(theme, variant) : theme["white"]};
    background-color: ${({ theme, variant, disabled }) =>
      disabled ? theme["yellow-600"] : getColor(theme, variant)};
    border: none;
    outline: none;
  }
`;
