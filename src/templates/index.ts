import { FC } from "react";
import Contrato from "./contrato";
import ContratoTemplateSoja from "./contratoTemplateSoja";

export interface ITemplates {
  template: "contrato" | "contratoTemplateSoja";
}

export const templates: Record<"contrato" | "contratoTemplateSoja", FC<any>> = {
  contrato: Contrato,
  contratoTemplateSoja: ContratoTemplateSoja,
};
