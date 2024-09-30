import React from "react";
import { SContainer, SLabel } from "./styles";
import { CustomDatePickerProps } from "./types";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/pt-br";

dayjs.extend(localizedFormat);
dayjs.locale("pt-br");

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  width,
  height,
  label,
  $labelPosition,
  value,
  onChange,
}) => {
  const currentDate = dayjs();

  const handleDateChange = (newValue: dayjs.Dayjs | null) => {
    const finalDate = newValue
      ? newValue.format("DD/MM/YYYY")
      : currentDate.format("DD/MM/YYYY");
    onChange(finalDate);
  };

  return (
    <SContainer $labelPosition={$labelPosition}>
      <SLabel>{label}</SLabel>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={value ? dayjs(value, "DD/MM/YYYY") : currentDate}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              variant: "outlined",
              style: { width, height },

              InputProps: {
                sx: {
                  "&": {
                    color: "#7C7C8A",
                    borderRadius: "8px",
                  },
                  "&:hover": {
                    color: "#7C7C8A",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E1E1E6",
                    borderWidth: "2px",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#7C7C8A",
                    borderWidth: "2px",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#FBA94C",
                    borderWidth: "2px",
                  },
                },
              },
            },
            // Estilizando o calendário do DatePicker
            day: {
              sx: {
                "&.Mui-selected": {
                  backgroundColor: "#f1c40f!important",
                  color: "#000",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#0d0d0d !important",
                  color: "#FFFFFF",
                },
              },
            },
          }}
          format="DD/MM/YYYY"
        />
      </LocalizationProvider>
    </SContainer>
  );
};

export default CustomDatePicker;
