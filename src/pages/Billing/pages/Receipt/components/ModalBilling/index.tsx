import React, { useEffect, useState } from "react";
import { Modal } from "../../../../../../components/Modal";
import { CustomInput } from "../../../../../../components/CustomInput";
import { SContainer } from "./styles";
import CustomDatePicker from "../../../../../../components/CustomDatePicker";
import dayjs from "dayjs";
import { IModalBillingProps } from "./types";
import { formatCurrency } from "../../../../../../helpers/currencyFormat";

export function ModalBilling({
    open,
    billingToEdit,
    onClose,
    onConfirm,
    contractRead,
    formData,
    setFormData,
}: IModalBillingProps) {
    const currentDate = dayjs().format("DD/MM/YYYY");

    // editingValues guarda strings enquanto o usuário digita: { total_service_value: "123,45", ... }
    const [editingValues, setEditingValues] = useState<Record<string, string>>(
        {}
    );

    // Helper: converte qualquer entrada (string com vírgula, número, valor formatado) para number seguro
    const toNumberSafe = (val: any) => {
        if (val === null || val === undefined || val === "") return 0;
        if (typeof val === "number" && !isNaN(val)) return val;
        // remove R$, espaços, pontos de milhar e troca vírgula por ponto
        const cleaned = String(val)
            .replace(/[R$\s]/g, "")
            .replace(/\./g, "")
            .replace(",", ".");
        const n = parseFloat(cleaned);
        return isNaN(n) ? 0 : n;
    };

    // Retorna string para editar: "123,45" (sem R$ e sem pontos)
    const stringForEdit = (val: any) => {
        if (val === null || val === undefined || val === "") return "";
        if (typeof val === "number") {
            return val.toFixed(2).replace(".", ",");
        }
        // já string — remove R$ e pontos de milhar
        return String(val)
            .replace(/[R$\s]/g, "")
            .replace(/\./g, "");
    };

    // onFocus: cria entrada em editingValues com string para edição
    const handleFocusValue = (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.name;
        setEditingValues((prev) => {
            if (prev[name] !== undefined) return prev; // já no modo edição
            return { ...prev, [name]: stringForEdit(formData?.[name]) };
        });
    };

    // onChange: atualiza editingValues[name] permitindo vírgula
    const handleChangeValue = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        const numericFields = [
            "total_service_value",
            "irrf_value",
            "adjustment_value",
            "liquid_value",
        ];
        if (numericFields.includes(name)) {
            // permite dígitos, vírgula e pontos (usuário pode digitar 1.234,56)
            // mas simplificamos: só removemos caracteres inválidos
            const clean = String(value).replace(/[^\d,\.]/g, "");
            setEditingValues((prev) => ({ ...prev, [name]: clean }));
            return;
        }

        // outros campos normais
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    // onBlur: converte a string de edição em número e grava em formData; remove editingValues[name]
    const handleBlurValue = (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const editing = editingValues[name];

        if (editing === undefined) {
            // se não estava em edição, nada a converter (pode ocorrer)
            setEditingValues((prev) => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
            return;
        }

        // limpeza: remove pontos de milhar, troca vírgula por ponto
        const cleaned = String(editing).replace(/\./g, "").replace(",", ".");
        const numericValue = parseFloat(cleaned);
        const final = isNaN(numericValue) ? 0 : Number(numericValue);

        setFormData((prev: any) => ({
            ...prev,
            [name]: final,
        }));

        // remove do modo edição (assim volta a exibir formatCurrency)
        setEditingValues((prev) => {
            const copy = { ...prev };
            delete copy[name];
            return copy;
        });
    };

    // Generic change for radios / textareas etc (se ainda usar)
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        customName?: string
    ) => {
        const { name, value, type } = e.target;
        const fieldName = customName || name;
        setFormData((prevData: any) => ({
            ...prevData,
            [fieldName]: type === "radio" ? value : value,
        }));
    };

    const handleDateChange = (newDate: string) => {
        setFormData((prevData: any) => ({
            ...prevData,
            receipt_date: newDate,
        }));
    };

    // initialFormData com números
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
        owner_record: "",
        year: contractRead?.number_contract?.split("/")[1] || "",
        product_name: contractRead?.name_product || "",
        number_contract: contractRead?.number_contract || "",
        number_broker: contractRead?.number_broker || "",
        expected_receipt_date: contractRead?.expected_receipt_date || "",
    };

    // quando abrir/editar, inicializa formData com números seguros
    useEffect(() => {
        if (billingToEdit) {
            setFormData({
                ...initialFormData,
                ...billingToEdit,
                total_service_value: toNumberSafe(
                    billingToEdit.total_service_value
                ),
                irrf_value: toNumberSafe(billingToEdit.irrf_value),
                adjustment_value: toNumberSafe(billingToEdit.adjustment_value),
                liquid_value: toNumberSafe(billingToEdit.liquid_value),
            });
        } else {
            setFormData(initialFormData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billingToEdit, open]);

    // recalcula liquid_value a partir de números seguros
    useEffect(() => {
        const total = toNumberSafe(formData.total_service_value);
        const irrf = toNumberSafe(formData.irrf_value);
        const ajuste = toNumberSafe(formData.adjustment_value);
        const liq_value = total - irrf + ajuste;

        setFormData((prevData: any) => ({
            ...prevData,
            total_service_value: total,
            irrf_value: irrf,
            adjustment_value: ajuste,
            liquid_value: Number(liq_value.toFixed(2)),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        formData.total_service_value,
        formData.irrf_value,
        formData.adjustment_value,
    ]);

    const handleClose = () => {
        onClose();
        setFormData({
            ...initialFormData,
            year: contractRead?.number_contract?.split("/")[1] || "",
            product_name: contractRead?.name_product || "",
            number_contract: contractRead?.number_contract || "",
            number_broker: contractRead?.number_broker || "",
            expected_receipt_date: contractRead?.expected_receipt_date || "",
        });
        setEditingValues({});
    };

    // Renderiza valor: se estiver em edição usa editingValues[name], senão formatCurrency
    const valueToShow = (name: string) => {
        if (editingValues[name] !== undefined) return editingValues[name];
        return formatCurrency(formData?.[name], "Real");
    };

    return (
        <Modal
            titleText={"Novo Recebimento"}
            open={open}
            confirmButton="Confirmar"
            cancelButton="Fechar"
            onClose={handleClose}
            onHandleConfirm={onConfirm}
            variantCancel={"primary"}
            variantConfirm={"success"}
        >
            <SContainer>
                <CustomDatePicker
                    type="text"
                    name="receipt_date"
                    label="Data:"
                    $labelPosition="top"
                    onChange={handleDateChange}
                    value={formData?.receipt_date ?? currentDate}
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

                {/* Valor Bruto */}
                <CustomInput
                    type="text"
                    name="total_service_value"
                    label="Valor Bruto:"
                    $labelPosition="top"
                    onChange={handleChangeValue}
                    onFocus={handleFocusValue}
                    onBlur={handleBlurValue}
                    value={valueToShow("total_service_value")}
                />

                {/* IRRF */}
                <CustomInput
                    type="text"
                    name="irrf_value"
                    label="Valor IRRF:"
                    $labelPosition="top"
                    onChange={handleChangeValue}
                    onFocus={handleFocusValue}
                    onBlur={handleBlurValue}
                    value={valueToShow("irrf_value")}
                />

                {/* Ajuste */}
                <CustomInput
                    type="text"
                    name="adjustment_value"
                    label="Valor Ajuste:"
                    $labelPosition="top"
                    onChange={handleChangeValue}
                    onFocus={handleFocusValue}
                    onBlur={handleBlurValue}
                    value={valueToShow("adjustment_value")}
                />

                {/* Valor Líquido (calculado) */}
                <CustomInput
                    type="text"
                    name="liquid_value"
                    label="Valor Líquido:"
                    $labelPosition="top"
                    onChange={handleChangeValue}
                    onFocus={handleFocusValue}
                    onBlur={handleBlurValue}
                    value={valueToShow("liquid_value")}
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
