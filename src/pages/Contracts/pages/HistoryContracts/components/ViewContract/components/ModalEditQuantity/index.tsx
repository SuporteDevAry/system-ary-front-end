import dayjs from "dayjs";
import CustomDatePicker from "../../../../../../../../components/CustomDatePicker";
import { CustomInput } from "../../../../../../../../components/CustomInput";
import CustomTooltipLabel from "../../../../../../../../components/CustomTooltipLabel";
import { Modal } from "../../../../../../../../components/Modal";
import { SBoxDatePicker, SContainer, SText, STextArea } from "./styles";
import { IModalEditQuantityProps } from "./types";
import { useCallback, useState } from "react";
import { numberToQuantityString } from "../../../../../../../../helpers/quantityFormat";
import { formatQuantity } from "../../../../../CreateNewContract/components/Step3/hooks";

export function ModalEditQuantity({
  open,
  dataContract,
  onClose,
  onConfirm,
  onHandleChange,
}: IModalEditQuantityProps) {
  const currentDate = dayjs().format("DD/MM/YYYY");
  const [isEditingQuantity, setIsEditingQuantity] = useState<boolean>(false);

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

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onHandleChange?.(e);
  };

  const handleQuantityFocus = () => {
    setIsEditingQuantity(true);
  };

  const handleQuantityBlur = () => {
    setIsEditingQuantity(false);
    const formattedValue = formatQuantity(
      numberToQuantityString(dataContract?.final_quantity ?? 0)
    );
    onHandleChange?.({
      target: { name: "final_quantity", value: formattedValue },
    });
  };

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

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
          value={
            isEditingQuantity
              ? String(dataContract?.final_quantity ?? "")
              : formatQuantity(
                  numberToQuantityString(dataContract?.final_quantity ?? 0)
                )
          }
          onChange={handleQuantityChange}
          onFocus={handleQuantityFocus}
          onBlur={handleQuantityBlur}
          radioPosition="inline"
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

        <CustomInput
          type="text"
          name="number_external_contract_buyer"
          label="Nº Ctr. Comprador:"
          $labelPosition="top"
          value={dataContract?.number_external_contract_buyer || ""}
          onChange={onHandleChange}
        />

        {dataContract?.type_currency === "Dólar" && (
          <CustomInput
            type="text"
            name="day_exchange_rate"
            label="Cotação Negociada:"
            $labelPosition="top"
            value={dataContract?.day_exchange_rate || ""}
            onChange={onHandleChange}
          />
        )}

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
