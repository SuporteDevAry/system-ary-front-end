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
    cod_pais: string;
    zip_code: string;
    email: string;
    owner_record?: string;
    owner_send?: string;
    url_danfse?: string;
    xml_nfse?: string;
    service_discrim: string;
    service_value: number;
    name_adjust1: string;
    value_adjust1: number;
    name_adjust2: string;
    value_adjust2: number;
    deduction_value: number;
    irrf_value: number;
    valor_ir?: number;
    service_liquid_value: number;
    pis_value?: number;
    cofins_value?: number;
    csll_value?: number;
    iss_value?: number;
    exportacao: string;
}

export interface ICreateInvoicesData
    extends Omit<IInvoices, "id" | "created_at" | "updated_at"> { }

export interface IUpdateInvoicesData
    extends Omit<IInvoices, "id" | "created_at" | "updated_at"> {
    [key: string]: any;
}

export interface IListInvoices extends IInvoices {
    [key: string]: any;
}

