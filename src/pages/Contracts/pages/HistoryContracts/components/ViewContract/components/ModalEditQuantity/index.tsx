import dayjs from "dayjs";
import CustomDatePicker from "../../../../../../../../components/CustomDatePicker";
import { CustomInput } from "../../../../../../../../components/CustomInput";
import CustomTooltipLabel from "../../../../../../../../components/CustomTooltipLabel";
import { Modal } from "../../../../../../../../components/Modal";
import { SBoxDatePicker, SContainer, SText, STextArea } from "./styles";
import { IModalEditQuantityProps } from "./types";
import { useCallback, useEffect } from "react";
import {
  cleanAndParse,
  replaceLastDotWithComma,
  useQuantitiesInput,
} from "../../../../../../../../hooks/useQuantitiesInput.ts";

export function ModalEditQuantity({
  open,
  dataContract,
  onClose,
  onConfirm,
  onHandleChange,
}: IModalEditQuantityProps) {
  const currentDate = dayjs().format("DD/MM/YYYY");

  const initialQuantity = cleanAndParse(dataContract?.final_quantity);

  const {
    displayValue: displayFinalQuantityValue,
    onChange: handleFinalQuantityChange,
    onFocus: handleFinalQuantityFocus,
    onBlur: handleFinalQuantityBlur,
    value: finalQuantityNumber,
  } = useQuantitiesInput(initialQuantity);

  useEffect(() => {
    const currentHookValue = finalQuantityNumber;
    const currentContractValue = cleanAndParse(dataContract?.final_quantity);

    if (currentHookValue !== currentContractValue) {
      onHandleChange?.({
        target: {
          name: "final_quantity",
          // CORREÇÃO: Deve enviar o valor do hook para o estado pai.
          value: currentHookValue !== null ? String(currentHookValue) : null, // <-- Certo!
        },
      });
    }
  }, [finalQuantityNumber, dataContract?.final_quantity, onHandleChange]);

  const handleRadioChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
      const { value } = event.target;

      onHandleChange?.({
        ...event,
        target: {
          ...event.target,
          name,
          value,
        },
      });
    },
    []
  );

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  useEffect(() => {
    console.log("ModalEditQuantity opened", Number(displayFinalQuantityValue));

    // Quando o modal abrir, podemos inicializar ou resetar estados se necessário
  }, [open]);

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
          value={displayFinalQuantityValue}
          onFocus={handleFinalQuantityFocus}
          onBlur={handleFinalQuantityBlur}
          onChange={handleFinalQuantityChange}
        />

        <CustomInput
          name="status_received"
          label="Liquidado:"
          $labelPosition="top"
          radioPosition="only"
          radioOptions={[
            { label: "Sim", value: "Sim" },
            { label: "Não", value: "Não" },
            { label: "Parcial", value: "Parcial" },
          ]}
          onRadioChange={(e) => handleRadioChange(e, "status_received")}
          selectedRadio={dataContract?.status_received || "Não"}
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
