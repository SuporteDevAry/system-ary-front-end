export interface IInvoicesProvider {
    children: JSX.Element;
}

export interface IInvoices {
    id: string;
    rps_number: string;
    rps_emission_date: string;
    nfs_number?: string;
    nfs_emission_date?: string;
    service_code: string;
    aliquot: number;
    cpf_cnpj: string;
    name: string;
    address: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zip_code: string;
    email: string;
    service_discrim: string;
    service_value: number;
    name_adjust1: string;
    value_adjust1: number;
    name_adjust2: string;
    value_adjust2: number;
    deduction_value: number;
    irrf_value: number;
    service_liquid_value: number;
}

export interface ICreateInvoicesData
    extends Omit<IInvoices, "id" | "created_at" | "updated_at"> { }

export interface IUpdateInvoicesData
    extends Omit<IInvoices, "id" | "created_at" | "updated_at"> { }

export interface IListInvoices extends IInvoices {
    [key: string]: any;
}

