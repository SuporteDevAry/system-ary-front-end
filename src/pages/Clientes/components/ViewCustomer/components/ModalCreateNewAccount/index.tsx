import { useState } from "react";
import { Modal } from "../../../../../../components/Modal";
import { toast } from "react-toastify";
import FormControlLabel from "@mui/material/FormControlLabel";
import { SBox, SFormContainer, SFormControlLabel } from "./styles";
import { CustomInput } from "../../../../../../components/CustomInput";
import { ModalCreateNewAccountProps } from "./types";
import Checkbox from "@mui/material/Checkbox";
import { ClienteContext } from "../../../../../../contexts/ClienteContext";
import { v4 as uuid } from "uuid";
import ValidatorDocto from "../../../../../../helpers/validatorDocto";
import { insertMaskInCnpj } from "../../../../../../helpers/front-end/insertMaskInCnpj";

export function ModalCreateNewAccount({
    open,
    onClose,
    idCliente,
    account,
}: ModalCreateNewAccountProps) {
    const [formData, setFormData] = useState({
        bank_number: "",
        bank_name: "",
        agency: "",
        account_number: "",
        usePix: "",
        keyPix: "",
        main: "",
        cnpj_pagto: "",
        name_pagto: "",
    });

    const clienteContext = ClienteContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? (checked ? "S" : "N") : value;

        setFormData((prevData) => ({
            ...prevData,
            [name]: newValue,
        }));
    };

    const handleClose = () => {
        onClose();
        setFormData({
            bank_number: "",
            bank_name: "",
            agency: "",
            account_number: "",
            usePix: "",
            keyPix: "",
            main: "",
            cnpj_pagto: "",
            name_pagto: "",
        });
    };

    const handleCreate = async () => {
        if (
            !formData.bank_number ||
            !formData.bank_name ||
            !formData.agency ||
            !formData.account_number
        ) {
            toast.error("Por favor, preencha todos os campos.");
            return;
        }
        if (
            formData.cnpj_pagto.length != 0 &&
            formData.cnpj_pagto.length < 14
        ) {
            toast.error("Informe o número de um CNPJ válido.");
            return;
        }
        if (
            formData.cnpj_pagto.length != 0 &&
            formData.cnpj_pagto.length >= 14 &&
            !ValidatorDocto.isCNPJ(formData.cnpj_pagto)
        ) {
            toast.error("Digito verificador do CNPJ está incorreto.");
            return;
        }
        try {
            const newAccount = {
                id: uuid(),
                bank_number: formData.bank_number,
                bank_name: formData.bank_name.toLocaleUpperCase(),
                agency: formData.agency,
                account_number: formData.account_number,
                usePix: formData.usePix === "S" ? "S" : "N",
                keyPix: formData.keyPix,
                main: formData.main === "S" ? "S" : "N",
                cnpj_pagto: formData.cnpj_pagto,
                name_pagto: formData.name_pagto,
            };

            account.push(newAccount);

            clienteContext.updateCliente(idCliente, {
                account,
            });

            toast.success(
                `Conta Corrente ${newAccount.account_number} criada com sucesso!`
            );
            handleClose();
            return;
        } catch (error) {
            toast.error(
                `Erro ao tentar criar conta corrente, contacte o administrador do sistema ${error}`
            );
        }
    };

    return (
        <Modal
            titleText={"Criar Nova Conta Corrente"}
            open={open}
            confirmButton="Criar"
            cancelButton="Fechar"
            onClose={handleClose}
            onHandleConfirm={handleCreate}
            variantCancel={"primary"}
            variantConfirm={"success"}
        >
            <SFormContainer>
                <CustomInput
                    type="text"
                    name="bank_number"
                    label="Número do Banco:"
                    $labelPosition="top"
                    maxLength={3}
                    onChange={handleChange}
                    value={formData.bank_number}
                />
                <CustomInput
                    type="text"
                    name="bank_name"
                    label="Nome:"
                    $labelPosition="top"
                    onChange={handleChange}
                    value={formData.bank_name}
                />
                <CustomInput
                    type="text"
                    name="agency"
                    label="Agência:"
                    $labelPosition="top"
                    onChange={handleChange}
                    value={formData.agency}
                />
                <CustomInput
                    type="text"
                    name="account_number"
                    label="C/C:"
                    $labelPosition="top"
                    onChange={handleChange}
                    value={formData.account_number}
                />
                <SFormControlLabel
                    control={
                        <Checkbox
                            name="usePix"
                            onChange={handleChange}
                            value={formData.usePix}
                        />
                    }
                    label="Usa Pix"
                />
                <CustomInput
                    type="text"
                    name="keyPix"
                    label="Chave PIX:"
                    $labelPosition="top"
                    onChange={handleChange}
                    value={formData.keyPix}
                />
                <SBox>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="main"
                                onChange={handleChange}
                                value={formData.main}
                            />
                        }
                        label="Conta Principal"
                    />
                </SBox>
                <CustomInput
                    type="text"
                    name="cnpj_pagto"
                    label="CNPJ Pagamento:"
                    $labelPosition="top"
                    maxLength={18}
                    onChange={handleChange}
                    value={insertMaskInCnpj(formData.cnpj_pagto)}
                />
                <CustomInput
                    type="text"
                    name="name_pagto"
                    label="Nome Pagamento:"
                    $labelPosition="top"
                    onChange={handleChange}
                    value={formData.name_pagto}
                />
            </SFormContainer>
        </Modal>
    );
}
