import { FC } from "react";
import Contrato from "./contrato";

// adicionar mais templates aqui
/*
 * | "contratoTemplateSoja"
 */
export interface ITemplates {
  template: "contrato";
}

export const templates: Record<"contrato", FC<any>> = {
  contrato: Contrato,
};
