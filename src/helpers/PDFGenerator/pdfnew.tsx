import jsPDF from "jspdf";
import { templates } from "../../templates";
import { createRoot } from "react-dom/client";

interface IPdfGenerator {
  fileName: string;
  data: any;
  typeContract: "Vendedor" | "Comprador";
  template: keyof typeof templates;
}

const PdfGeneratorNew = async ({
  fileName,
  data,
  typeContract,
  template,
}: IPdfGenerator): Promise<jsPDF | null> => {
  try {
    if (!data || !data.quantity) {
      throw new Error("A propriedade 'quantity' está faltando nos dados.");
    }

    const TemplateComponent = templates[template];
    if (!TemplateComponent) {
      throw new Error(`Template "${template}" não encontrado.`);
    }

    const populatedTemplate = (
      <TemplateComponent
        data={data}
        typeContract={typeContract}
        modeSave={true}
      />
    );

    const tempDiv = document.createElement("div");
    document.body.appendChild(tempDiv);
    const root = createRoot(tempDiv);
    root.render(populatedTemplate);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const element = tempDiv.querySelector("#contrato");
    if (!element || !(element instanceof HTMLElement)) {
      console.error("Conteúdo atual do tempDiv:", tempDiv.innerHTML);
      throw new Error("Elemento com ID 'contrato' não encontrado no template.");
    }

    const pdf = new jsPDF("p", "pt", "a4");
    const marginX = 20;
    const marginY = 20;
    const pageWidth = pdf.internal.pageSize.getWidth() - marginX * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - marginY * 2;
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;
    const scaleX = pageWidth / elementWidth;
    const scaleY = pageHeight / elementHeight;
    const scale = Math.min(scaleX, scaleY);

    await pdf.html(element, {
      x: marginX,
      y: marginY,
      html2canvas: {
        scale,
        useCORS: true,
        logging: false,
      },
    });

    root.unmount();
    document.body.removeChild(tempDiv);

    if (fileName) {
      pdf.save(fileName);
    }

    return pdf;
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    return null;
  }
};

export default PdfGeneratorNew;
