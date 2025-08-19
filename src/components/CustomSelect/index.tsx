import React from "react";
import { SContainer, SLabel, SSelect } from "./styles";
import { CustomSelectProps } from "./types";
import { MenuItem, SelectChangeEvent } from "@mui/material";

export const CustomSelect: React.FC<CustomSelectProps> = ({
  width,
  height,
  label,
  $labelPosition,
  selectOptions,
  onSelectChange,
  value,
  readOnly,
  ...rest
}) => {
  const [option, setOption] = React.useState<string>(
    Array.isArray(value) ? value.join(", ") : value
  );

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const newSelectValue = event.target.value as string;
    setOption(newSelectValue);
    onSelectChange?.(newSelectValue);
  };

  return (
    <SContainer $labelPosition={$labelPosition}>
      <SLabel>{label}</SLabel>

      <SSelect
        value={option}
        onChange={handleSelectChange}
        sx={{ width: width, height: height }}
        readOnly={readOnly}
        {...rest}
      >
        {selectOptions?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </SSelect>
    </SContainer>
  );
};
