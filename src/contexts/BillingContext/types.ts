export interface IBillingProvider {
    children: JSX.Element;
}

export interface IBillingData {
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
export interface IBillingContext {
    listBillings: () => Promise<any>;
    createBilling: (BillingData: IBillingData) => Promise<any>;
    updateBilling: (
        billingId: string,
        updateBillingData: IBillingData
    ) => Promise<any>;
    deleteBilling: (billingId: string) => void;
    getBillingById: (billingId: string) => Promise<any>;
    getBillingByRps: (billingRps: string) => Promise<any>;
    getBillingByNfs: (billingNfs: string) => Promise<any>;
    getBillingByNumberContract: (billingNumberContract: string) => Promise<any>;
}
