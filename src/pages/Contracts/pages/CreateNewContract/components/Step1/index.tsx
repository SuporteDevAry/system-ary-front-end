import React, { useCallback, useEffect, useState } from "react";

import Box from "@mui/material/Box";
import { CustomInput } from "../../../../../../components/CustomInput";
import CustomButton from "../../../../../../components/CustomButton";
import { SContainer, SContainerBuyer, SContainerSeller } from "./styles";
import { ModalClientes } from "./components/ModalClientes";
import { ClienteContext } from "../../../../../../contexts/ClienteContext";

import { IListCliente } from "../../../../../../contexts/ClienteContext/types";
import { StepProps } from "../../types";
import { SText, STextArea } from "../Step2/styles";
import { CustomerInfo } from "../../../../../../contexts/ContractContext/types";
import { getDataUserFromToken } from "../../../../../../contexts/AuthProvider/util";

export const Step1: React.FC<StepProps> = ({
  handleChange,
  formData,
  updateFormData,
}) => {
  const [isCustomerModalOpen, setCustomerModalOpen] = useState<boolean>(false);
  const [selectionType, setSelectionType] = useState<"buyer" | "seller">(
    "buyer"
  );

  const clienteContext = ClienteContext();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clientes, setClientes] = useState<IListCliente[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await clienteContext.listClientes();
      setClientes(response.data);
    } catch (error) {
      console.error("Erro lendo clientes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [clienteContext]);

  useEffect(() => {
    fetchData();
    const userInfo = getDataUserFromToken();
    if (userInfo?.email) {
      updateFormData?.({ owner_contract: userInfo.email });
    }
  }, []);

  const handleOpenCustomerModal = (type: "buyer" | "seller") => {
    setSelectionType(type);
    setCustomerModalOpen(true);
  };

  const handleCloseCustomerModal = () => {
    setCustomerModalOpen(false);
  };

  const handleSelected = (
    selectCustomerData: CustomerInfo & { type: "seller" | "buyer" }
  ) => {
    if (updateFormData) {
      // Atualiza o formData com os dados do cliente selecionado
      updateFormData({
        ...formData,
        [selectCustomerData.type]: {
          ...selectCustomerData,
        },
      });
    }
  };

  return (
    <>
      <SContainer>
        <CustomInput
          type="text"
          name="numberBroker"
          label="Nº Corretor:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.numberBroker}
        />

        <SContainerSeller>
          <Box>
            <CustomInput
              type="text"
              name="seller"
              label="Vendedor: "
              $labelPosition="top"
              onChange={handleChange}
              value={formData?.seller?.name}
            />
          </Box>
          <CustomButton
            $variant="success"
            width="180px"
            onClick={() => handleOpenCustomerModal("seller")}
          >
            Selecione Vendedor
          </CustomButton>
        </SContainerSeller>
        <SText>Lista de Email Vendedor:</SText>
        <STextArea
          name="listEmailSeller"
          onChange={handleChange}
          value={formData.listEmailSeller}
        />
        <SContainerBuyer>
          <Box>
            <CustomInput
              type="text"
              name="buyer"
              label="Comprador:"
              $labelPosition="top"
              onChange={handleChange}
              value={formData?.buyer?.name}
            />
          </Box>
          <CustomButton
            $variant="success"
            width="180px"
            onClick={() => handleOpenCustomerModal("buyer")}
          >
            Selecione Comprador
          </CustomButton>
        </SContainerBuyer>
        <SText>Lista de Email Comprador :</SText>
        <STextArea
          name="listEmailBuyer"
          onChange={handleChange}
          value={formData.listEmailBuyer}
        />
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
