//import { toast } from "react-toastify";
import { Modal } from "../../../../../../components/Modal";
import { CustomInput } from "../../../../../../components/CustomInput";
import { SContainer } from "./styles";
import CustomDatePicker from "../../../../../../components/CustomDatePicker";
import dayjs from "dayjs";
import { IModalCreateNewBillingProps } from "./types";

export function ModalCreateNewBilling({
    open,
    dataBillings,
    onClose,
    onConfirm,
    onHandleChange,
}: IModalCreateNewBillingProps) {
    const currentDate = dayjs().format("DD/MM/YYYY");

    const handleClose = () => {
        onClose();
    };

    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Modal
            titleText={"Novo Recebimento"}
            open={open}
            confirmButton="Confirmar"
            cancelButton="Fechar"
            onClose={handleClose}
            onHandleConfirm={handleConfirm}
            variantCancel={"primary"}
            variantConfirm={"success"}
            // maxWidth="md"
            // fullWidth
        >
            <SContainer>
                <CustomDatePicker
                    type="text"
                    name="dataCobranca"
                    label="Data:"
                    $labelPosition="top"
                    onChange={(newValue) =>
                        onHandleChange({
                            target: {
                                name: "receipt_date",
                                value: newValue,
                            },
                        })
                    }
                    value={dataBillings?.receipt_date ?? currentDate}
                    disableWeekends
                />

                <CustomInput
                    type="text"
                    name="rps"
                    label="RPS:"
                    $labelPosition="top"
                    onChange={(newValue) =>
                        onHandleChange({
                            target: {
                                name: "rps_number",
                                value: newValue,
                            },
                        })
                    }
                    value={dataBillings?.rps_number}
                />
                <CustomInput
                    type="text"
                    name="nfs_number"
                    label="Nota Fiscal:"
                    $labelPosition="top"
                    onChange={onHandleChange}
                    value={dataBillings?.nfs_number}
                />
                <CustomInput
                    type="text"
                    name="internal_receipt_number"
                    label="Recibo:"
                    $labelPosition="top"
                    onChange={onHandleChange}
                    value={dataBillings?.internal_receipt_number}
                />
                <CustomInput
                    type="text"
                    name="total_service_value"
                    label="Valor Bruto:"
                    $labelPosition="top"
                    onChange={onHandleChange}
                    value={dataBillings?.total_service_value}
                />
                <CustomInput
                    type="text"
                    name="irrf_value"
                    label="Valor IRRF:"
                    $labelPosition="top"
                    onChange={onHandleChange}
                    value={dataBillings?.irrf_value}
                />
                <CustomInput
                    type="text"
                    name="liquid_value"
                    label="Valor Liquido:"
                    $labelPosition="top"
                    onChange={onHandleChange}
                    value={dataBillings?.liquid_value}
                />
            </SContainer>
        </Modal>
    );
}
