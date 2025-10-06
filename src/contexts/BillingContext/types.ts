export interface IBillingsProvider {
    children: JSX.Element;
}

export interface IBillings {
    id: string;
    number_contract: string;
    product_name: string;
    number_broker: string;
    year: string;
    receipt_date: string;
    internal_receipt_number: string;
    rps_number: string;
    nfs_number: string;
    total_service_value: string;
    irrf_value: string;
    adjustment_value: string;
    liquid_value: string;
    liquid_contract: string;
    expected_receipt_date: string;
    liquid_contract_date: string;
    owner_record: string;
}

export interface ICreateBillingsData
    extends Omit<IBillings, "id" | "created_at" | "updated_at"> { }

export interface IUpdateBillingsData
    extends Omit<IBillings, "id" | "created_at" | "updated_at"> { }

export interface IListBillings extends IBillings {
    [key: string]: any;
}
