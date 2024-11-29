import jsPDF from "jspdf";
import { renderToString } from "react-dom/server";

interface PdfGeneratorOptions {
  elementId: string; // ID do elemento dentro do template
  fileName: string; // Nome do arquivo PDF
  data: any; // Dados a serem preenchidos no template
  typeContract: "Vendedor" | "Comprador"; // Tipo do contrato
  template: string; // Nome do template a ser usado
}

const PdfGeneratorNew = async ({
  elementId,
  fileName,
  data,
  typeContract,
  template,
}: PdfGeneratorOptions): Promise<jsPDF | null> => {
  try {
    console.log("### Entrei na função do gerador de PDF com dados:", data);

    // Importar o template dinamicamente
    const TemplateComponent = await import(`../../templates/${template}`).then(
      (module) => module.default
    );

    // Renderizar o template com os dados
    const populatedTemplate = (
      <TemplateComponent data={data} typeContract={typeContract} />
    );
    const templateHTML = renderToString(populatedTemplate);

    // Criar um container temporário no DOM para renderizar o HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = templateHTML;
    document.body.appendChild(tempDiv);

    // Selecionar o elemento pelo ID
    const element = tempDiv.querySelector(`#${elementId}`);
    if (!element || !(element instanceof HTMLElement)) {
      console.error(
        `PdfGeneratorNew: Elemento com ID '${elementId}' não encontrado no template.`
      );
      document.body.removeChild(tempDiv);
      return null;
    }

    // Determinar dimensões do elemento para ajuste no PDF
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const scaleX = pageWidth / elementWidth;
    const scaleY = pageHeight / elementHeight;
    const scale = Math.min(scaleX, scaleY);

    // Gerar o PDF com html2canvas
    await pdf.html(element, {
      x: 0,
      y: 0,
      html2canvas: {
        scale,
      },
    });

    document.body.removeChild(tempDiv); // Remover o container temporário

    if (fileName) {
      pdf.save(fileName); // O PDF será salvo com o nome passado
    }
    return pdf;
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    return null;
  }
};

export default PdfGeneratorNew;
