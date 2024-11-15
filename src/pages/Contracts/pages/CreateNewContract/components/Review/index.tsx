import { StepProps } from "../../types";
import CustomButton from "../../../../../../components/CustomButton";
import PdfGenerator from "../../../../../../helpers/PDFGenerator";
import ContratoTemplate from "../../../../../../templates/contrato";

export const Review: React.FC<StepProps> = ({ formData, isEditMode }) => {
  const handleImprimir = () => {
    PdfGenerator(document, "contrato", nomeArquivo, "pdf");
  };

  const today = new Date();
  const ano2 = today.getFullYear().toString().substr(-2);

  const numberContract = formData?.number_contract
    ? formData.number_contract
    : `${formData.product}.${formData.number_broker}-NNN/${ano2}`;

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
