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
    service_value: number;
    name_adjust1: string
    value_adjust1: number;
    name_adjust2: string
    value_adjust2: number;
    irrf_value: number;
    service_liquid_value: number;
    deduction_value: number;
}];

export interface InvoiceProps {
    id: string;
    formData: FormDataInvoice;
    onHandleCreate: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCheckCNPJ: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

