import { useState } from "react";
//import { toast } from "react-toastify";
import { SFormContainer } from "./styles";
import { Modal } from "../../../../../../components/Modal";
import { CustomInput } from "../../../../../../components/CustomInput";

interface ModalCreateNewReceiptProps {
    open: boolean;
    onClose: () => void;
}

export function ModalCreateNewReceipt({
    open,
    onClose,
}: ModalCreateNewReceiptProps) {
    // const userContext = UserContext();

    const [formData, setFormData] = useState({
        dataCobranca: "",
        rps: "",
        dataNF: "",
        nf: "",
        recibo: "",
        quantidade: "",
        valor_bruto: "",
        valor_ir: "",
        valor_liq: "",
        liquidado: "",
    });

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
            dataCobranca: "",
            rps: "",
            dataNF: "",
            nf: "",
            recibo: "",
            quantidade: "",
            valor_bruto: "",
            valor_ir: "",
            valor_liq: "",
            liquidado: "",
        });
    };

    const handleCreate = async () => {
        // if (
        //   !formData.dataCobranca ||
        //   !formData.rps ||
        //   !formData.dataNF ||
        //   !formData.nf
        // ) {
        //   toast.error("Por favor, preencha todos os campos.");
        //   return;
        // }
        // try {
        //   const newReceipt = await receiptContext.createReceipt({
        //     dataCobranca: formData.dataCobranca,
        //     rps: formData.rps,
        //     dataNF: formData.dataNF,
        //     nf: formData.nf,
        //     valor_bruto: formData.valor_bruto,
        //     valor_ir: formData.valor_ir,
        //     valor_liq: formData.valor_liq,
        //   });
        //   toast.success(`Recebimento foi criado com sucesso!`);
        //   handleClose();
        //   return newReceipt;
        // } catch (error) {
        //   toast.error(
        //     `Erro ao tentar criar recebimento, contacte o administrador do sistema ${error}`
        //   );
        // }

        // apagar após testes
        handleClose();
    };

    return (
        <Modal
            titleText={"Novo Recebimento"}
            open={open}
            confirmButton="Gravar"
            cancelButton="Fechar"
            onClose={handleClose}
            onHandleConfirm={handleCreate}
            variantCancel={"primary"}
            variantConfirm={"success"}
        >
            <SFormContainer>
                <div
                    style={{
                        display: "flex",
                        gap: "5px",
                        alignItems: "flex-start",
                    }}
                >
                    <CustomInput
                        type="text"
                        name="dataCobranca"
                        label="Data:"
                        $labelPosition="top"
                        onChange={handleChange}
                        value={formData.dataCobranca}
                        width="100%"
                    />
                    <CustomInput
                        type="text"
                        name="rps"
                        label="RPS:"
                        $labelPosition="top"
                        onChange={handleChange}
                        value={formData.rps}
                        width="100%"
                    />
                    <CustomInput
                        type="text"
                        name="nf"
                        label="Nota Fiscal:"
                        $labelPosition="top"
                        onChange={handleChange}
                        value={formData.nf}
                        width="100%"
                    />
                    <CustomInput
                        type="text"
                        name="nf"
                        label="Recibo:"
                        $labelPosition="top"
                        onChange={handleChange}
                        value={formData.recibo}
                        width="100%"
                    />
                </div>
                <CustomInput
                    type="text"
                    name="valor_bruto"
                    label="Valor Bruto:"
                    $labelPosition="left"
                    onChange={handleChange}
                    value={formData.valor_bruto}
                />
                <CustomInput
                    type="text"
                    name="valor_ir"
                    label="Valor IRRF:"
                    $labelPosition="left"
                    onChange={handleChange}
                    value={formData.valor_ir}
                />
                <CustomInput
                    type="text"
                    name="valor_liq"
                    label="Valor Liquido:"
                    $labelPosition="left"
                    onChange={handleChange}
                    value={formData.valor_liq}
                />

                <CustomInput
                    type="text"
                    name="quantidade"
                    label="Quantidade:"
                    $labelPosition="left"
                    onChange={handleChange}
                    value={formData.quantidade}
                />

                <CustomInput
                    type="text"
                    name="liquidado"
                    label="Liquidado:"
                    $labelPosition="left"
                    onChange={handleChange}
                    value={formData.liquidado}
                />
            </SFormContainer>
        </Modal>
    );
}
