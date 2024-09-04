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
}) => {
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);

  const handleFieldPickupChange = (value: string) => {
    const info = fieldInfo[value as FieldType];
    updateFormData?.({
      ...formData,
      typePickup: value,
      pickup: info.pickup,
      pickupLocation: info.pickupLocation,
    });
  };

  const handleRadioChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    const { value } = event.target;

    if (name === "typePickup") return handleFieldPickupChange(value);

    if (name === "typeICMS") {
      updateFormData?.({
        ...formData,
        typeICMS: value,
        icms: value,
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
    const quantityWorked = !formData.quantity.match(/,/g)
      ? formData.quantity.replace(/[.]/g, "")
      : formData.quantity.replace(/[,]/g, ".");

    const price = parseFloat(formData.price.replace(",", "."));
    const quantityToKG = Number(quantityWorked) * 1000;
    const quantityToBag = quantityToKG / 60;
    const totalContractValue = Math.round(price * quantityToBag).toFixed(2);

    if (totalContractValue) {
      updateFormData?.({
        ...formData,
        total_contract_value: parseFloat(totalContractValue),
        quantity_kg: quantityToKG,
        quantity_bag: quantityToBag,
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
        label={`Preço em ${formData.typeCurrency}:`}
        $labelPosition="top"
        onChange={handleChange}
        onFocus={handlePriceFocus}
        onBlur={handlePriceBlur}
        value={
          isEditingPrice
            ? formData.price
            : formatCurrency(formData.price, formData.typeCurrency)
        }
        radioOptions={[
          { label: "BRL", value: "Real" },
          { label: "USD", value: "Dólar" },
        ]}
        radioPosition="inline"
        onRadioChange={(e) => handleRadioChange(e, "typeCurrency")}
        selectedRadio={formData.typeCurrency}
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
        onRadioChange={(e) => handleRadioChange(e, "typeICMS")}
        selectedRadio={formData.typeICMS}
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
        name="commissionSeller"
        label="Comissão Vendedor:"
        $labelPosition="top"
        onChange={handleChange}
        value={formData.commissionSeller}
      />
      <CustomInput
        type="number"
        name="commissionBuyer"
        label="Comissão Comprador:"
        $labelPosition="top"
        onChange={handleChange}
        value={formData.commissionBuyer}
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
        onRadioChange={(e) => handleRadioChange(e, "typePickup")}
        selectedRadio={formData.typePickup}
      />

      <CustomInput
        type="text"
        name="pickupLocation"
        label={`Local de ${formData.typePickup}:`}
        $labelPosition="top"
        onChange={handleChange}
        value={formData.pickupLocation}
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
