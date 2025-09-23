import dayjs from "dayjs";
import CustomDatePicker from "../../../../../../../../components/CustomDatePicker";
import { CustomInput } from "../../../../../../../../components/CustomInput";
import CustomTooltipLabel from "../../../../../../../../components/CustomTooltipLabel";
import { Modal } from "../../../../../../../../components/Modal";
import { SBoxDatePicker, SContainer, SText, STextArea } from "./styles";
import { IModalEditQuantityProps } from "./types";
import { useEffect } from "react";
import { toast } from "react-toastify";

export function ModalEditQuantity({
  open,
  dataContract,
  onClose,
  onConfirm,
  onHandleChange,
}: IModalEditQuantityProps) {
  const currentDate = dayjs().format("DD/MM/YYYY");

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const fetchCnpjData = async () => {
    // Substitua '12345678000195' pelo CNPJ que você quer testar
    const cnpj = "05668724000121";

    // Use o novo caminho de proxy: '/api-cnpj'
    try {
      const response = await fetch(`/api-cnpj/cnpj/${cnpj}`);

      if (!response.ok) {
        throw new Error("Erro na requisição da API");
      }

      const result = await response.json();
      console.log("#########", result);
    } catch (err) {
      console.log(err);
    }
  };

  if (open) {
    fetchCnpjData();
  }

  return (
    <Modal
      titleText={"Editar ajustes de cobrança"}
      open={open}
      confirmButton="Alterar"
      cancelButton="Fechar"
      onClose={handleClose}
      onHandleConfirm={handleConfirm}
      variantCancel={"primary"}
      variantConfirm={"success"}
      maxWidth="md"
      fullWidth
    >
      <SContainer>
        <SBoxDatePicker>
          <CustomDatePicker
            width="260px"
            height="38px"
            name="payment_date"
            label="Data do Pagamento:"
            $labelPosition="top"
            onChange={(newValue) =>
              onHandleChange({
                target: { name: "payment_date", value: newValue },
              })
            }
            value={dataContract?.payment_date ?? currentDate}
            disableWeekends
          />

          <CustomDatePicker
            width="260px"
            height="38px"
            name="charge_date"
            label="Data da Cobrança:"
            $labelPosition="top"
            onChange={(newValue) =>
              onHandleChange({
                target: { name: "charge_date", value: newValue },
              })
            }
            value={dataContract?.charge_date ?? currentDate}
            disableWeekends
          />

          <CustomDatePicker
            width="260px"
            height="38px"
            name="expected_receipt_date"
            label="Data Prevista do Recebimento:"
            $labelPosition="top"
            onChange={(newValue) =>
              onHandleChange({
                target: { name: "expected_receipt_date", value: newValue },
              })
            }
            value={dataContract?.expected_receipt_date ?? currentDate}
            disableWeekends
          />
        </SBoxDatePicker>

        <CustomInput
          type="text"
          name="final_quantity"
          label="Quantidade Final:"
          $labelPosition="top"
          value={dataContract?.final_quantity?.toString() || ""}
          onChange={onHandleChange}
          radioPosition="inline"
        />

        <CustomInput
          type="text"
          name="status_received"
          label="Liquidado:"
          $labelPosition="top"
          value={dataContract?.status_received || ""}
          onChange={onHandleChange}
        />

        <CustomTooltipLabel
          title={`As informações deste campo não serão exibidas no contrato.`}
        >
          <SText>Comunicado interno:</SText>
        </CustomTooltipLabel>
        <STextArea
          name="internal_communication"
          onChange={onHandleChange}
          value={dataContract?.internal_communication || ""}
        />
      </SContainer>
    </Modal>
  );
}
