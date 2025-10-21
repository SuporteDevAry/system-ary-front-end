import { useState } from "react";
import { FormDataContract } from "../../types";
import { formatQuantityWithDecimal } from "../../../../../../helpers/quantityFormat";

export const usePriceHandlers = (
  formData: FormDataContract,
  updateFormData?: (data: Partial<FormDataContract>) => void
) => {
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);

  const handlePriceFocus = () => {
    setIsEditingPrice(true);
  };

  const handlePriceBlur = () => {
    setIsEditingPrice(false);
    const rawPrice = formData.price;
    updateFormData?.({ ...formData, price: rawPrice.toString() });
  };

  return { isEditingPrice, handlePriceFocus, handlePriceBlur };
};

export const useExchangeRateHandlers = () => {
  const [isEditingExchangeRate, setIsEditingExchangeRate] =
    useState<boolean>(false);

  const handleExchangeRateFocus = () => {
    setIsEditingExchangeRate(true);
  };

  const handleExchangeRateBlur = () => {
    setIsEditingExchangeRate(false);
  };

  return {
    isEditingExchangeRate,
    handleExchangeRateFocus,
    handleExchangeRateBlur,
  };
};

export const useCommissionHandlers = () => {
  const [isEditingCommission, setIsEditingCommission] = useState({
    seller: false,
    buyer: false,
  });

  const handleCommissionFocus = (type: "seller" | "buyer") => {
    setIsEditingCommission((prev) => ({
      ...prev,
      [type]: true,
    }));
  };

  const handleCommissionBlur = (type: "seller" | "buyer") => {
    setIsEditingCommission((prev) => ({
      ...prev,
      [type]: false,
    }));
  };

  return {
    isEditingCommission,
    handleCommissionFocus,
    handleCommissionBlur,
  };
};

export const formatQuantity = (value: string): string => {
  return formatQuantityWithDecimal(value);
};

export const useQuantityHandlers = (
  formData: FormDataContract,
  updateFormData?: (data: Partial<FormDataContract>) => void
) => {
  const [isEditingQuantity, setIsEditingQuantity] = useState<boolean>(false);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (/^[\d.,]*$/.test(rawValue)) {
      updateFormData?.({ ...formData, quantity: rawValue });
    }
  };

  const handleQuantityFocus = () => {
    setIsEditingQuantity(true);
  };

  const handleQuantityBlur = () => {
    setIsEditingQuantity(false);
    const formattedValue = formatQuantityWithDecimal(formData.quantity);
    updateFormData?.({ ...formData, quantity: formattedValue });
  };

  return {
    isEditingQuantity,
    handleQuantityChange,
    handleQuantityFocus,
    handleQuantityBlur,
    formatQuantity,
  };
};
