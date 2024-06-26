import { StepProps } from "../../types";
import { STitle, SKey, SValue, SBox } from "./styles";

export const Review: React.FC<StepProps> = ({ formData }) => {
  return (
    <>
      <SBox>
        <STitle>Review</STitle>

        <SKey>
          Vendedor:<SValue>{formData.seller}</SValue>{" "}
        </SKey>
        <SKey>
          Comprador: <SValue>{formData.buyer}</SValue>
        </SKey>

        <SKey>
          Nome do Produto: <SValue>{formData.nameProduct}</SValue>
        </SKey>
        <SKey>
          Produto: <SValue>{formData.product}</SValue>
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
          Preço: <SValue>{formData.price}</SValue>
        </SKey>
        <SKey>
          ICMS: <SValue>{formData.icms}</SValue>
        </SKey>
        <SKey>
          Forma de pagamento: <SValue>{formData.payment}</SValue>
        </SKey>
        <SKey>
          Retirada: <SValue>{formData.pickup}</SValue>
        </SKey>
        <SKey>
          Local de Retirada: <SValue>{formData.pickupLocation}</SValue>
        </SKey>
        <SKey>
          Conferência: <SValue>{formData.inspection}</SValue>
        </SKey>

        <SKey>
          Observação: <SValue>{formData.observation}</SValue>
        </SKey>
      </SBox>
    </>
  );
};
