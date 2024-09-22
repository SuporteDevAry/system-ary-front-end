import { useEffect, useState } from "react";
import { CustomInput } from "../../../../../../components/CustomInput";
import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { StepProps } from "../../types";
import { SContainer, SText, STextArea } from "./styles";
import { fieldInfo, FieldType } from "./types";

export const Step3: React.FC<StepProps> = ({
    id,
    handleChange,
    formData,
    updateFormData,
    isEditMode,
}) => {
    const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);

    const modeSave = isEditMode ? false : true;

    const handleFieldPickupChange = (value: string) => {
        const info = fieldInfo[value as FieldType];
        updateFormData?.({
            ...formData,
            type_pickup: value,
            pickup: info.pickup,
            pickup_location: info.pickupLocation,
        });
    };

    const handleRadioChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        name: string
    ) => {
        const { value } = event.target;

        if (name === "type_pickup") return handleFieldPickupChange(value);

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

        handleChange?.({
            ...event,
            target: {
                ...event.target,
                name,
                value,
            },
        });
    };

    const handlePriceFocus = () => {
        setIsEditingPrice(true);
    };

    const handlePriceBlur = () => {
        setIsEditingPrice(false);

        const rawPrice = formData.price;
        updateFormData?.({
            ...formData,
            price: rawPrice.toString(),
        });
    };

    useEffect(() => {
        const price = parseFloat(formData.price.replace(",", "."));
        const quantityToKG = Number(formData.quantity.replace(",", ".")) * 1000;
        const quantityToBag = Math.round(Number(quantityToKG) / 60).toFixed(2);
        const totalContractValue = Math.round(
            price * Number(quantityToBag)
        ).toFixed(2);

        if (totalContractValue) {
            updateFormData?.({
                ...formData,
                total_contract_value: parseFloat(totalContractValue),
                //quantity: formData.quantity,
                quantity_kg: quantityToKG,
                quantity_bag: Number(quantityToBag),
            });
        }
    }, [formData.price, formData.quantity]);

    return (
        <SContainer id={id}>
            <CustomInput
                type="text"
                name="quantity"
                label="Quantidade:"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.quantity}
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

            <CustomInput
                type="text"
                name="payment"
                label="Pagamento:"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.payment}
            />
            <CustomInput
                type="number"
                name="commission_seller"
                label="Comissão Vendedor:"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.commission_seller}
                radioOptions={[
                    { label: "Percentual", value: "Percentual" },
                    { label: "Valor", value: "Valor" },
                ]}
                radioPosition="inline"
                onRadioChange={(e) =>
                    handleRadioChange(e, "type_commission_seller")
                }
                selectedRadio={formData.type_commission_seller}
            />
            <CustomInput
                type="number"
                name="commission_buyer"
                label="Comissão Comprador:"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.commission_buyer}
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
                type="text"
                name="pickup"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.pickup}
                radioOptions={[
                    { label: "Entrega", value: "Entrega" },
                    { label: "Retirada", value: "Retirada" },
                    { label: "Embarque", value: "Embarque" },
                ]}
                radioPosition="inline"
                onRadioChange={(e) => handleRadioChange(e, "type_pickup")}
                selectedRadio={formData.type_pickup}
            />

            <CustomInput
                type="text"
                name="pickup_location"
                label={`Local de ${formData.type_pickup}:`}
                $labelPosition="top"
                onChange={handleChange}
                value={formData.pickup_location}
            />

            <SText>Conferência:</SText>
            <STextArea
                name="inspection"
                onChange={handleChange}
                value={formData.inspection}
            />
        </SContainer>
    );
};
