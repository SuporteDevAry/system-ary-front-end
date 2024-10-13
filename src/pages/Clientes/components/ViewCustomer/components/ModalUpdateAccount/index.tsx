import { useEffect, useState } from "react";
import { Modal } from "../../../../../../components/Modal";

import { toast } from "react-toastify";
import { SFormContainer } from "./styles";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { CustomInput } from "../../../../../../components/CustomInput";
import { ModalUpdateAccountProps } from "./types";
import { ClienteContext } from "../../../../../../contexts/ClienteContext";

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
        });
    }, [dataAccount]);

    const clienteContext = ClienteContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleClose = () => {
        onClose();
        setFormData({
            bank_number: "",
            bank_name: "",
            agency: "",
            account_number: "",
            usePix: false,
            keyPix: "",
            main: false,
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

        try {
            const accountEdit = {
                id: dataAccount.id,
                bank_number: formData.bank_number,
                bank_name: formData.bank_name,
                agency: formData.agency,
                account_number: formData.account_number,
                usePix: formData.usePix,
                keyPix: formData.keyPix,
                principal: formData.main,
            };

            const responseClient = await clienteContext.getClientById(
                codeCliente
            );

            const customerAccountList = responseClient.data.account;
            const idCliente = responseClient.data.id;

            const newAccount = customerAccountList.filter(
                (account) => account.id !== dataAccount.id
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
                <FormControlLabel
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
                    name="keyPIX"
                    label="Chave PIX:"
                    $labelPosition="top"
                    onChange={handleChange}
                    value={formData.keyPix}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            name="main"
                            onChange={handleChange}
                            value={formData.main}
                        />
                    }
                    label="Principal"
                />
            </SFormContainer>
        </Modal>
    );
}
