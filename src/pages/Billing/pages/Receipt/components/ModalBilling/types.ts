//import { IBillingData } from "../../../../../../contexts/BillingContext/types";

export interface IModalBillingProps {
    open: boolean;
    billingToEdit: any;
    onClose: () => void;
    contractRead: any;
}
