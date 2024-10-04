export const formatCurrency = (
  value: string,
  currency: "Real" | "Dólar" | string,
  modeSave?: boolean
  //quotation?: boolean
): string => {
  // Remove todos os caracteres que não sejam números, ponto ou hífen.

  let numberValue = parseFloat(value);
  if (modeSave) {
    numberValue = parseFloat(value.replace(/[^\d,-]/g, "").replace(",", "."));
  }

  const locale = currency === "Real" ? "pt-BR" : "en-US";

  // Verifica se o valor é válido.
  if (isNaN(numberValue)) {
    return "";
  }

  const typeCurrency = currency === "Dólar" ? "USD" : "BRL";

  // if (quotation) {
  //   return `R$ ${numberValue.toFixed(4).replace(".", ",")}`;
  // }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: typeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
};
