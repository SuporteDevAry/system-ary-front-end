export const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((value, key) => value?.[key], obj);
};

export const extractNumberFromContract = (contractNumber: string) => {
  const match = contractNumber.match(/-([0-9]{3}\/[0-9]{2})/);
  return match ? match[1] : "";
};

export const compareValues = (
  aValue: string,
  bValue: string,
  order: string
) => {
  if (aValue < bValue) {
    return order === "asc" ? -1 : 1;
  }
  if (aValue > bValue) {
    return order === "asc" ? 1 : -1;
  }
  return 0;
};

export const parseBrazilianDate = (
  dateStr: string | null | undefined
): number => {
  if (!dateStr) return 0;

  const [day, month, year] = dateStr.split("/");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.getTime() || 0;
};
