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
import { CustomDatePicker } from "../../../../../../components/CustomDatePicker";
import CustomTooltipLabel from "../../../../../../components/CustomTooltipLabel";

export const Step1: React.FC<StepProps> = ({
    id,
    handleChange,
    formData,
    updateFormData,
}) => {
    const [isCustomerModalOpen, setCustomerModalOpen] =
        useState<boolean>(false);
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
                        account: selectCustomerData.account,
                        cnpj_pagto: selectCustomerData.cnpj_pagto,
                    },
                });
            }
        },
        [formData, updateFormData, handleCloseCustomerModal]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, type: "seller" | "buyer") => {
            const { value } = e.target;

            if (updateFormData) {
                updateFormData({
                    [type]: {
                        ...formData[type],
                        name: value, // Atualiza apenas o campo name
                    },
                });
            }
        },
        [updateFormData, formData]
    );

    const handleDateChange = useCallback(
        (newDate: string) => {
            if (updateFormData) {
                updateFormData({ contract_emission_date: newDate });
            }
        },
        [updateFormData]
    );

    return (
        <>
            <SContainer id={id}>
                <CustomDatePicker
                    width="260px"
                    height="38x"
                    name="contract_emission_date"
                    label={
                        <CustomTooltipLabel
                            title={`Defina uma data, por mais que ela seja o dia atual.`}
                        >
                            Data de Emissão do Contrato:
                        </CustomTooltipLabel>
                    }
                    $labelPosition="top"
                    onChange={handleDateChange}
                    value={formData.contract_emission_date}
                    disableWeekends
                />

                <CustomInput
                    type="text"
                    name="number_broker"
                    label="Nº Corretor:"
                    $labelPosition="top"
                    onChange={handleChange}
                    value={formData.number_broker}
                    //readOnly={isEditMode} permitindo editar o broker
                />

                <SContainerSeller>
                    <Box>
                        <CustomInput
                            type="text"
                            name="seller"
                            label="Vendedor: "
                            $labelPosition="top"
                            onChange={(e) => handleInputChange(e, "seller")}
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
                            onChange={(e) => handleInputChange(e, "buyer")}
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
