export type EuropeanDecimalValue = string | number | null | undefined;

export const parseEuropeanDecimal = (
  value: EuropeanDecimalValue,
): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed.replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeEuropeanDecimalInput = (value: string): string => {
  const digitsOnly = value.replace(/[^\d,.]/g, "");

  if (!digitsOnly) {
    return "";
  }

  const lastComma = digitsOnly.lastIndexOf(",");
  const lastDot = digitsOnly.lastIndexOf(".");
  const separatorIndex = Math.max(lastComma, lastDot);

  if (separatorIndex === -1) {
    return digitsOnly.replace(/[^\d]/g, "");
  }

  const integerPart = digitsOnly
    .slice(0, separatorIndex)
    .replace(/[^\d]/g, "");
  const decimalPart = digitsOnly
    .slice(separatorIndex + 1)
    .replace(/[^\d]/g, "")
    .slice(0, 2);

  return `${integerPart || "0"},${decimalPart}`;
};

export const formatEuropeanDecimal = (
  value: EuropeanDecimalValue,
  useGrouping = false,
): string => {
  const parsed = parseEuropeanDecimal(value);

  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping,
  }).format(parsed);
};
