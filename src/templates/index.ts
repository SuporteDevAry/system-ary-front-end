import { FC } from "react";
import Contrato from "./contrato";
import ContratoPriceFixation from "./contratoPriceFixation";

// adicionar mais templates aqui
/*
 * | "contratoTemplateSoja"
 */
export interface ITemplates {
  template: "contrato" | "contratoPriceFixation";
}

export const templates: Record<"contrato" | "contratoPriceFixation", FC<any>> = {
  contrato: Contrato,
  contratoPriceFixation: ContratoPriceFixation,
};
