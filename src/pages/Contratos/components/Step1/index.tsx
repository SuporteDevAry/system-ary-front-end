import React, { useEffect, useState } from "react";
import { StepProps } from "../../types";
import Box from "@mui/material/Box";
import { CustomInput } from "../../../../components/CustomInput";
import CustomButton from "../../../../components/CustomButton";
import { SContainer, SContainerBuyer, SContainerSeller } from "./style";
import { ModalClientes } from "./components/ModalClientes";
import { ClienteContext } from "../../../../contexts/ClienteContext";

import { IListCliente } from "../../../../contexts/ClienteContext/types";

export const Step1: React.FC<StepProps> = ({ handleChange, formData }) => {
  const [isCustomerModalOpen, setCustomerModalOpen] = useState<boolean>(false);
  const [selectionType, setSelectionType] = useState<"buyer" | "seller">(
    "buyer"
  );
  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
  } | null>(null);

  const clienteContext = ClienteContext();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clientes, setClientes] = useState<IListCliente[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await clienteContext.listClientes();
      setClientes(response.data);
    } catch (error) {
      console.error("Erro lendo clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCustomerModal = (type: "buyer" | "seller") => {
    setSelectionType(type);
    setCustomerModalOpen(true);
  };

  const handleCloseCustomerModal = () => {
    setCustomerModalOpen(false);
  };

  const handleSelected = (selectCustomerData: {
    name: string;
    type: string;
  }) => {
    console.log("Salvo no Index", selectedCustomer, selectCustomerData);
    setSelectedCustomer(selectCustomerData);
    if (handleChange) {
      const event = {
        target: {
          name: selectCustomerData.type,
          value: selectCustomerData.name,
        } as EventTarget & HTMLInputElement,
      } as React.ChangeEvent<HTMLInputElement>;

      handleChange(event);
    }
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
              value={formData.seller}
            />
          </Box>
          <CustomButton
            variant="success"
            width="180px"
            onClick={() => handleOpenCustomerModal("seller")}
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
              value={formData.buyer}
            />
          </Box>
          <CustomButton
            variant="success"
            width="180px"
            onClick={() => handleOpenCustomerModal("buyer")}
          >
            Selecione Comprador
          </CustomButton>
        </SContainerBuyer>
      </SContainer>

      <ModalClientes
        open={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        onConfirm={handleSelected}
        data={clientes}
        loading={isLoading}
        selectionType={selectionType}
      />
    </>
  );
};
