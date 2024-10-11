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
