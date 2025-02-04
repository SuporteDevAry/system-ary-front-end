export type ProductType = "S" | "CN" | "T" | "SG" | "O" | "F";

interface ProductInfo {
  name: string;
  commission_seller: string,
  quality: string;
  observation: string;
  type_commission_seller: string;
}

// ATENÇÃO !!! = Não Mudar a Identação dos Objetos abaixo!
export const productInfo: Record<ProductType, ProductInfo> = {
  S: {
    name: `SOJA em Grãos`,
    commission_seller: `0,25`,
    type_commission_seller: "Percentual",
    quality: `Padrão exportação conforme ANEC 41.
Soja transgênica (GMO positivo).`,
    observation: `1-Mercadoria destinada à exportação.
2-O comprador se compromete a apresentar os documentos de exportação no prazo determinado por lei, tais como:
DUE com referência das Notas Fiscais de Remessa.
NF de Exportação.
Bill of Lading (BL).
3-CBOT referência = CU... ......... / .......... spot.`,
  },
  CN: {
    name: `MILHO em Grãos`,
    commission_seller: `0,50`,
    type_commission_seller: "Percentual",
    quality: `Padrão exportação conforme contrato ANEC nr. 43.`,
    observation: `1-Mercadoria destinada à exportação.
2-O comprador se compromete a apresentar os documentos de exportação no prazo determinado por lei, tais como:
DUE com referência das Notas Fiscais de Remessa.
NF de Exportação.
Bill of Lading (BL).
3-CBOT referência = CU... ......... / .......... spot.`,
  },
  T: {
    name: `TRIGO`,
    commission_seller: `0,50`,
    type_commission_seller: "Percentual",
    quality: `Trigo Pão Tipo 1, à granel, umidade máxima 13,0%, impurezas máxima1,0%, 
PH mínimo 78, triguilho máximo 1,5%, falling number mínimo 250, W mínimo 250, 
DON máximo 2ppm, proteína mínima 12,5%, isento de mofados, germinados e livre de insetos vivos e/ou mortos.`,
    observation: `1- Venda para comercialização sem RE.`,
  },
  SG: {
    name: `SORGO`,
    commission_seller: `0,50`,
    type_commission_seller: "Percentual",
    quality: `Peso de Teste: 56,0 LB/Bushel
BCFM: Máx. 7%
Número Danificado: Máx. Máx. 5%
Dano de Calor: Máx. 0,5%
Umidade: Máx. 14,5%
Tanino: Máx. 0,5%
Aflatoxina: Máx. 20PPB`,
    observation: `1- Mercadoria destinada à exportação.
2- O comprador se compromete a apresentar os documentos de exportação no prazo determinado por lei.`,
  },
  O: {
    name: `ÓLEO DE SOJA a Granel`,
    commission_seller: `0,50`,
    type_commission_seller: "Percentual",
    quality: `Padrão exportação, conforme contrato ANEC nr. 81.`,
    observation: `"Mercadoria destinada a fabricação de biodiesel."`,
  },
  F: {
    name: `FARELO DE SOJA a Granel`,
    commission_seller: `0,50`,
    type_commission_seller: "Percentual",
    quality: `Farelo de soja, base 46% proteína min 45%, demais termos e condições desse contrato de acordo com a clausula 3 do contrato ANEC nr. 71. GMP+.`,
    observation: `1-O comprador e responsável pela obtenção das cotas para remessa da mercadoria para o porto.
2-Despesas portuárias por conta do comprador.
3-O comprador e responsável pela apresentação de cópias do(s) DUE (s) averbadas 
   e deverá fazer constar no campo especifico do(s) DUE(s) o NOME e CNPJ do vendedor como 
   sendo o fabricante/vendedor. 
   O comprador também deverá apresentar o(s) respectivo(s) memorando(s) de exportação até 
   30 dias após o(s) embarque(s).
4-Vendedor e Comprador concordam em que a Control Union é excluída como entidade 
   supervisora.
5-Demais cláusulas não citadas neste contrato serão conforme ANEC 71.`,
  },
};
