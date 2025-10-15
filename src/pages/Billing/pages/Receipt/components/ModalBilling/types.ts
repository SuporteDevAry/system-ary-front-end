
import { IContractData } from "../../../../../../contexts/ContractContext/types";

export interface IModalBillingProps {
    open: boolean;
    billingToEdit: any;
    onClose: () => void;
    onConfirm: () => void;
    contractRead: IContractData | null;
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}
