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
import { toast } from "react-toastify";

export const Step1: React.FC<StepProps> = ({
  id,
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
      toast.error(
        `Erro ao tentar ler clientes, contacte o administrador do sistema ${error}`
      );
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

  const handleOpenCustomerModal = useCallback((type: "buyer" | "seller") => {
    setSelectionType(type);
    setCustomerModalOpen(true);
  }, []);

  const handleCloseCustomerModal = useCallback(() => {
    setCustomerModalOpen(false);
  }, []);

  const handleSelected = useCallback(
    (selectCustomerData: CustomerInfo & { type: "seller" | "buyer" }) => {
      if (updateFormData) {
        updateFormData({
          [selectCustomerData.type]: {
            name: selectCustomerData.name,
            address: selectCustomerData.address,
            number: selectCustomerData.number,
            complement: selectCustomerData.complement,
            district: selectCustomerData.district,
            city: selectCustomerData.city,
            state: selectCustomerData.state,
            cnpj_cpf: selectCustomerData.cnpj_cpf,
            ins_est: selectCustomerData.ins_est,
          },
        });
      }
    },
    [formData, updateFormData, handleCloseCustomerModal]
  );

  return (
    <>
      <SContainer id={id}>
        <CustomInput
          type="text"
          name="number_broker"
          label="Nº Corretor:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.number_broker}
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
          name="list_email_seller"
          onChange={handleChange}
          value={formData.list_email_seller}
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
          name="list_email_buyer"
          onChange={handleChange}
          value={formData.list_email_buyer}
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
