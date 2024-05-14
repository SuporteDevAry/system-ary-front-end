import React from "react";
import { StepProps } from "../../types";
import Box from "@mui/material/Box";
import CustomInput from "../../../../components/CustomInput";
import CustomButton from "../../../../components/CustomButton";
import { SContainer, SContainerBuyer, SContainerSeller } from "./style";

export const Step1: React.FC<StepProps> = ({ handleChange }) => {
  return (
    <SContainer>
      <SContainerSeller>
        <Box>
          <CustomInput
            type="text"
            name="seller"
            label="Vendedor: "
            labelPosition="top"
            onChange={handleChange}
            readOnly
            //value={formData.name}
          />
        </Box>
        <CustomButton
          variant="success"
          width="180px"
          onClick={() => {} /* handleOpenUserModal */}
          //disabled={!!formData.email}
        >
          Selecione Vendedor
        </CustomButton>
      </SContainerSeller>
      <SContainerBuyer>
        <Box>
          <CustomInput
            type="text"
            name="buyer"
            label="Comprador:"
            labelPosition="top"
            onChange={handleChange}
            readOnly
            //value={formData.email}
          />
        </Box>
        <CustomButton
          variant="success"
          width="180px"
          onClick={() => {} /* handleOpenUserModal */}
          //disabled={!!formData.email}
        >
          Selecione Comprador
        </CustomButton>
      </SContainerBuyer>
    </SContainer>
  );
};
