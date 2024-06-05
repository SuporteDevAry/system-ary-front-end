import { StepProps } from "../../types";

export const Review: React.FC<StepProps> = ({ formData }) => {
  return (
    <>
      <h1>Review</h1>
      <br />

      <h3>Identificação</h3>
      <br />
      <p>Vendedor: {formData.seller}</p>
      <p>Comprador: {formData.buyer}</p>
      <br />

      <h3>Produto</h3>
      <br />
      <p>Produto: {formData.product}</p>
      <p>Safra: {formData.crop}</p>
      <p>Qualidade: {formData.quality}</p>
      <br />

      <h3>Informação de Venda</h3>
      <br />
      <p>Quantidade: {formData.quantity}</p>
      <p>Preço: {formData.price}</p>
      <p>ICMS: {formData.icms}</p>
      <p>Forma de pagamento: {formData.payment}</p>
      <p>Retirada: {formData.pickup}</p>
      <p>Local de Retirada: {formData.pickupLocation}</p>
      <p>Conferência: {formData.inspection}</p>
      <br />

      <h3>Observação</h3>
      <br />
      <p>Observação: {formData.observation}</p>
    </>
  );
};
