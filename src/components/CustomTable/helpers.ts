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
    const getRowPriority = (row: T) => {
      if ((row as any)?.is_grand_total) return 2;
      if ((row as any)?.is_sigla_total) return 1;
      return 0;
    };

    const aPriority = getRowPriority(a);
    const bPriority = getRowPriority(b);

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    if (aPriority > 0 && bPriority > 0) {
      const aLabel = String((a as any)?.product ?? "");
      const bLabel = String((b as any)?.product ?? "");
      return compareValues(aLabel, bLabel, "asc");
    }

    const aValue = getNestedValue(a, orderBy);
    const bValue = getNestedValue(b, orderBy);

    if (
      orderBy === "contract_emission_date" ||
      orderBy === "receipt_date" ||
      orderBy === "payment_date" ||
      orderBy === "charge_date" ||
      orderBy === "expected_receipt_date"
    ) {
      const aDate = parseBrazilianDate(aValue);
      const bDate = parseBrazilianDate(bValue);

      if (aDate !== bDate) {
        return order === "asc" ? aDate - bDate : bDate - aDate;
      }

      const aSigla = String(getNestedValue(a, "product") ?? "");
      const bSigla = String(getNestedValue(b, "product") ?? "");

      return compareValues(aSigla, bSigla, "asc");
    }

    if (orderBy === "number_contract") {
      const aContractNumber = extractNumberFromContract(aValue);
      const bContractNumber = extractNumberFromContract(bValue);
      const contractComparison = compareValues(
        aContractNumber,
        bContractNumber,
        order,
      );

      if (contractComparison !== 0) {
        return contractComparison;
      }

      const aReceiptDate = parseBrazilianDate(getNestedValue(a, "receipt_date"));
      const bReceiptDate = parseBrazilianDate(getNestedValue(b, "receipt_date"));

      return order === "asc"
        ? aReceiptDate - bReceiptDate
        : bReceiptDate - aReceiptDate;
    }

    if (orderBy === "rps_number" || orderBy === "nfs_number") {
      const aNum = parseSortableNumber(aValue);
      const bNum = parseSortableNumber(bValue);

      return order === "asc" ? aNum - bNum : bNum - aNum;
    }

    return compareValues(aValue, bValue, order);
  });
};
