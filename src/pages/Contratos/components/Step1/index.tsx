import React, { useState } from "react";
import { StepProps } from "../../types";
import Box from "@mui/material/Box";
import { CustomInput } from "../../../../components/CustomInput";
import CustomButton from "../../../../components/CustomButton";
import { SContainer, SContainerBuyer, SContainerSeller } from "./style";
import { ModalClientes } from "./components/ModalClientes";

export const Step1: React.FC<StepProps> = ({ handleChange, formData }) => {
  const [isCustomerModalOpen, setCustomerModalOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
  } | null>(null);

  const handleOpenCustomerModal = async () => {
    console.log("Vou abrir o Modal");
    setCustomerModalOpen(true);
  };

  const handleCloseCustomerModal = () => {
    console.log("Vou fechar o Modal");
    setCustomerModalOpen(false);
  };

  const handleSelected = (selectCustomerData: { name: string }) => {
    alert("oi");
    setSelectedCustomer(selectCustomerData);
  };

  return (
    <>
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
            onClick={handleOpenCustomerModal}
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
            onClick={handleOpenCustomerModal}
          >
            Selecione Comprador
          </CustomButton>
        </SContainerBuyer>
      </SContainer>

      <ModalClientes
        open={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        onConfirm={handleSelected}
      />
    </>
  );
};
