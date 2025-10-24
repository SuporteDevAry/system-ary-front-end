export const formatQuantityWithDecimal = (value: string): string => {
  if (!value) return "";

  let cleanValue = value.replace(/[^\d,]/g, "");

  const parts = cleanValue.split(",");
  if (parts.length > 2) {
    cleanValue = parts[0] + "," + parts.slice(1).join("");
  }

  if (parts.length === 2) {
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const decimalPart = parts[1].slice(0, 3);
    return `${integerPart},${decimalPart}`;
  }

  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseQuantityToNumber = (value: string): number => {
  if (!value) return 0;

  const cleanValue = value.replace(/\./g, "").replace(",", ".");

  return parseFloat(cleanValue) || 0;
};

export const numberToQuantityString = (value: number | string): string => {
  if (!value && value !== 0) return "";

  let numValue: number;

  if (typeof value === "string") {
    if (value.includes(",")) {
      numValue = parseQuantityToNumber(value);
    } else {
      numValue = parseFloat(value);
    }
  } else {
    numValue = value;
  }

  if (isNaN(numValue)) return "";

  const integerPart = Math.floor(numValue);
  const decimalPart = numValue - integerPart;

  if (decimalPart === 0) {
    return integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const formattedDecimal = decimalPart.toFixed(3).substring(2);
  const stringValue = `${integerPart},${formattedDecimal}`;

  return formatQuantityWithDecimal(stringValue);
};
