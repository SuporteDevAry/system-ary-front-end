import styled, { DefaultTheme } from "styled-components";
import { ButtonVariant, CustomButtonProps } from "./types";

const getColor = (theme: DefaultTheme, type: ButtonVariant) =>
  ({
    primary: theme["gray-300"],
    secondary: theme["green-500"],
    success: theme["yellow-600"],
    danger: theme["red-500"],
  }[type]);

export const SButton = styled.button<CustomButtonProps>`
  color: ${({ theme, variant }) =>
    variant === "danger" || variant === "secondary"
      ? theme["white"]
      : theme["black"]};
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
      disabled
        ? theme["gray-100"]
        : variant === "danger" || variant === "secondary"
        ? theme["white"]
        : theme["black"]};
    background-color: ${({ theme, variant, disabled }) =>
      disabled ? theme["yellow-600"] : getColor(theme, variant)};

    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;
