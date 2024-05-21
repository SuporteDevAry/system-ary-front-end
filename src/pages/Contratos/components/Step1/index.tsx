import React from "react";
import { StepProps } from "../../types";
import Box from "@mui/material/Box";
import { CustomInput } from "../../../../components/CustomInput";
import CustomButton from "../../../../components/CustomButton";
import { SContainer, SContainerBuyer, SContainerSeller } from "./style";

export const Step1: React.FC<StepProps> = ({ handleChange, formData }) => {
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
            //readOnly
            value={formData.seller}
          />
        </Box>
        <CustomButton
          variant="success"
          width="180px"
          //onClick={() => {handleOpenUserModal}}
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
            //readOnly
            value={formData.buyer}
          />
        </Box>
        <CustomButton
          variant="success"
          width="180px"
          //onClick={() => {handleOpenUserModal}}
        >
          Selecione Comprador
        </CustomButton>
      </SContainerBuyer>
    </SContainer>
  );
};
