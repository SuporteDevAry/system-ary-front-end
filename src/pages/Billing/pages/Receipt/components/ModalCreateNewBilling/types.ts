import { IBillings } from "../../../../../../contexts/BillingContext/types";

export interface IModalCreateNewBillingProps {
    open: boolean;
    formData: IBillings | null;
    onClose: () => void;
    onConfirm: () => void;
    onHandleChange: (
        e:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | { target: { name: string; value: any } }
    ) => void;
}
