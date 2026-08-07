export type FieldType = "Entrega" | "Embarque" | "Retirada";

interface FieldName {
  pickup: (concatenatedPickupText: string) => string;
  pickupLocation: string;
  inspection: string;
}

export const fieldInfo: Record<FieldType, FieldName> = {
  Entrega: {
    pickup: (concatenatedPickupText) =>
      `${concatenatedPickupText}, limpo e seco sobre rodas.`,
    pickupLocation: `Nos armazéns ..... em Cidade/UF.`,
    inspection: `De peso e qualidade no destino.`,
  },
  Embarque: {
    pickup: (concatenatedPickupText) =>
      `${concatenatedPickupText}, limpo e seco sobre rodas.`,
    pickupLocation: `Nos armazéns ..... em Cidade/UF.`,
    inspection: `De peso e qualidade na retirada.`,
  },
  Retirada: {
    pickup: (concatenatedPickupText) =>
      `${concatenatedPickupText}, limpo e seco sobre rodas.`,
    pickupLocation: `Nos armazéns ..... em Cidade/UF.`,
    inspection: `De peso e qualidade na retirada.`,
  },
};
