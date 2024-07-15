export type ProductType = "S" | "CN" | "T" | "SG";

interface ProductInfo {
  name: string;
  quality: string;
  observation: string;
  inspection: string;
}

// ATENÇÃO !!! = Não Mudar a Identação dos Objetos abaixo!
export const productInfo: Record<ProductType, ProductInfo> = {
  S: {
    name: `SOJA em Grão`,
    quality: `Padrão exportação conforme ANEC 41.
Soja transgênica (GMO positivo).`,
    observation: `1-Mercadoria destinada à exportação.
2-O comprador se compromete a apresentar os documentos de exportação no prazo determinado por
lei, tais como:

DUE com referência das Notas Fiscais de Remessa.
NF de Exportação.
Bill of Lading (BL).
3-CBOT referência = CU... ......... / .......... spot.`,
    inspection: `De peso e qualidade no destino.`,
  },
  CN: {
    name: `MILHO`,
    quality: `Padrão exportação conforme contrato ANEC nr. 43.`,
    observation: `1-Mercadoria destinada à exportação.
2-O comprador se compromete a apresentar os documentos de exportação no prazo determinado por
lei, tais como:

DUE com referência das Notas Fiscais de Remessa.
NF de Exportação.
Bill of Lading (BL).
3-CBOT referência = CU... ......... / .......... spot.`,
    inspection: `De peso e qualidade na retirada.`,
  },
  T: {
    name: `TRIGO`,
    quality: `Trigo Pão Tipo 1, à granel, umidade máxima 13,0%, impurezas máxima1,0%, 
PH mínimo 78, triguilho máximo 1,5%, falling number mínimo 250, W mínimo 250, 
DON máximo 2ppm, proteína mínima 12,5%, isento de mofados, germinados e livre de insetos vivos e/ou mortos.`,
    observation: `1- Venda para comercialização sem RE.`,
    inspection: `De peso e qualidade no destino.`,
  },
  SG: {
    name: `SORGO`,
    quality: `Peso de Teste: 56,0 LB/Bushel
BCFM: Máx. 7%
Número Danificado: Máx. Máx. 5%
Dano de Calor: Máx. 0,5%
Umidade: Máx. 14,5%
Tanino: Máx. 0,5%
Aflatoxina: Máx. 20PPB`,
    observation: `1- Mercadoria destinada à exportação.
2- O comprador se compromete a apresentar os documentos de exportação no prazo determinado por lei.`,
    inspection: `De peso e qualidade no destino.`,
  },
};
