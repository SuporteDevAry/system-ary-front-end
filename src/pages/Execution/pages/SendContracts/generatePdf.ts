import { IContractData } from "../../../../contexts/ContractContext/types";
import PdfGeneratorNew from "../../../../helpers/PDFGenerator/pdfnew";
import { ITemplates } from "../../../../templates";

const generatePdf = async (
  contractData: IContractData,
  typeContract: "Vendedor" | "Comprador",
  templateName: ITemplates["template"]
) => {
  try {
    if (!contractData) {
      throw new Error("Dados do contrato não encontrados.");
    }

    if (!contractData.contract_emission_date) {
      throw new Error("Data de emissão não encontrada no contrato.");
    }

    const numberContract = contractData?.number_contract?.replace("/", "-");
    const pdf = await PdfGeneratorNew({
      fileName: `Contrato_${numberContract}_${typeContract}`,
      data: contractData,
      typeContract: typeContract,
      template: templateName,
    });

    return pdf
      ? new Blob([await pdf.output("arraybuffer")], { type: "application/pdf" })
      : null;
  } catch (error) {
    console.error(error);
    throw new Error("Erro ao gerar o PDF.");
  }
};

export default generatePdf;
