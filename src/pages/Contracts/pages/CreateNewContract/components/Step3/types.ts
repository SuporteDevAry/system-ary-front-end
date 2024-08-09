export type FieldType = "Entrega" | "Embarque" | "Retirada";

interface FieldName {
  pickup: string;
  pickupLocation: string;
}

export const fieldInfo: Record<FieldType, FieldName> = {
  Entrega: {
    pickup: `De ...., Limpo e seco sobre rodas.`,
    pickupLocation: `Nos armazéns ..... em Cidade/UF.`,
  },
  Embarque: {
    pickup: `De ...., Limpo e seco sobre rodas.`,
    pickupLocation: `Nos armazéns ..... em Cidade/UF.`,
  },
  Retirada: {
    pickup: `De ...., Limpo e seco sobre rodas.`,
    pickupLocation: `Nos armazéns ..... em Cidade/UF.`,
  },
};
