//import { toast } from "react-toastify";
import { Modal } from "../../../../../../components/Modal";
import { CustomInput } from "../../../../../../components/CustomInput";
import { SContainer } from "./styles";
import CustomDatePicker from "../../../../../../components/CustomDatePicker";
import dayjs from "dayjs";
import { IModalCreateNewBillingProps } from "./types";

export function ModalCreateNewBilling({
    open,
    formData,
    onClose,
    onConfirm,
    onHandleChange,
}: IModalCreateNewBillingProps) {
    // const [formData, setFormData] = useState({
    //     number_contract: "",
    //     product_name: "",
    //     number_broker: "",
    //     year: "",
    //     receipt_date: "",
    //     internal_receipt_number: "",
    //     rps_number: "",
    //     nfs_number: "",
    //     total_service_value: "",
    //     irrf_value: "",
    //     adjustment_value: "",
    //     liquid_value: "",
    //     liquid_contract: "",
    //     expected_receipt_date: "",
    //     liquid_contract_date: "",
    //     owner_record: "",
    // });

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
                    name="receipt_date"
                    label="Data:"
                    $labelPosition="top"
                    onChange={(newValue) =>
                        onHandleChange({
                            target: { name: "receipt_date", value: newValue },
                        })
                    }
                    value={formData?.receipt_date ?? currentDate}
                    disableWeekends
                />

                <CustomInput
                    type="text"
                    name="rps"
                    label="RPS:"
                    $labelPosition="top"
                    onChange={(newValue) =>
                        onHandleChange({
                            target: { name: "rps_number", value: newValue },
                        })
                    }
                    value={formData?.rps_number}
                />
                <CustomInput
                    type="text"
                    name="nfs_number"
                    label="Nota Fiscal:"
                    $labelPosition="top"
                    onChange={(newValue) =>
                        onHandleChange({
                            target: { name: "nfs_number", value: newValue },
                        })
                    }
                    value={formData?.nfs_number}
                />
                <CustomInput
                    type="text"
                    name="internal_receipt_number"
                    label="Recibo:"
                    $labelPosition="top"
                    onChange={(newValue) =>
                        onHandleChange({
                            target: {
                                name: "internal_receipt_number",
                                value: newValue,
                            },
                        })
                    }
                    value={formData?.internal_receipt_number}
                />
                <CustomInput
                    type="text"
                    name="total_service_value"
                    label="Valor Bruto:"
                    $labelPosition="top"
                    onChange={(newValue) =>
                        onHandleChange({
                            target: {
                                name: "total_service_value",
                                value: newValue,
                            },
                        })
                    }
                    value={formData?.total_service_value}
                />
                <CustomInput
                    type="text"
                    name="irrf_value"
                    label="Valor IRRF:"
                    $labelPosition="top"
                    onChange={(newValue) =>
                        onHandleChange({
                            target: {
                                name: "irrf_value",
                                value: newValue,
                            },
                        })
                    }
                    value={formData?.irrf_value}
                />
                <CustomInput
                    type="text"
                    name="liquid_value"
                    label="Valor Liquido:"
                    $labelPosition="top"
                    onChange={(newValue) =>
                        onHandleChange({
                            target: {
                                name: "liquid_value",
                                value: newValue,
                            },
                        })
                    }
                    value={formData?.liquid_value}
                />
            </SContainer>
        </Modal>
    );
}
