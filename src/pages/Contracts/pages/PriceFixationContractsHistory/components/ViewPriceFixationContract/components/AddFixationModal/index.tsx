import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Modal } from "../../../../../../../../components/Modal";
import { CustomInput } from "../../../../../../../../components/CustomInput";
import CustomDatePicker from "../../../../../../../../components/CustomDatePicker";
import { PriceFixationContractContext } from "../../../../../../../../contexts/PriceFixationContractContext";
import { IPriceFixationContractData } from "../../../../../../../../contexts/PriceFixationContractContext/types";
import { useInfo } from "../../../../../../../../hooks";
import { generateFixationItemPdf } from "../../../../../../../../helpers/PDFGenerator/fixationItemPdf";

interface AddFixationModalProps {
  open: boolean;
  contract: IPriceFixationContractData | null;
  onClose: () => void;
  onRegistered: (updatedContract: IPriceFixationContractData) => void;
}

const emptyForm = {
  quantity: "",
  fixation_date: "",
  reference_month: "",
  cbot_code: "",
  cbot_value: "",
  premium: "",
  conversion_factor: "",
  fobbings: "",
  exchange_rate: "",
  exchange_rate_date: "",
};

const toNumber = (value: string): number => Number(value.replace(",", "."));

export function AddFixationModal({
  open,
  contract,
  onClose,
  onRegistered,
}: AddFixationModalProps) {
  const { addFixationItem, updateFixationItemPdfMetadata } =
    PriceFixationContractContext();
  const { dataUserInfo } = useInfo();
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setForm(emptyForm);
    onClose();
  };

  // Prévia ao vivo da "Memória de Cálculo" (o backend recalcula do zero ao salvar).
  const preview = useMemo(() => {
    const cbotValue = toNumber(form.cbot_value || "0");
    const premium = toNumber(form.premium || "0");
    const conversionFactor = toNumber(form.conversion_factor || "0");
    const fobbings = toNumber(form.fobbings || "0");
    const exchangeRate = toNumber(form.exchange_rate || "0");

    if (!conversionFactor || !exchangeRate) return null;

    const ppeUsd = (cbotValue + premium) * conversionFactor - fobbings;
    const priceUsdPerSaca = ppeUsd / (1000 / 60);
    const priceBrlPerSaca = priceUsdPerSaca * exchangeRate;

    return { ppeUsd, priceUsdPerSaca, priceBrlPerSaca };
  }, [
    form.cbot_value,
    form.premium,
    form.conversion_factor,
    form.fobbings,
    form.exchange_rate,
  ]);

  const handleConfirm = async () => {
    if (!contract?.id) {
      toast.error("Contrato não encontrado.");
      return;
    }

    if (!form.quantity || !form.fixation_date || !form.reference_month) {
      toast.info("Preencha quantidade, mês de referência e data da fixação.");
      return;
    }

    if (
      !form.cbot_value ||
      form.premium === "" ||
      !form.conversion_factor ||
      form.fobbings === "" ||
      !form.exchange_rate
    ) {
      toast.info(
        "Preencha CBOT, prêmio, fator de conversão, fobbings e câmbio.",
      );
      return;
    }

    setIsSaving(true);
    try {
      const response = await addFixationItem(contract.id, {
        quantity: toNumber(form.quantity),
        fixation_date: form.fixation_date,
        reference_month: form.reference_month,
        cbot_code: form.cbot_code,
        cbot_value: toNumber(form.cbot_value),
        premium: toNumber(form.premium),
        conversion_factor: toNumber(form.conversion_factor),
        fobbings: toNumber(form.fobbings),
        exchange_rate: toNumber(form.exchange_rate),
        exchange_rate_date: form.exchange_rate_date,
        created_by_name: dataUserInfo?.name,
        created_by_email: dataUserInfo?.email,
      });

      toast.success("Fixação registrada com sucesso!");
      setForm(emptyForm);

      // Gera o PDF de confirmação desta fixação e salva só os metadados
      // (nome/tamanho/páginas) — o arquivo em si é regerado sob demanda.
      const newItem = response.data.item;
      if (newItem?.id) {
        const generated = await generateFixationItemPdf(newItem, contract);
        if (generated) {
          await updateFixationItemPdfMetadata(contract.id, newItem.id, {
            pdf_file_name: generated.fileName,
            pdf_file_size_kb: generated.sizeKb,
            pdf_pages: generated.pages,
          });
        }
      }

      onRegistered(response.data.contract);
    } catch (error) {
      toast.error(`Erro ao registrar fixação: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      titleText={`Fixação de CBOT, Prêmio e Câmbio — ${contract?.number_contract || ""}`}
      open={open}
      confirmButton={isSaving ? "Salvando..." : "Registrar"}
      cancelButton="Cancelar"
      onClose={handleClose}
      onHandleConfirm={handleConfirm}
      variantCancel="primary"
      variantConfirm="success"
      disabledConfirm={isSaving}
      maxWidth="sm"
      fullWidth
    >
      <CustomInput
        type="text"
        name="quantity"
        label="Quantidade do lote:"
        $labelPosition="top"
        onChange={handleChange}
        value={form.quantity}
      />

      <CustomInput
        type="text"
        name="reference_month"
        label="Mês de Referência (ex.: Maio/26):"
        $labelPosition="top"
        onChange={handleChange}
        value={form.reference_month}
      />

      <CustomInput
        type="text"
        name="cbot_code"
        label="Código CBOT (ex.: SK6):"
        $labelPosition="top"
        onChange={handleChange}
        value={form.cbot_code}
      />

      <CustomInput
        type="text"
        name="cbot_value"
        label="CBOT:"
        $labelPosition="top"
        onChange={handleChange}
        value={form.cbot_value}
      />

      <CustomInput
        type="text"
        name="premium"
        label="Prêmio (pode ser negativo):"
        $labelPosition="top"
        onChange={handleChange}
        value={form.premium}
      />

      <CustomInput
        type="text"
        name="conversion_factor"
        label="Fator de Conversão (t/m):"
        $labelPosition="top"
        onChange={handleChange}
        value={form.conversion_factor}
      />

      <CustomInput
        type="text"
        name="fobbings"
        label="Fobbings/tm:"
        $labelPosition="top"
        onChange={handleChange}
        value={form.fobbings}
      />

      <CustomInput
        type="text"
        name="exchange_rate"
        label="Câmbio:"
        $labelPosition="top"
        onChange={handleChange}
        value={form.exchange_rate}
      />

      <CustomDatePicker
        width="260px"
        height="38x"
        name="exchange_rate_date"
        label="Data do Câmbio (pagamento):"
        $labelPosition="top"
        onChange={(date: string) =>
          setForm((prev) => ({ ...prev, exchange_rate_date: date }))
        }
        value={form.exchange_rate_date}
        suggestCurrentDateWhenEmpty={false}
      />

      <CustomDatePicker
        width="260px"
        height="38x"
        name="fixation_date"
        label="Data da Fixação:"
        $labelPosition="top"
        onChange={(date: string) =>
          setForm((prev) => ({ ...prev, fixation_date: date }))
        }
        value={form.fixation_date}
        suggestCurrentDateWhenEmpty={false}
      />

      {preview && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
            fontSize: "13px",
          }}
        >
          <strong>Memória de Cálculo:</strong>
          <div>PPE (Preço Parid. Exp.): USD {preview.ppeUsd.toFixed(2)}</div>
          <div>
            Preço/saca: USD {preview.priceUsdPerSaca.toFixed(2)} x{" "}
            {form.exchange_rate} = R$ {preview.priceBrlPerSaca.toFixed(2)}
          </div>
        </div>
      )}
    </Modal>
  );
}
