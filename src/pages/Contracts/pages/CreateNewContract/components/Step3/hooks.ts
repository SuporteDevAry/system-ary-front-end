import { useState } from "react";
import { FormDataContract } from "../../types";

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
  const numericValue = value.replace(/\D/g, ""); // Remove qualquer caractere não numérico
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Adiciona o separador de milhares
};

export const useQuantityHandlers = (
  formData: FormDataContract,
  updateFormData?: (data: Partial<FormDataContract>) => void
) => {
  const [isEditingQuantity, setIsEditingQuantity] = useState<boolean>(false);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatQuantity(rawValue);

    updateFormData?.({ ...formData, quantity: formattedValue });
  };

  const handleQuantityFocus = () => {
    setIsEditingQuantity(true);
  };

  const handleQuantityBlur = () => {
    setIsEditingQuantity(false);
  };

  return {
    isEditingQuantity,
    handleQuantityChange,
    handleQuantityFocus,
    handleQuantityBlur,
    formatQuantity,
  };
};
