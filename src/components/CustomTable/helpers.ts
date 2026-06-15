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

export const parseSortableNumber = (
  value: string | number | null | undefined
): number => {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return 0;

  const normalizedValue = String(value).replace(/\D/g, "");
  return Number(normalizedValue || 0);
};

export const parseBrazilianDate = (
  dateStr: string | null | undefined
): number => {
  if (!dateStr) return 0;

  const [day, month, year] = dateStr.split("/");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.getTime() || 0;
};

export const sortTableData = <T extends Record<string, any>>(
  data: T[],
  orderBy: string,
  order: "asc" | "desc",
) => {
  return data.slice().sort((a, b) => {
    const aValue = getNestedValue(a, orderBy);
    const bValue = getNestedValue(b, orderBy);

    if (orderBy === "contract_emission_date") {
      const aDate = parseBrazilianDate(aValue);
      const bDate = parseBrazilianDate(bValue);

      return order === "asc" ? aDate - bDate : bDate - aDate;
    }

    if (orderBy === "number_contract") {
      const aContractNumber = extractNumberFromContract(aValue);
      const bContractNumber = extractNumberFromContract(bValue);
      return compareValues(aContractNumber, bContractNumber, order);
    }

    if (orderBy === "rps_number" || orderBy === "nfs_number") {
      const aNum = parseSortableNumber(aValue);
      const bNum = parseSortableNumber(bValue);

      return order === "asc" ? aNum - bNum : bNum - aNum;
    }

    return compareValues(aValue, bValue, order);
  });
};
