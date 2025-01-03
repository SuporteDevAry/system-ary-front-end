import React from "react";

interface LoadingButtonProps {
  onClick: () => void;
  isLoading: boolean;
  label: string;
  loadingLabel: string;
  disabled?: boolean;
}

const CustomLoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  isLoading,
  label,
  loadingLabel,
  disabled,
}) => (
  <button onClick={onClick} disabled={disabled || isLoading}>
    {isLoading ? loadingLabel : label}
  </button>
);

export default CustomLoadingButton;
