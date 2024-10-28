import { useEffect, useState } from "react";
import { Modal } from "../../../../../../components/Modal";

import { toast } from "react-toastify";
import { SBox, SFormContainer, SFormControlLabel } from "./styles";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { CustomInput } from "../../../../../../components/CustomInput";
import { ModalUpdateAccountProps } from "./types";
import { ClienteContext } from "../../../../../../contexts/ClienteContext";
import { IAccounts } from "../../../../../../contexts/ClienteContext/types";
import ValidatorDocto from "../../../../../../helpers/validatorDocto";
import { insertMaskInCnpj } from "../../../../../../helpers/front-end/insertMaskInCnpj";

export function ModalUpdateAccount({
    open,
    onClose,
    dataAccount,
    codeCliente,
}: ModalUpdateAccountProps) {
    const [formData, setFormData] = useState({
        bank_number: dataAccount.bank_number,
        bank_name: dataAccount.bank_name,
        agency: dataAccount.agency,
        account_number: dataAccount.account_number,
        usePix: dataAccount.usePix,
        keyPix: dataAccount.keyPix,
        main: dataAccount.main,
        cnpj_pagto: dataAccount.cnpj_pagto,
        name_pagto: dataAccount.name_pagto,
    });

    useEffect(() => {
        setFormData({
            bank_number: dataAccount.bank_number,
            bank_name: dataAccount.bank_name,
            agency: dataAccount.agency,
            account_number: dataAccount.account_number,
            usePix: dataAccount.usePix,
            keyPix: dataAccount.keyPix,
            main: dataAccount.main,
            cnpj_pagto: dataAccount.cnpj_pagto,
            name_pagto: dataAccount.name_pagto,
        });
    }, [dataAccount]);

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

    const handleUpdate = async () => {
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
            const accountEdit = {
                id: dataAccount.id,
                bank_number: formData.bank_number,
                bank_name: formData.bank_name.toLocaleUpperCase(),
                agency: formData.agency,
                account_number: formData.account_number,
                usePix: formData.usePix,
                keyPix: formData.keyPix,
                main: formData.main,
                cnpj_pagto: formData.cnpj_pagto,
                name_pagto: formData.name_pagto,
            };

            const responseClient = await clienteContext.getClientById(
                codeCliente
            );

            const customerAccountList = responseClient.data.account;
            const idCliente = responseClient.data.id;

            const newAccount = customerAccountList.filter(
                (account: IAccounts) => account.id !== dataAccount.id
            );

            newAccount.push(accountEdit);

            const dataToSave = {
                account: newAccount,
            };

            clienteContext.updateCliente(idCliente, dataToSave);

            toast.success(
                `Conta Corrente ${accountEdit.account_number} foi atualizada com sucesso!`
            );
            handleClose();
            return;
        } catch (error) {
            toast.error(
                `Erro ao tentar editar conta corrente, contacte o administrador do sistema ${error}`
            );
        }
    };

    return (
        <Modal
            titleText={"Editar Conta Corrente"}
            open={open}
            confirmButton="Salvar"
            cancelButton="Fechar"
            onClose={handleClose}
            onHandleConfirm={handleUpdate}
            variantCancel={"primary"}
            variantConfirm={"success"}
        >
            <SFormContainer>
                <CustomInput
                    type="text"
                    name="bank_number"
                    label="Banco:"
                    maxLength={3}
                    $labelPosition="top"
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
                            checked={formData.usePix === "S"}
                        />
                    }
                    label="Usa Pix"
                />
                <CustomInput
                    type="text"
                    name="keyPIX"
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
                                checked={formData.main === "S"}
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
                    onChange={handleChange}
                    maxLength={18}
                    value={insertMaskInCnpj(formData.cnpj_pagto || "")}
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
