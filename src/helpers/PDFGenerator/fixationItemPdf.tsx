import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import FixacaoParcialTemplate from "../../templates/fixacaoParcial";
import { IFixationItem } from "../../contexts/PriceFixationContractContext/types";

interface FixationItemPdfContract {
  number_contract?: string;
  name_product: string;
  crop?: string;
  type_quantity?: string;
  contract_emission_date?: string;
  number_external_contract_buyer?: string;
  number_external_contract_seller?: string;
  seller: { name: string };
  buyer: { name: string };
}

export interface GeneratedFixationItemPdf {
  blob: Blob;
  pages: number;
  sizeKb: number;
  fileName: string;
}

const sanitizeForFileName = (value?: string) =>
  (value || "").replace(/[^\w.-]/g, "_");

export const generateFixationItemPdf = async (
  item: IFixationItem,
  contract: FixationItemPdfContract,
): Promise<GeneratedFixationItemPdf | null> => {
  try {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "fixed";
    tempDiv.style.left = "-9999px";
    document.body.appendChild(tempDiv);
    const root = createRoot(tempDiv);
    root.render(<FixacaoParcialTemplate item={item} contract={contract} />);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const element = tempDiv.querySelector("#fixacao-parcial");
    if (!element || !(element instanceof HTMLElement)) {
      root.unmount();
      document.body.removeChild(tempDiv);
      throw new Error(
        "Elemento com ID 'fixacao-parcial' não encontrado no template.",
      );
    }

    const pdf = new jsPDF("p", "pt", "a4");
    const marginX = 20;
    const marginY = 20;
    const pageWidth = pdf.internal.pageSize.getWidth() - marginX * 2;
    const elementWidth = element.offsetWidth;
    const scale = pageWidth / elementWidth;

    await pdf.html(element, {
      x: marginX,
      y: marginY,
      html2canvas: { scale, useCORS: true, logging: false },
    });

    root.unmount();
    document.body.removeChild(tempDiv);

    const blob = pdf.output("blob");
    const pages = pdf.getNumberOfPages();
    const fileName = `fixacao_${sanitizeForFileName(item.number_contract) || item.id}.pdf`;

    return {
      blob,
      pages,
      sizeKb: Number((blob.size / 1024).toFixed(1)),
      fileName,
    };
  } catch (error) {
    console.error("Erro ao gerar o PDF da fixação:", error);
    return null;
  }
};

export const openFixationItemPdf = async (
  item: IFixationItem,
  contract: FixationItemPdfContract,
): Promise<void> => {
  const generated = await generateFixationItemPdf(item, contract);
  if (!generated) return;

  const url = URL.createObjectURL(generated.blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};
