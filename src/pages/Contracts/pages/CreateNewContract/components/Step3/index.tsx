import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { CustomInput } from "../../../../../../components/CustomInput";
import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { StepProps } from "../../types";
import {
  SContainer,
  SContentBox,
  SCommissionWrapper,
  SRadioGroup,
  SRadioOption,
  SLabel,
  SCustomInput,
} from "./styles";
import { fieldInfo, FieldType } from "./types";
import CustomDatePicker from "../../../../../../components/CustomDatePicker";
import { insertMaskInCnpj } from "../../../../../../helpers/front-end/insertMaskInCnpj";
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
  const modeSave: boolean = isEditMode ? false : true;

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

  const [initialPickupDate, SetInitialPickupDate] = useState<string>(
    formData.initial_pickup_date,
  );
  const [finalPickupDate, SetFinalPickupDate] = useState<string>(
    formData.final_pickup_date,
  );

  const concatenatedPickupText =
    initialPickupDate === finalPickupDate
      ? `Até o dia ${initialPickupDate}`
      : `De ${initialPickupDate} até ${finalPickupDate}`;
  const isMetricTon = formData.type_quantity === "toneladas métricas";

  const handleFieldPickupChange = (
    value: string,
    concatenatedPickupText: string,
  ) => {
    const info = fieldInfo[value as FieldType];

    updateFormData?.({
      ...formData,
      type_pickup: value,
      pickup: info.pickup(concatenatedPickupText),
      pickup_location: formData.pickup_location
        ? formData.pickup_location
        : info.pickupLocation,
      inspection:
        formData.product === "O"
          ? `${info.inspection} Diferenças de peso de até 0,25% serão consideradas como normais entre balanças.`
          : `${info.inspection}`,
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
        if (isMetricTon && value === "Por Saca") {
          return;
        }

        updateFormData?.({
          ...formData,
          type_commission_seller: value,
          // Define moeda padrão ao mudar tipo de comissão
          type_commission_seller_currency:
            value === "Fixo" || value === "Por Saca"
              ? formData.type_commission_seller_currency || "Real"
              : "",
        });
        return;
      }

      if (name === "type_commission_buyer") {
        if (isMetricTon && value === "Por Saca") {
          return;
        }

        updateFormData?.({
          ...formData,
          type_commission_buyer: value,
          type_commission_buyer_currency:
            value === "Fixo" || value === "Por Saca"
              ? formData.type_commission_buyer_currency || "Real"
              : "",
        });
        return;
      }

      if (name === "type_commission_seller_currency") {
        updateFormData?.({
          ...formData,
          type_commission_seller_currency: value,
        });
        return;
      }

      if (name === "type_commission_buyer_currency") {
        updateFormData?.({
          ...formData,
          type_commission_buyer_currency: value,
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
              ? formData.pickup.replace("limpo e seco sobre rodas.", addFarm)
              : formData.pickup.replace(addFarm, "limpo e seco sobre rodas."),
        });

        return;
      }

      if (name === "type_quantity") {
        // Converte o valor da quantidade quando troca entre quilos e toneladas
        let convertedQuantity = formData.quantity;
        const currentType = formData.type_quantity;

        // Remove formatação para fazer a conversão
        const numericValue = parseFloat(
          formData.quantity.replace(/\./g, "").replace(",", "."),
        );

        if (!isNaN(numericValue)) {
          // De quilos para toneladas métricas
          if (currentType === "quilos" && value === "toneladas métricas") {
            const inTonnes = numericValue / 1000;
            convertedQuantity = inTonnes.toFixed(3).replace(".", ",");
          }
          // De toneladas métricas para quilos
          else if (currentType === "toneladas métricas" && value === "quilos") {
            const inKg = numericValue * 1000;
            convertedQuantity = inKg.toFixed(3).replace(".", ",");
          }
        }

        const isSwitchingToMetricTon = value === "toneladas métricas";

        updateFormData?.({
          ...formData,
          type_quantity: value,
          quantity: convertedQuantity,
          ...(isSwitchingToMetricTon &&
          formData.type_commission_seller === "Por Saca"
            ? {
                type_commission_seller: "",
                type_commission_seller_currency: "",
                commission_seller: "",
                commission_seller_exchange_rate: "",
                commission_seller_contract_value: undefined,
              }
            : {}),
          ...(isSwitchingToMetricTon &&
          formData.type_commission_buyer === "Por Saca"
            ? {
                type_commission_buyer: "",
                type_commission_buyer_currency: "",
                commission_buyer: "",
                commission_buyer_exchange_rate: "",
                commission_buyer_contract_value: undefined,
              }
            : {}),
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
    [
      formData,
      updateFormData,
      handleChange,
      handleFieldPickupChange,
      isMetricTon,
    ],
  );

  const handleNumericInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
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

  const handleCommissionTypeToggle = useCallback(
    (type: "seller" | "buyer", value: string) => {
      if (!updateFormData) return;

      if (type === "seller") {
        if (formData.type_commission_seller === value) {
          updateFormData({
            ...formData,
            type_commission_seller: "",
            type_commission_seller_currency: "",
            commission_seller: "",
            commission_seller_exchange_rate: "",
            commission_seller_contract_value: undefined,
          });
        }
        return;
      }

      if (formData.type_commission_buyer === value) {
        updateFormData({
          ...formData,
          type_commission_buyer: "",
          type_commission_buyer_currency: "",
          commission_buyer: "",
          commission_buyer_exchange_rate: "",
          commission_buyer_contract_value: undefined,
        });
      }
    },
    [formData, updateFormData],
  );

  const formatPaymentText = (
    date: string,
    sellerName: string,
    cpfCnpj: string,
    bankName: string,
    accountNumber: string,
    agency: string,
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
          formData.seller?.account?.filter((i) => i.main === "S") || [];
        const mainAccount = dataBank[0];

        const sellerName =
          mainAccount?.name_pagto || formData.seller?.name || "vendedor";

        //Alterar aqui embaixo, quando o cnpj_pagto estiver vindo do accounts
        const cpfCnpj = mainAccount?.cnpj_pagto
          ? insertMaskInCnpj(mainAccount.cnpj_pagto)
          : formData.seller?.cnpj_cpf
            ? insertMaskInCnpj(formData.seller.cnpj_cpf)
            : "00.000.000/0000-00";

        const bankName = mainAccount?.bank_name || "";
        const accountNumber = mainAccount?.account_number || "";
        const agency = mainAccount?.agency || "";

        if (dataBank.length === 0) {
          const paymentText = formatPaymentText(
            newDate,
            sellerName,
            cpfCnpj,
            bankName,
            accountNumber,
            agency,
          );

          updateFormData({
            payment_date: newDate,
            payment: paymentText,
          });
          return;
        }

        let paymentText = formatPaymentText(
          newDate,
          sellerName,
          cpfCnpj,
          bankName,
          accountNumber,
          agency,
        );

        if (formData.type_currency === "Dólar") {
          paymentText +=
            " A ser convertido em R$ (reais) pela taxa média de fechamento do Sisbacen do dia anterior ao pagamento.";
        }

        updateFormData({
          payment_date: newDate,
          payment: paymentText,
        });
      }
    },
    [updateFormData, formData.seller, formData.type_currency],
  );

  useEffect(() => {
    if (formData.type_pickup) {
      handleFieldPickupChange(formData.type_pickup, concatenatedPickupText);
    }
  }, [initialPickupDate, finalPickupDate, formData.type_pickup]);

  useEffect(() => {
    if (!updateFormData || formData.type_quantity !== "toneladas métricas") {
      return;
    }

    const shouldClearSeller = formData.type_commission_seller === "Por Saca";
    const shouldClearBuyer = formData.type_commission_buyer === "Por Saca";

    if (!shouldClearSeller && !shouldClearBuyer) {
      return;
    }

    updateFormData({
      ...formData,
      ...(shouldClearSeller
        ? {
            type_commission_seller: "",
            type_commission_seller_currency: "",
            commission_seller: "",
            commission_seller_exchange_rate: "",
            commission_seller_contract_value: undefined,
          }
        : {}),
      ...(shouldClearBuyer
        ? {
            type_commission_buyer: "",
            type_commission_buyer_currency: "",
            commission_buyer: "",
            commission_buyer_exchange_rate: "",
            commission_buyer_contract_value: undefined,
          }
        : {}),
    });
  }, [formData, updateFormData]);

  // Cálculo automático da comissão do vendedor em Reais
  useEffect(() => {
    if (
      (formData.type_commission_seller === "Fixo" ||
        formData.type_commission_seller === "Por Saca") &&
      formData.type_commission_seller_currency &&
      formData.commission_seller
    ) {
      const commissionValue = parseFloat(
        formData.commission_seller.replace(",", "."),
      );

      if (!isNaN(commissionValue)) {
        let calculatedValue: number;

        if (formData.type_commission_seller_currency === "Real") {
          // Em Real
          if (formData.type_commission_seller === "Fixo") {
            // Fixo em Real: o valor é o próprio commission_seller
            calculatedValue = commissionValue;
          } else {
            // Por Saca em Real: (quantidade / 60) * valor_comissao
            const quantity = parseFloat(
              formData.quantity.replace(/\./g, "").replace(",", "."),
            );
            if (!isNaN(quantity)) {
              calculatedValue = parseFloat(
                ((quantity / 60) * commissionValue).toFixed(2),
              );
            } else {
              return;
            }
          }
        } else if (formData.type_commission_seller_currency === "Dólar") {
          // Em Dólar: precisa da taxa de câmbio
          if (!formData.commission_seller_exchange_rate) {
            return;
          }

          const exchangeRate = parseFloat(
            formData.commission_seller_exchange_rate.replace(",", "."),
          );

          if (!isNaN(exchangeRate)) {
            if (formData.type_commission_seller === "Fixo") {
              // Em Dólar fixo: valor_fixo * taxa_cambio
              calculatedValue = parseFloat(
                (exchangeRate * commissionValue).toFixed(2),
              );
            } else {
              // Em Dólar por saca: (quantidade / 60) * valor_comissao * taxa_cambio
              const quantity = parseFloat(
                formData.quantity.replace(/\./g, "").replace(",", "."),
              );
              if (!isNaN(quantity)) {
                calculatedValue = parseFloat(
                  ((quantity / 60) * commissionValue * exchangeRate).toFixed(2),
                );
              } else {
                return;
              }
            }
          } else {
            return;
          }
        } else {
          return;
        }

        if (formData.commission_seller_contract_value !== calculatedValue) {
          updateFormData?.({
            ...formData,
            commission_seller_contract_value: calculatedValue,
          });
        }
      }
    }
  }, [
    formData.type_commission_seller,
    formData.type_commission_seller_currency,
    formData.commission_seller,
    formData.commission_seller_exchange_rate,
    formData.quantity,
  ]);

  // Cálculo automático da comissão do comprador em Reais
  useEffect(() => {
    if (
      (formData.type_commission_buyer === "Fixo" ||
        formData.type_commission_buyer === "Por Saca") &&
      formData.type_commission_buyer_currency &&
      formData.commission_buyer
    ) {
      const commissionValue = parseFloat(
        formData.commission_buyer.replace(",", "."),
      );

      if (!isNaN(commissionValue)) {
        let calculatedValue: number;

        if (formData.type_commission_buyer_currency === "Real") {
          // Em Real
          if (formData.type_commission_buyer === "Fixo") {
            // Fixo em Real: o valor é o próprio commission_buyer
            calculatedValue = commissionValue;
          } else {
            // Por Saca em Real: (quantidade / 60) * valor_comissao
            const quantity = parseFloat(
              formData.quantity.replace(/\./g, "").replace(",", "."),
            );
            if (!isNaN(quantity)) {
              calculatedValue = parseFloat(
                ((quantity / 60) * commissionValue).toFixed(2),
              );
            } else {
              return;
            }
          }
        } else if (formData.type_commission_buyer_currency === "Dólar") {
          // Em Dólar: precisa da taxa de câmbio
          if (!formData.commission_buyer_exchange_rate) {
            return;
          }

          const exchangeRate = parseFloat(
            formData.commission_buyer_exchange_rate.replace(",", "."),
          );

          if (!isNaN(exchangeRate)) {
            if (formData.type_commission_buyer === "Fixo") {
              // Em Dólar fixo: valor_fixo * taxa_cambio
              calculatedValue = parseFloat(
                (exchangeRate * commissionValue).toFixed(2),
              );
            } else {
              // Em Dólar por saca: (quantidade / 60) * valor_comissao * taxa_cambio
              const quantity = parseFloat(
                formData.quantity.replace(/\./g, "").replace(",", "."),
              );
              if (!isNaN(quantity)) {
                calculatedValue = parseFloat(
                  ((quantity / 60) * commissionValue * exchangeRate).toFixed(2),
                );
              } else {
                return;
              }
            }
          } else {
            return;
          }
        } else {
          return;
        }

        if (formData.commission_buyer_contract_value !== calculatedValue) {
          updateFormData?.({
            ...formData,
            commission_buyer_contract_value: calculatedValue,
          });
        }
      }
    }
  }, [
    formData.type_commission_buyer,
    formData.type_commission_buyer_currency,
    formData.commission_buyer,
    formData.commission_buyer_exchange_rate,
    formData.quantity,
  ]);

  const handleDateChange = useCallback(
    (newDate: string, name: string) => {
      const parseDate = (date: string) => dayjs(date, "DD/MM/YYYY", true);

      if (name === "initial_pickup_date") {
        const newInitialDate = parseDate(newDate);
        const currentFinalDate = parseDate(formData.final_pickup_date || "");
        const shouldAdjustFinalDate =
          newInitialDate.isValid() &&
          currentFinalDate.isValid() &&
          currentFinalDate.isBefore(newInitialDate);

        updateFormData?.({
          ...formData,
          initial_pickup_date: newDate,
          ...(shouldAdjustFinalDate ? { final_pickup_date: newDate } : {}),
        });
        SetInitialPickupDate(newDate);
      } else if (name === "final_pickup_date") {
        const initialDate = parseDate(formData.initial_pickup_date || "");
        const newFinalDate = parseDate(newDate);

        if (
          initialDate.isValid() &&
          newFinalDate.isValid() &&
          newFinalDate.isBefore(initialDate)
        ) {
          return;
        }

        updateFormData?.({
          ...formData,
          final_pickup_date: newDate,
        });
        SetFinalPickupDate(newDate);
      }
    },
    [updateFormData, formData],
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
        radioOptions={[
          { label: "Quilos", value: "quilos" },
          { label: "Toneladas métricas", value: "toneladas métricas" },
        ]}
        radioPosition="inline"
        onRadioChange={(e) => handleRadioChange(e, "type_quantity")}
        selectedRadio={formData.type_quantity}
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
        suggestCurrentDateWhenEmpty={false}
        disableWeekends
      />

      <CustomTextArea
        height="230px"
        label="Pagamento:"
        name="payment"
        onChange={handleChange}
        value={formData.payment}
      />
      <SCommissionWrapper>
        <SLabel>Comissão Vendedor:</SLabel>
        <SRadioGroup>
          <SRadioOption>
            <input
              type="radio"
              name="type_commission_seller"
              value="Percentual"
              checked={formData.type_commission_seller === "Percentual"}
              onClick={() => handleCommissionTypeToggle("seller", "Percentual")}
              onChange={(e) => handleRadioChange(e, "type_commission_seller")}
            />
            <span>Percentual</span>
          </SRadioOption>
          <SRadioOption>
            <input
              type="radio"
              name="type_commission_seller"
              value="Por Saca"
              checked={formData.type_commission_seller === "Por Saca"}
              onClick={() => handleCommissionTypeToggle("seller", "Por Saca")}
              onChange={(e) => handleRadioChange(e, "type_commission_seller")}
              disabled={isMetricTon}
            />
            <span>Por Saca</span>
          </SRadioOption>
          <SRadioOption>
            <input
              type="radio"
              name="type_commission_seller"
              value="Fixo"
              checked={formData.type_commission_seller === "Fixo"}
              onClick={() => handleCommissionTypeToggle("seller", "Fixo")}
              onChange={(e) => handleRadioChange(e, "type_commission_seller")}
            />
            <span>Fixo</span>
          </SRadioOption>
        </SRadioGroup>
        {(formData.type_commission_seller === "Por Saca" ||
          formData.type_commission_seller === "Fixo") && (
          <SRadioGroup>
            <SRadioOption>
              <input
                type="radio"
                name="type_commission_seller_currency"
                value="Real"
                checked={
                  (formData.type_commission_seller_currency || "Real") ===
                  "Real"
                }
                onChange={(e) =>
                  handleRadioChange(e, "type_commission_seller_currency")
                }
              />
              <span>BRL</span>
            </SRadioOption>
            <SRadioOption>
              <input
                type="radio"
                name="type_commission_seller_currency"
                value="Dólar"
                checked={formData.type_commission_seller_currency === "Dólar"}
                onChange={(e) =>
                  handleRadioChange(e, "type_commission_seller_currency")
                }
              />
              <span>USD</span>
            </SRadioOption>
          </SRadioGroup>
        )}
        <SCustomInput
          type="text"
          name="commission_seller"
          onChange={handleNumericInputChange}
          onFocus={() => handleCommissionFocus("seller")}
          onBlur={() => handleCommissionBlur("seller")}
          value={
            isEditingCommission.seller
              ? formData.commission_seller || ""
              : formData.commission_seller &&
                  (formData.type_commission_seller === "Fixo" ||
                    formData.type_commission_seller === "Por Saca")
                ? formatCurrency(
                    formData.commission_seller,
                    formData.type_commission_seller_currency || "Real",
                    modeSave,
                  )
                : formData.commission_seller &&
                    formData.type_commission_seller === "Percentual"
                  ? `${parseFloat(
                      String(formData.commission_seller).replace(",", "."),
                    ).toFixed(2)} %`
                  : formData.commission_seller || ""
          }
        />
      </SCommissionWrapper>

      {(formData.type_commission_seller === "Por Saca" ||
        formData.type_commission_seller === "Fixo") &&
        formData.type_commission_seller_currency === "Dólar" && (
          <CustomInput
            type="text"
            name="commission_seller_exchange_rate"
            label="Câmbio de Comissão:"
            $labelPosition="top"
            onChange={handleNumericInputChange}
            value={formData.commission_seller_exchange_rate || ""}
          />
        )}
      <SCommissionWrapper>
        <SLabel>Comissão Comprador:</SLabel>
        <SRadioGroup>
          <SRadioOption>
            <input
              type="radio"
              name="type_commission_buyer"
              value="Percentual"
              checked={formData.type_commission_buyer === "Percentual"}
              onClick={() => handleCommissionTypeToggle("buyer", "Percentual")}
              onChange={(e) => handleRadioChange(e, "type_commission_buyer")}
            />
            <span>Percentual</span>
          </SRadioOption>
          <SRadioOption>
            <input
              type="radio"
              name="type_commission_buyer"
              value="Por Saca"
              checked={formData.type_commission_buyer === "Por Saca"}
              onClick={() => handleCommissionTypeToggle("buyer", "Por Saca")}
              onChange={(e) => handleRadioChange(e, "type_commission_buyer")}
              disabled={isMetricTon}
            />
            <span>Por Saca</span>
          </SRadioOption>
          <SRadioOption>
            <input
              type="radio"
              name="type_commission_buyer"
              value="Fixo"
              checked={formData.type_commission_buyer === "Fixo"}
              onClick={() => handleCommissionTypeToggle("buyer", "Fixo")}
              onChange={(e) => handleRadioChange(e, "type_commission_buyer")}
            />
            <span>Fixo</span>
          </SRadioOption>
        </SRadioGroup>
        {(formData.type_commission_buyer === "Por Saca" ||
          formData.type_commission_buyer === "Fixo") && (
          <SRadioGroup>
            <SRadioOption>
              <input
                type="radio"
                name="type_commission_buyer_currency"
                value="Real"
                checked={
                  (formData.type_commission_buyer_currency || "Real") === "Real"
                }
                onChange={(e) =>
                  handleRadioChange(e, "type_commission_buyer_currency")
                }
              />
              <span>BRL</span>
            </SRadioOption>
            <SRadioOption>
              <input
                type="radio"
                name="type_commission_buyer_currency"
                value="Dólar"
                checked={formData.type_commission_buyer_currency === "Dólar"}
                onChange={(e) =>
                  handleRadioChange(e, "type_commission_buyer_currency")
                }
              />
              <span>USD</span>
            </SRadioOption>
          </SRadioGroup>
        )}
        <SCustomInput
          type="text"
          name="commission_buyer"
          onChange={handleNumericInputChange}
          onFocus={() => handleCommissionFocus("buyer")}
          onBlur={() => handleCommissionBlur("buyer")}
          value={
            isEditingCommission.buyer
              ? formData.commission_buyer || ""
              : formData.commission_buyer &&
                  (formData.type_commission_buyer === "Fixo" ||
                    formData.type_commission_buyer === "Por Saca")
                ? formatCurrency(
                    formData.commission_buyer,
                    formData.type_commission_buyer_currency || "Real",
                    modeSave,
                  )
                : formData.commission_buyer &&
                    formData.type_commission_buyer === "Percentual"
                  ? `${parseFloat(
                      String(formData.commission_buyer).replace(",", "."),
                    ).toFixed(2)} %`
                  : formData.commission_buyer || ""
          }
        />
      </SCommissionWrapper>

      {(formData.type_commission_buyer === "Por Saca" ||
        formData.type_commission_buyer === "Fixo") &&
        formData.type_commission_buyer_currency === "Dólar" && (
          <CustomInput
            type="text"
            name="commission_buyer_exchange_rate"
            label="Câmbio de Comissão:"
            $labelPosition="top"
            onChange={handleNumericInputChange}
            value={formData.commission_buyer_exchange_rate || ""}
          />
        )}

      <CustomInput
        name="type_pickup"
        radioPosition="only"
        radioOptions={[
          { label: "CIF", value: "Entrega" },
          { label: "FOB", value: "Retirada" },
          //{ label: "CIF Porto/Ferrovia", value: "Entrega " },
        ]}
        onRadioChange={(e) => handleRadioChange(e, "type_pickup")}
        selectedRadio={formData.type_pickup}
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

      <SContentBox>
        <CustomDatePicker
          width="150px"
          height="38x"
          name="initial_pickup_date"
          label="De:"
          $labelPosition="top"
          onChange={(date) => handleDateChange(date, "initial_pickup_date")}
          value={formData.initial_pickup_date}
          suggestCurrentDateWhenEmpty={false}
        />
        <CustomDatePicker
          width="150px"
          height="38x"
          name="final_pickup_date"
          label="Até:"
          $labelPosition="top"
          onChange={(date) => handleDateChange(date, "final_pickup_date")}
          value={formData.final_pickup_date}
          suggestCurrentDateWhenEmpty={false}
          minDate={formData.initial_pickup_date}
        />
      </SContentBox>

      <CustomTextArea
        width="308px"
        height="70px"
        name="pickup"
        onChange={handleChange}
        value={formData.pickup}
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
