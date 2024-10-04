import { useCallback, useEffect } from "react";
import { CustomInput } from "../../../../../../components/CustomInput";
import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { StepProps } from "../../types";
import { SContainer, SText, STextArea } from "./styles";
import { fieldInfo, FieldType } from "./types";
import CustomDatePicker from "../../../../../../components/CustomDatePicker";
import { insertMaskInCnpj } from "../../../../../../helpers/front-end/insertMaskInCnpj";
import { getCommissionFormat } from "./helpers";
import {
  usePriceHandlers,
  useExchangeRateHandlers,
  useCommissionHandlers,
} from "./hooks";

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

  const modeSave = isEditMode ? false : true;

  const handleFieldPickupChange = (value: string) => {
    const info = fieldInfo[value as FieldType];
    updateFormData?.({
      ...formData,
      type_pickup: value,
      pickup: info.pickup,
      pickup_location: info.pickupLocation,
      inspection: info.inspection,
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

  useEffect(() => {
    const price = parseFloat(formData.price.replace(",", "."));
    const quantityToKG = Number(formData.quantity.replace(",", ".")) * 1000;
    const quantityToBag = (Number(quantityToKG) / 60).toFixed(3);
    const totalContractValue = Number(price * Number(quantityToBag)).toFixed(3);

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
    cpf_cnpj: string
  ) => {
    return `No dia ${date}, via Banco ...., Ag. nr. ....., c/c nr. ......, no CNPJ: ${cpf_cnpj} em nome de ${sellerName}.`;
  };

  const handleDateChange = useCallback(
    (newDate: string) => {
      if (updateFormData) {
        console.log(formData.seller?.name);
        const sellerName = formData.seller?.name || "vendedor";
        const cpf_cnpj = formData.seller?.cnpj_cpf
          ? insertMaskInCnpj(formData.seller.cnpj_cpf)
          : "00.000.000/0000-00";
        const paymentText = formatPaymentText(newDate, sellerName, cpf_cnpj);

        updateFormData({
          payment_date: newDate,
          payment: paymentText,
        });
      }
    },
    [updateFormData, formData.seller]
  );

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
            : formatCurrency(formData.price, formData.type_currency, modeSave)
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
              : formatCurrency(formData.day_exchange_rate, "Real", modeSave)
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
        onChange={handleDateChange}
        value={formData.payment_date}
        disableWeekends
      />
      <SText>Pagamento:</SText>
      <STextArea
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
            : `${getCommissionFormat(formData.type_commission_seller || "")}${
                formData.commission_seller
              }`
        }
        radioOptions={[
          { label: "Percentual", value: "Percentual" },
          { label: "Valor", value: "Valor" },
        ]}
        onFocus={() => handleCommissionFocus("seller")}
        onBlur={() => handleCommissionBlur("seller")}
        radioPosition="inline"
        onRadioChange={(e) => handleRadioChange(e, "type_commission_seller")}
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
            : `${getCommissionFormat(formData.type_commission_buyer || "")}${
                formData.commission_buyer
              }`
        }
        onFocus={() => handleCommissionFocus("buyer")}
        onBlur={() => handleCommissionBlur("buyer")}
        radioOptions={[
          { label: "Percentual", value: "Percentual" },
          { label: "Valor", value: "Valor" },
        ]}
        radioPosition="inline"
        onRadioChange={(e) => handleRadioChange(e, "type_commission_buyer")}
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

      <CustomInput
        type="text"
        name="inspection"
        label="Conferência:"
        $labelPosition="top"
        onChange={handleChange}
        value={formData.inspection}
      />
    </SContainer>
  );
};
