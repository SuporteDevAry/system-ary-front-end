export const getCommissionFormat = (typeCommission: string) =>
  ({
    Percentual: "%",
    Valor: "R$",
  }[typeCommission] || "");
