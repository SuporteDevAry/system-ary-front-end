import { useCallback, useEffect, useState } from "react";
import { CustomInput } from "../../../../../../components/CustomInput";
import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { StepProps } from "../../types";
import { SContainer, SContentBox } from "./styles";
import { fieldInfo, FieldType } from "./types";
import CustomDatePicker from "../../../../../../components/CustomDatePicker";
import { insertMaskInCnpj } from "../../../../../../helpers/front-end/insertMaskInCnpj";
import { getCommissionFormat } from "./helpers";
import {
    usePriceHandlers,
    useExchangeRateHandlers,
    useCommissionHandlers,
    useQuantityHandlers,
} from "./hooks";
import { CustomTextArea } from "../../../../../../components/CustomTextArea";

export const Step3: React.FC<StepProps> = ({
    id,
    handleChange,
    formData,
    updateFormData,
    isEditMode,
}) => {
    const { isEditingPrice, handlePriceFocus, handlePriceBlur } =
        usePriceHandlers(formData, updateFormData);

    const {
        isEditingExchangeRate,
        handleExchangeRateFocus,
        handleExchangeRateBlur,
    } = useExchangeRateHandlers();

    const { isEditingCommission, handleCommissionFocus, handleCommissionBlur } =
        useCommissionHandlers();

    const {
        isEditingQuantity,
        handleQuantityChange,
        handleQuantityFocus,
        handleQuantityBlur,
        formatQuantity,
    } = useQuantityHandlers(formData, updateFormData);

    const modeSave = isEditMode ? false : true;

    const [initialPickupDate, SetInitialPickupDate] = useState<string>(
        formData.initial_pickup_date
    );
    const [finalPickupDate, SetFinalPickupDate] = useState<string>(
        formData.final_pickup_date
    );

    const concatenatedPickupText =
        initialPickupDate === finalPickupDate
            ? `Até o dia ${initialPickupDate}`
            : `De ${initialPickupDate} até ${finalPickupDate}`;

    const handleFieldPickupChange = (
        value: string,
        concatenatedPickupText: string
    ) => {
        const info = fieldInfo[value as FieldType];

        updateFormData?.({
            ...formData,
            type_pickup: value,
            pickup: info.pickup(concatenatedPickupText),
            pickup_location: formData.pickup_location
                ? formData.pickup_location
                : info.pickupLocation,
            inspection: info.inspection,
        });
    };

    const handleRadioChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
            const { value } = event.target;

            if (name === "type_pickup")
                return handleFieldPickupChange(value, concatenatedPickupText);

            if (name === "type_icms") {
                updateFormData?.({
                    ...formData,
                    type_icms: value,
                    icms: value,
                });
                return;
            }

            if (name === "type_commission_seller") {
                updateFormData?.({
                    ...formData,
                    type_commission_seller: value,
                });
                return;
            }

            if (name === "type_commission_buyer") {
                updateFormData?.({
                    ...formData,
                    type_commission_buyer: value,
                });
                return;
            }

            if (name === "farm_direct") {
                const addFarm =
                    "Direto da Lavoura, sem custo de recebimento e padronização.";
                updateFormData?.({
                    ...formData,
                    farm_direct: value,
                    pickup:
                        value !== "Não"
                            ? formData.pickup.replace(
                                  "limpo e seco sobre rodas.",
                                  addFarm
                              )
                            : formData.pickup.replace(
                                  addFarm,
                                  "limpo e seco sobre rodas."
                              ),
                });

                return;
            }

            handleChange?.({
                ...event,
                target: {
                    ...event.target,
                    name,
                    value,
                },
            });
        },
        [formData, updateFormData, handleChange, handleFieldPickupChange]
    );

    useEffect(() => {
        const price = parseFloat(formData.price.replace(",", "."));
        /*Todo:Esse código abaixo, poderá ser utilizado no futuro!
         *Number(formData.quantity.replace(",", ".")) * 1000;
         */

        const quantityToKG = Number(formData.quantity.replace(".", ""));
        const quantityToBag = (Number(quantityToKG) / 60).toFixed(3);
        const totalContractValue = Number(
            price * Number(quantityToBag)
        ).toFixed(3);

        if (totalContractValue) {
            updateFormData?.({
                ...formData,
                total_contract_value: parseFloat(totalContractValue),
                quantity_kg: quantityToKG,
                quantity_bag: Number(quantityToBag),
            });
        }
    }, [formData.price, formData.quantity]);

    const handleNumericInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = event.target;

        // Permitir apenas números, vírgula e ponto
        const regex = /^[0-9]*[.,]?[0-9]*$/;

        if (regex.test(value)) {
            handleChange?.({
                ...event,
                target: {
                    ...event.target,
                    name,
                    value,
                },
            });
        }
    };

    const formatPaymentText = (
        date: string,
        sellerName: string,
        cpfCnpj: string,
        bankName: string,
        accountNumber: string,
        agency: string
    ) => {
        return `No dia ${date}, via Banco ${bankName || "...."}, Ag. nr. ${
            agency || "...."
        }, c/c nr. ${
            accountNumber || "...."
        }, no CNPJ: ${cpfCnpj} em nome de ${sellerName}.`;
    };

    const handleDateForPaymentChange = useCallback(
        (newDate: string) => {
            if (updateFormData) {
                const dataBank =
                    formData.seller?.account?.filter((i) => i.main === "S") ||
                    [];

                const sellerName = dataBank[0].name_pagto
                    ? dataBank[0].name_pagto
                    : formData.seller?.name || "vendedor";

                //Alterar aqui embaixo, quando o cnpj_pagto estiver vindo do accounts
                const cpfCnpj = dataBank[0].cnpj_pagto
                    ? insertMaskInCnpj(dataBank[0].cnpj_pagto)
                    : formData.seller?.cnpj_cpf
                    ? insertMaskInCnpj(formData.seller.cnpj_cpf)
                    : "00.000.000/0000-00";

                const {
                    bank_name: bankName,
                    account_number: accountNumber,
                    agency,
                } = dataBank[0];

                if (dataBank.length === 0) {
                    const paymentText = formatPaymentText(
                        newDate,
                        sellerName,
                        cpfCnpj,
                        bankName,
                        accountNumber,
                        agency
                    );

                    updateFormData({
                        payment_date: newDate,
                        payment: paymentText,
                    });
                    return;
                }

                const paymentText = formatPaymentText(
                    newDate,
                    sellerName,
                    cpfCnpj,
                    bankName,
                    accountNumber,
                    agency
                );

                updateFormData({
                    payment_date: newDate,
                    payment: paymentText,
                });
            }
        },
        [updateFormData, formData.seller]
    );

    useEffect(() => {
        if (formData.type_pickup) {
            handleFieldPickupChange(
                formData.type_pickup,
                concatenatedPickupText
            );
        }
    }, [initialPickupDate, finalPickupDate, formData.type_pickup]);

    const handleDateChange = useCallback(
        (newDate: string, name: string) => {
            if (name === "initial_pickup_date") {
                updateFormData?.({
                    ...formData,
                    initial_pickup_date: newDate,
                });
                SetInitialPickupDate(newDate);
            } else if (name === "final_pickup_date") {
                updateFormData?.({
                    ...formData,
                    final_pickup_date: newDate,
                });
                SetFinalPickupDate(newDate);
            }
        },
        [updateFormData, formData]
    );

    return (
        <SContainer id={id}>
            <CustomInput
                type="text"
                name="quantity"
                label="Quantidade:"
                $labelPosition="top"
                onChange={handleQuantityChange}
                onFocus={handleQuantityFocus}
                onBlur={handleQuantityBlur}
                value={
                    isEditingQuantity
                        ? formData.quantity
                        : formatQuantity(formData.quantity)
                }
            />

            <CustomInput
                type="text"
                name="price"
                label={`Preço em ${formData.type_currency}:`}
                $labelPosition="top"
                onChange={handleChange}
                onFocus={handlePriceFocus}
                onBlur={handlePriceBlur}
                value={
                    isEditingPrice
                        ? formData.price
                        : formatCurrency(
                              formData.price,
                              formData.type_currency,
                              modeSave
                          )
                }
                radioOptions={[
                    { label: "BRL", value: "Real" },
                    { label: "USD", value: "Dólar" },
                ]}
                radioPosition="inline"
                onRadioChange={(e) => handleRadioChange(e, "type_currency")}
                selectedRadio={formData.type_currency}
            />

            {formData.type_currency === "Dólar" && (
                <CustomInput
                    type="text"
                    name="day_exchange_rate"
                    label="Câmbio do Dia:"
                    $labelPosition="top"
                    onChange={handleNumericInputChange}
                    onFocus={handleExchangeRateFocus}
                    onBlur={handleExchangeRateBlur}
                    value={
                        isEditingExchangeRate
                            ? formData.day_exchange_rate
                            : formData.day_exchange_rate
                    }
                />
            )}

            <CustomInput
                type="text"
                name="icms"
                label="ICMS:"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.icms}
                radioOptions={[
                    { label: "Isento", value: "Isento" },
                    { label: "Incluso", value: "Incluso" },
                    { label: "Diferido", value: "Diferido" },
                ]}
                radioPosition="inline"
                onRadioChange={(e) => handleRadioChange(e, "type_icms")}
                selectedRadio={formData.type_icms}
            />
            <CustomDatePicker
                width="260px"
                height="38x"
                name="payment_date"
                label="Data do Pagamento:"
                $labelPosition="top"
                onChange={handleDateForPaymentChange}
                value={formData.payment_date}
                disableWeekends
            />

            <CustomTextArea
                height="230px"
                label="Pagamento:"
                name="payment"
                onChange={handleChange}
                value={formData.payment}
            />
            <CustomInput
                name="commission_seller"
                label="Comissão Vendedor:"
                $labelPosition="top"
                onChange={handleNumericInputChange}
                value={
                    isEditingCommission.seller
                        ? formData.commission_seller
                        : formData.type_commission_seller === "Valor"
                        ? `${getCommissionFormat(
                              formData.type_commission_seller || ""
                          )}${formData.commission_seller}`
                        : `${formData.commission_seller}${getCommissionFormat(
                              formData.type_commission_seller || ""
                          )}`
                }
                radioOptions={[
                    { label: "Percentual", value: "Percentual" },
                    { label: "Valor", value: "Valor" },
                ]}
                onFocus={() => handleCommissionFocus("seller")}
                onBlur={() => handleCommissionBlur("seller")}
                radioPosition="inline"
                onRadioChange={(e) =>
                    handleRadioChange(e, "type_commission_seller")
                }
                selectedRadio={formData.type_commission_seller}
            />
            <CustomInput
                name="commission_buyer"
                label="Comissão Comprador:"
                $labelPosition="top"
                onChange={handleNumericInputChange}
                value={
                    isEditingCommission.buyer
                        ? formData.commission_buyer
                        : formData.type_commission_buyer === "Valor"
                        ? `${getCommissionFormat(
                              formData.type_commission_buyer || ""
                          )}${formData.commission_buyer}`
                        : `${formData.commission_buyer}${getCommissionFormat(
                              formData.type_commission_buyer || ""
                          )}`
                }
                onFocus={() => handleCommissionFocus("buyer")}
                onBlur={() => handleCommissionBlur("buyer")}
                radioOptions={[
                    { label: "Percentual", value: "Percentual" },
                    { label: "Valor", value: "Valor" },
                ]}
                radioPosition="inline"
                onRadioChange={(e) =>
                    handleRadioChange(e, "type_commission_buyer")
                }
                selectedRadio={formData.type_commission_buyer}
            />

            <CustomInput
                name="type_pickup"
                radioPosition="only"
                radioOptions={[
                    { label: "CIF / Porto/Ferrovia", value: "Entrega" },
                    { label: "FOB", value: "Retirada" },
                    //{ label: "CIF Porto/Ferrovia", value: "Entrega " },
                ]}
                onRadioChange={(e) => handleRadioChange(e, "type_pickup")}
                selectedRadio={formData.type_pickup}
            />

            <SContentBox>
                <CustomDatePicker
                    width="150px"
                    height="38x"
                    name="initial_pickup_date"
                    label="De:"
                    $labelPosition="top"
                    onChange={(date) =>
                        handleDateChange(date, "initial_pickup_date")
                    }
                    value={formData.initial_pickup_date}
                />
                <CustomDatePicker
                    width="150px"
                    height="38x"
                    name="final_pickup_date"
                    label="Até:"
                    $labelPosition="top"
                    onChange={(date) =>
                        handleDateChange(date, "final_pickup_date")
                    }
                    value={formData.final_pickup_date}
                />
            </SContentBox>

            <CustomTextArea
                width="308px"
                height="70px"
                name="pickup"
                onChange={handleChange}
                value={formData.pickup}
            />

            <CustomInput
                name="farm_direct"
                label="Direto da Lavoura:"
                $labelPosition="left"
                radioPosition="only"
                radioOptions={[
                    { label: "Sim", value: "Direto da Lavoura" },
                    { label: "Não", value: "Não" },
                ]}
                onRadioChange={(e) => handleRadioChange(e, "farm_direct")}
                selectedRadio={formData.farm_direct}
            />

            <CustomTextArea
                width="308px"
                height="70px"
                name="pickup_location"
                label={`Local de ${formData.type_pickup}:`}
                onChange={handleChange}
                value={formData.pickup_location}
            />

            <CustomTextArea
                width="308px"
                height="70px"
                name="inspection"
                label="Conferência:"
                onChange={handleChange}
                value={formData.inspection}
            />
        </SContainer>
    );
};
