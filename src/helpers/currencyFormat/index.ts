export const formatCurrency = (
  value: string,
  currency: "Real" | "Dólar" | string
): string => {
  // Remove todos os caracteres que não sejam números, ponto ou hífen.
  const numberValue = parseFloat(
    value.replace(/[^\d,-]/g, "").replace(",", ".")
  );

  const locale = currency === "Real" ? "pt-BR" : "en-US";

  // Verifica se o valor é válido.
  if (isNaN(numberValue)) {
    return "";
  }

  const typeCurrency = currency === "Dólar" ? "USD" : "BRL";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: typeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
};
