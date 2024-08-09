import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { StepProps } from "../../types";
import { STitle, SKey, SValue, SBox } from "./styles";

export const Review: React.FC<StepProps> = ({ formData }) => {
  return (
    <>
      <SBox>
        <STitle>Review</STitle>

        <SKey>
          Nº Corretor:<SValue>{formData.numberBroker}</SValue>
        </SKey>

        <SKey>
          Vendedor:<SValue>{formData.seller}</SValue>
        </SKey>
        <SKey>
          Comprador: <SValue>{formData.buyer}</SValue>
        </SKey>

        <SKey>
          Nome do Produto: <SValue>{formData.nameProduct}</SValue>
        </SKey>
        <SKey>
          Sigla do Produto: <SValue>{formData.product}</SValue>
        </SKey>
        <SKey>
          Safra:<SValue> {formData.crop}</SValue>
        </SKey>
        <SKey>
          Qualidade: <SValue>{formData.quality}</SValue>
        </SKey>

        <SKey>
          Quantidade: <SValue> {formData.quantity}</SValue>
        </SKey>
        <SKey>
          Preço:
          <SValue>
            {formatCurrency(formData.price, formData.typeCurrency)}
          </SValue>
        </SKey>
        <SKey>
          ICMS: <SValue>{formData.icms}</SValue>
        </SKey>
        <SKey>
          Forma de pagamento: <SValue>{formData.payment}</SValue>
        </SKey>
        <SKey>
          {formData.typePickup}: <SValue>{formData.pickup}</SValue>
        </SKey>
        <SKey>
          Local de {formData.typePickup}:
          <SValue>{formData.pickupLocation}</SValue>
        </SKey>
        <SKey>
          Conferência: <SValue>{formData.inspection}</SValue>
        </SKey>

        <SKey>
          Observação: <SValue>{formData.observation}</SValue>
        </SKey>
        <SKey>
          Comissão Vendedor: <SValue>{formData.commissionSeller}</SValue>
        </SKey>
        <SKey>
          Comissão Comprador: <SValue>{formData.commissionBuyer}</SValue>
        </SKey>
      </SBox>
    </>
  );
};
