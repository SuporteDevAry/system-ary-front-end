import jsPDF from "jspdf";
import { renderToString } from "react-dom/server"; // Para renderizar o React component para string

interface PdfGeneratorOptions {
  //documentContent: Document;
  elementId: string;
  fileName: string;
  data: any;
  typeContract: "Vendedor" | "Comprador";
  template: string; // Nome do template a ser usado
}

const PdfGeneratorNew = async ({
  //documentContent,
  elementId,
  fileName,
  data,
  typeContract,
  template,
}: PdfGeneratorOptions): Promise<jsPDF | null> => {
  console.log("###Entrei na fn do gerador", data);
  if (!data) {
    console.error(
      "PdfGeneratorNew: Dados não encontrados para popular o template."
    );
    return null;
  }

  // Carregar o template correto com base no nome fornecido (exemplo: 'contrato')
  let TemplateComponent;

  try {
    TemplateComponent = (await import(`../../templates/${template}`)).default; // Fazendo a importação dinâmica
  } catch (error) {
    console.error(`Erro ao carregar o template '${template}':`, error);
    return null;
  }

  // Agora vamos popular o template com os dados fornecidos
  const populatedTemplate = (
    <TemplateComponent data={data} typeContract={typeContract} mo/>
  );

  // Renderizar o componente para uma string HTML
  const templateHTML = renderToString(populatedTemplate);

  // Criar um div temporário para armazenar o template renderizado
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = templateHTML;
  document.body.appendChild(tempDiv); // Adiciona ao DOM temporariamente

  // Aqui você pode garantir que o template tenha o ID correto, por exemplo, um 'contrato-template'
  const element = tempDiv.querySelector(`#${elementId}`);

  // Verificando se o elemento existe e fazendo a asserção de tipo para HTMLElement
  if (!element || !(element instanceof HTMLElement)) {
    console.error(
      `PdfGeneratorNew: Elemento com ID '${elementId}' não encontrado no template.`
    );
    return null;
  }

  // Agora podemos acessar as propriedades offsetWidth e offsetHeight corretamente
  const elementWidth = element.offsetWidth;
  const elementHeight = element.offsetHeight;

  // Configura o PDF para tamanho A4 (portrait) com margens
  const pdf = new jsPDF("p", "pt", "a4");
  const marginX = 20;
  const marginY = 20;
  const pageWidth = pdf.internal.pageSize.getWidth() - marginX * 2;
  const pageHeight = pdf.internal.pageSize.getHeight() - marginY * 2;

  // Definindo a escala para ajustar o conteúdo ao tamanho A4
  const scaleX = pageWidth / elementWidth;
  const scaleY = pageHeight / elementHeight;
  const scale = Math.min(scaleX, scaleY);

  // Gerando o PDF com o conteúdo do elemento
  pdf.html(element, {
    callback: function (pdf) {
      pdf.setProperties({
        title: `Contrato_${typeContract}_${fileName}`,
        subject: `Contrato para ${typeContract}`,
      });
      pdf.save(fileName); // Salva o arquivo com o nome especificado
    },
    x: marginX,
    y: marginY + 20, // Ajuste para deixar espaço para o cabeçalho
    html2canvas: {
      scale, // Aplicando a escala para ajustar o conteúdo ao A4
      width: elementWidth,
      height: elementHeight,
    },
  });

  // Remover o div temporário após a criação do PDF
  document.body.removeChild(tempDiv);

  return pdf;
};

export default PdfGeneratorNew;
