export type FieldType = "Entrega" | "Embarque" | "Retirada";

interface FieldName {
  pickup: string;
  pickupLocation: string;
  inspection: string;
}

export const fieldInfo: Record<FieldType, FieldName> = {
  Entrega: {
    pickup: `De ...., limpo e seco sobre rodas.`,
    pickupLocation: `Nos armazéns ..... em Cidade/UF.`,
    inspection: `De peso e qualidade na entrega.`,
  },
  Embarque: {
    pickup: `De ...., limpo e seco sobre rodas.`,
    pickupLocation: `Nos armazéns ..... em Cidade/UF.`,
    inspection: `De peso e qualidade no embarque.`,
  },
  Retirada: {
    pickup: `De ...., limpo e seco sobre rodas.`,
    pickupLocation: `Nos armazéns ..... em Cidade/UF.`,
    inspection: `De peso e qualidade na retirada.`,
  },
};
