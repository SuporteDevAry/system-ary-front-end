import { EuropeanDecimalValue } from "../../../../../../helpers/europeanDecimal";

export type FormDataInvoice = [{
    rps_number: string;
    rps_emission_date: string;
    service_code: string;
    aliquot: number;
    cpf_cnpj: string;
    name: string;
    address: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zip_code: string;
    email: string;
    service_discrim: string;
    service_value: EuropeanDecimalValue;
    name_adjust1: string
    value_adjust1: EuropeanDecimalValue;
    name_adjust2: string
    value_adjust2: number;
    irrf_value: EuropeanDecimalValue;
    service_liquid_value: EuropeanDecimalValue;
    deduction_value: number;
}];

export interface InvoiceProps {
    id: string;
    formData: FormDataInvoice;
    onHandleCreate: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCheckCNPJ: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

