import { StepProps } from "../../types";
import CustomButton from "../../../../../../components/CustomButton";
import PdfGenerator from "../../../../../../helpers/PDFGenerator";
import ContratoTemplate from "../../../../../../templates/contrato";

export const Review: React.FC<StepProps> = ({ formData, isEditMode }) => {
  const handleImprimir = () => {
    PdfGenerator(document, "contrato", nomeArquivo, "pdf");
  };

  const today = new Date();
  const yearTwoDigits = today.getFullYear().toString().substr(-2);

  // Só iremos remover essa regra das siglas, caso o cliente aceite a sugestão da reunião do dia 09/04/2025
  const listProducts = ["O", "OC", "OA", "SB", "EP"];
  const validProducts = listProducts.includes(formData.product);
  const siglaProduct = validProducts ? "O" : formData.product;

  const numberContract = formData?.number_contract
    ? formData.number_contract
    : `${siglaProduct}.${formData.number_broker}-NNN/${yearTwoDigits}`;

  let nomeArquivo = `${numberContract}.pdf`;

  const modeSave = isEditMode ? false : true;

  return (
    <>
      <div style={{ width: 900 }}>
        <ContratoTemplate
          formData={formData}
          nomeArquivo={nomeArquivo}
          modeSave={modeSave}
        />
        <div style={{ textAlign: "right" }}>
          <CustomButton onClick={handleImprimir} $variant={"primary"}>
            Gerar PDF
          </CustomButton>
        </div>
      </div>
    </>
  );
};
