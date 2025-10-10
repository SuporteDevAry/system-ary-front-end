import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Modal } from "../../../../../../components/Modal";
import { CustomInput } from "../../../../../../components/CustomInput";
import { SContainer } from "./styles";
import CustomDatePicker from "../../../../../../components/CustomDatePicker";
import dayjs from "dayjs";
import { IModalBillingProps } from "./types";
import { BillingContext } from "../../../../../../contexts/BillingContext";
import { ContractContext } from "../../../../../../contexts/ContractContext";
import { IContractData } from "../../../../../../contexts/ContractContext/types";
import { formatCurrency } from "../../../../../../helpers/currencyFormat";

export function ModalBilling({
    open,
    billingToEdit,
    onClose,
    contractRead,
}: IModalBillingProps) {
    const billingContext = BillingContext();
    const contractContext = ContractContext();
    const currentDate = dayjs().format("DD/MM/YYYY");
    const [editingField, setEditingField] = useState<string | null>(null);

    const handleFocusValue = (e: React.FocusEvent<HTMLInputElement>) => {
        setEditingField(e.target.name);
    };

    const handleBlurValue = () => {
        setEditingField(null);
    };

    const handleChangeValue = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        const isNumericField = [
            "total_service_value",
            "irrf_value",
            "adjustment_value",
        ].includes(name);

        if (isNumericField) {
            const numericValue =
                value.replace(/[^\d.,-]/g, "").replace(",", ".") == ""
                    ? 0
                    : value;
            setFormData({
                ...formData,
                [name]: numericValue,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const initialFormData = {
        receipt_date: currentDate,
        rps_number: "",
        nfs_number: "",
        internal_receipt_number: "",
        total_service_value: 0,
        irrf_value: 0,
        adjustment_value: 0,
        liquid_value: 0,
        liquid_contract: "Não",
        liquid_contract_date: "",
        number_contract: billingToEdit?.number_contract || "",
        product_name: billingToEdit?.product_name || "",
        number_broker: billingToEdit?.number_broker || "",
        year: billingToEdit?.year || "",
        expected_receipt_date: billingToEdit?.expected_receipt_date || "",
        owner_record: billingToEdit?.owner_record || "",
    };

    const [formData, setFormData] = useState(() => ({
        receipt_date: billingToEdit?.receipt_date || "",
        rps_number: billingToEdit?.rps_number || "",
        nfs_number: billingToEdit?.nfs_number || "",
        internal_receipt_number: billingToEdit?.internal_receipt_number || "",
        total_service_value: billingToEdit?.total_service_value || 0,
        irrf_value: billingToEdit?.irrf_value || 0,
        adjustment_value: billingToEdit?.adjustment_value || 0,
        liquid_value: billingToEdit?.liquid_value || 0,
        liquid_contract: billingToEdit?.liquid_contract || "",
        liquid_contract_date: billingToEdit?.liquid_contract_date || "",
        number_contract: billingToEdit?.number_contract || "",
        product_name: billingToEdit?.product_name || "",
        number_broker: billingToEdit?.number_broker || "",
        year: billingToEdit?.year || "",
        expected_receipt_date: billingToEdit?.expected_receipt_date || "",
        owner_record: billingToEdit?.owner_record || "",
    }));

    useEffect(() => {
        if (billingToEdit) {
            setFormData({
                ...initialFormData,
                ...billingToEdit,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [billingToEdit, open]);

    useEffect(() => {
        const total = Number(formData.total_service_value) || 0;
        const irrf = Number(formData.irrf_value) || 0;
        const ajuste = Number(formData.adjustment_value) || 0;
        const liq_value = total - irrf + ajuste;

        setFormData((prevData) => ({
            ...prevData,
            liquid_value: liq_value,
        }));
    }, [
        formData.total_service_value,
        formData.irrf_value,
        formData.adjustment_value,
    ]);

    const handleClose = () => {
        onClose();
        setFormData(initialFormData);
    };

    const handleSubmit = async () => {
        // if (
        //     !formData.receipt_date ||
        //     !formData.total_service_value ||
        //     !formData.liquid_value
        // ) {
        //     toast.error(
        //         "Por favor, preencha Data, Valor Total e Valor Líquido."
        //     );
        //     return;
        // }
        try {
            if (billingToEdit.id) {
                await billingContext.updateBilling(billingToEdit?.id || "", {
                    ...formData,
                    liquid_contract_date:
                        formData.liquid_contract == "Sim"
                            ? formData.receipt_date
                            : "",
                });

                const adjustTotal_received: Partial<IContractData> = {};

                if (
                    formData.liquid_value !== undefined &&
                    formData.liquid_value !== null
                )
                    adjustTotal_received.total_received =
                        Number(contractRead.total_received) +
                        Number(formData.liquid_value);

                adjustTotal_received.status_received = formData.liquid_contract;

                await contractContext.updateContractAdjustments(
                    contractRead.id,
                    adjustTotal_received
                );

                toast.success(
                    `Recebimento ${formData.rps_number} foi atualizado com sucesso!`
                );
            } else {
                await billingContext.createBilling({
                    ...formData,
                    liquid_contract_date:
                        formData.liquid_contract == "Sim"
                            ? formData.receipt_date
                            : "",
                });

                const adjustTotal_received: Partial<IContractData> = {};

                if (
                    formData.liquid_value !== undefined &&
                    formData.liquid_value !== null
                )
                    adjustTotal_received.total_received = Number(
                        Number(contractRead.total_received) +
                            Number(formData.liquid_value)
                    );

                adjustTotal_received.status_received = formData.liquid_contract;

                await contractContext.updateContractAdjustments(
                    contractRead.id,
                    adjustTotal_received
                );

                toast.success(
                    `Recebimento ${formData.rps_number} foi criado com sucesso!`
                );
            }

            handleClose();
        } catch (error) {
            toast.error(
                `Erro ao tentar ${
                    billingToEdit.id ? "editar" : "criar"
                } o recebimento: ${error}`
            );
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        customName?: string
    ) => {
        const { name, value, type } = e.target;
        const fieldName = customName || name;

        setFormData((prevData) => ({
            ...prevData,
            [fieldName]: type === "radio" ? value : value,
        }));
    };

    const handleDateChange = (newDate: string) => {
        setFormData((prevData) => ({
            ...prevData,
            receipt_date: newDate,
        }));
    };

    return (
        <Modal
            titleText={"Novo Recebimento"}
            open={open}
            confirmButton="Confirmar"
            cancelButton="Fechar"
            onClose={handleClose}
            onHandleConfirm={handleSubmit}
            variantCancel={"primary"}
            variantConfirm={"success"}

            //maxWidth="md"
            //fullWidth
        >
            <SContainer>
                <CustomDatePicker
                    type="text"
                    name="receipt_date"
                    label="Data:"
                    $labelPosition="top"
                    onChange={handleDateChange}
                    value={formData?.receipt_date ?? currentDate}
                    disableWeekends
                />
                <CustomInput
                    type="text"
                    name="rps_number"
                    label="RPS:"
                    $labelPosition="top"
                    onChange={handleChange}
                    value={formData?.rps_number}
                />
                <CustomInput
                    type="text"
                    name="nfs_number"
                    label="Nota Fiscal:"
                    $labelPosition="top"
                    onChange={handleChange}
                    value={formData?.nfs_number}
                />
                <CustomInput
                    type="text"
                    name="internal_receipt_number"
                    label="Recibo:"
                    $labelPosition="top"
                    onChange={handleChange}
                    value={formData?.internal_receipt_number}
                />
                <CustomInput
                    type="text"
                    name="total_service_value"
                    label="Valor Bruto:"
                    $labelPosition="top"
                    onChange={handleChangeValue}
                    onFocus={handleFocusValue}
                    onBlur={handleBlurValue}
                    value={
                        editingField === "total_service_value"
                            ? formData.total_service_value
                            : formatCurrency(
                                  formData.total_service_value,
                                  "Real"
                              )
                    }
                />
                <CustomInput
                    type="text"
                    name="irrf_value"
                    label="Valor IRRF:"
                    $labelPosition="top"
                    onChange={handleChangeValue}
                    onFocus={handleFocusValue}
                    onBlur={handleBlurValue}
                    value={
                        editingField === "irrf_value"
                            ? formData.irrf_value
                            : formatCurrency(formData.irrf_value, "Real")
                    }
                />
                <CustomInput
                    type="text"
                    name="adjustment_value"
                    label="Valor Ajuste:"
                    $labelPosition="top"
                    onChange={handleChangeValue}
                    onFocus={handleFocusValue}
                    onBlur={handleBlurValue}
                    value={
                        editingField === "adjustment_value"
                            ? formData.adjustment_value
                            : formatCurrency(formData.adjustment_value, "Real")
                    }
                />
                <CustomInput
                    type="text"
                    name="liquid_value"
                    label="Valor Líquido:"
                    $labelPosition="top"
                    onChange={handleChangeValue}
                    onFocus={handleFocusValue}
                    onBlur={handleBlurValue}
                    value={
                        editingField === "liquid_value"
                            ? formData.liquid_value
                            : formatCurrency(formData.liquid_value, "Real")
                    }
                />
                <CustomInput
                    name="liquid_contract"
                    label="Liquidado:"
                    $labelPosition="top"
                    radioPosition="only"
                    radioOptions={[
                        { label: "Sim", value: "Sim" },
                        { label: "Não", value: "Não" },
                        { label: "Parcial", value: "Parcial" },
                    ]}
                    onRadioChange={handleChange}
                    selectedRadio={formData?.liquid_contract || "Não"}
                />
            </SContainer>
        </Modal>
    );
}
