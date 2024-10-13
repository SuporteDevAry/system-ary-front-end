import { useState } from "react";
import { Modal } from "../../../../../../components/Modal";
import { toast } from "react-toastify";
import { SFormContainer } from "./styles";
import { CustomInput } from "../../../../../../components/CustomInput";
import { ModalCreateNewAccountProps } from "./types";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { ClienteContext } from "../../../../../../contexts/ClienteContext";
import { v4 as uuid } from "uuid";

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
        usePix: false,
        keyPix: "",
        main: false,
    });

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

        try {
            const newAccount = {
                id: uuid(),
                bank_number: formData.bank_number,
                bank_name: formData.bank_name,
                agency: formData.agency,
                account_number: formData.account_number,
                usePix: formData.usePix ? "S" : "N",
                keyPix: formData.keyPix,
                main: formData.main ? "S" : "N",
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
                    name="keyPix"
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
