import jsPDF from "jspdf";

const contratoPDF = (
    documentContent: Document,
    elementId: string,
    fileName: string
): void => {
    const element = documentContent.getElementById(elementId);
    if (element) {
        const elemento = document.getElementById(elementId);
        const htmlContent = elemento ? elemento.innerHTML : "";

        const estilo = `
            body, p, span {
                font-family:  Roboto, sans-serif;
                font-weight: 300;
                font-size: 10px;
                margin: 0;
                padding: 0;
            }
        `;

        const iframe = document.createElement("iframe");
        iframe.style.position = "absolute";
        iframe.style.border = "none";

        document.body.appendChild(iframe);

        const iframeWindow = iframe.contentWindow;
        if (!iframeWindow) {
            console.log("Falha ao acessar o contentWindow do iframe.");
            return;
        }

        const doc = iframeWindow.document;
        doc.open();
        doc.write(`
            <html>
                <head>
                    <style>
                        ${estilo}
                    </style>
                </head>
                <body>
                    ${htmlContent}
                </body>
            </html>
        `);
        doc.close();

        iframe.onload = () => {
            const imgs = doc.getElementsByTagName("img");
            let loadedImages = 0;

            const checkAllImagesLoaded = () => {
                if (loadedImages === imgs.length) {
                    iframeWindow.focus();
                    //iframeWindow.print(); // Imprimir pelo windows

                    const pdf = new jsPDF("p", "pt", "a4");
                    const marginX = 20;
                    const marginY = 20;
                    const pageWidth =
                        pdf.internal.pageSize.getWidth() - marginX * 2;
                    const pageHeight =
                        pdf.internal.pageSize.getHeight() - marginY * 2;
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

                    document.body.removeChild(iframe);
                }
            };

            if (imgs.length === 0) {
                iframeWindow.focus();
                document.body.removeChild(iframe);
            } else {
                for (let img of imgs) {
                    img.src = img.src.replace("low-res", "high-res");
                    loadedImages++;
                    checkAllImagesLoaded();
                }
            }
        };
    } else {
        console.error(
            `PDFGenerator: Element with ID '${elementId}' not found.`
        );
    }
};

export default contratoPDF;
