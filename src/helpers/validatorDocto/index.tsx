import validateCPF from "./validations/cpf";
import validateCNPJ from "./validations/cnpj";
import CPFformat from "./validations/cpf_format";
import CNPJformat from "./validations/cnpj_format";

export default class ValidatorDocto {
    public static isCPF(cpf: unknown): boolean {
        return validateCPF(cpf);
    }

    public static isFormattedCPF(cpf: unknown): boolean {
        return CPFformat(cpf);
    }

    public static isCNPJ(cnpj: unknown): boolean {
        return validateCNPJ(cnpj);
    }

    public static isFormattedCNPJ(cnpj: unknown): boolean {
        return CNPJformat(cnpj);
    }
}
