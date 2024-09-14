import jsPDF from "jspdf";

const PdfGenerator = (
    documentContent: Document,
    elementId: string,
    fileName: string,
    output: "window" | "pdf"
): void => {
    const element = documentContent.getElementById(elementId);

    if (element) {
        const htmlContent = element.innerHTML;

        if (output === "pdf") {
            // **Gerar e salvar o arquivo PDF**
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

            pdf.html(element, {
                callback: function (pdf) {
                    pdf.save(fileName);
                },
                x: marginX,
                y: marginY,
                html2canvas: {
                    scale: scale,
                },
            });
        } else if (output === "window") {
            // **Exibir o HTML formatado em uma nova aba do navegador, sem sugestão de impressão**
            const estilo = `
                <style>
                    body {
                      font-family: 'Roboto', sans-serif;
                      font-weight: 400;
                      font-size: 16px;
                      letter-spacing: .6px;
                      word-spacing: 0px;
                      line-height: 1.2;
                      margin: 50px;
                    }
                    p {
                        margin: 0;
                    }
                </style>
            `;
            // const estilo = `
            //     <style>
            //         body {
            //             font-family: Roboto, sans-serif;
            //             font-weight: 400;
            //             font-size: 16px;
            //             margin: 0;
            //             padding: 0;
            //             line-height: 1.2; /* Ajuste do espaçamento entre linhas */
            //         }
            //         p {
            //             margin-bottom: 10px; /* Ajuste do espaço entre parágrafos */
            //         }
            //     </style>
            // `;

            //

            const newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>${fileName}</title>
                            ${estilo}
                        </head>
                        <body>${htmlContent}</body>
                    </html>
                `);
                newWindow.document.close(); // Fecha o stream de escrita e mostra o conteúdo
            } else {
                console.error("Falha ao abrir uma nova janela.");
            }
        }
    } else {
        console.error(
            `PDFGenerator: Element with ID '${elementId}' not found.`
        );
    }
};

export default PdfGenerator;
