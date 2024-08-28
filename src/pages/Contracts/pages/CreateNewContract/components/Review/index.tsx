import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { StepProps } from "../../types";
import CustomButton from "../../../../../../components/CustomButton";
import { Extenso } from "../../../../../../helpers/Extenso";
import jsPDF from "jspdf";
import { insertMaskInCnpj } from "../../../../../../helpers/front-end/insertMaskInCnpj";
import { useEffect } from "react";

export const Review: React.FC<StepProps> = ({ formData, updateFormData }) => {
    const geraPDF = () => {
        const contrato = document.getElementById("contrato");
        if (contrato) {
            var pdf = new jsPDF("p", "pt", "a4");

            const marginX = 20;
            const marginY = 20;
            const pageWidth = pdf.internal.pageSize.getWidth() - marginX * 2;
            const pageHeight = pdf.internal.pageSize.getHeight() - marginY * 2;
            const contratoWidth = contrato.offsetWidth;
            const contratoHeight = contrato.offsetHeight;
            const scaleX = pageWidth / contratoWidth;
            const scaleY = pageHeight / contratoHeight;
            const scale = Math.min(scaleX, scaleY);

            pdf.html(contrato, {
                callback: function (pdf) {
                    pdf.save("contratoPDF.pdf");
                },
                x: marginX,
                y: marginY,
                html2canvas: {
                    scale: scale,
                },
            });
        }
    };

    const handleImprimir = () => {
        const elemento = document.getElementById("contrato");
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
            console.error("Falha ao acessar o contentWindow do iframe.");
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
                    geraPDF(); // gerar arquivo PDF.
                    document.body.removeChild(iframe);
                }
            };

            if (imgs.length === 0) {
                iframeWindow.focus();
                //iframeWindow.print();
                //geraPDF();
                document.body.removeChild(iframe);
            } else {
                for (let img of imgs) {
                    img.src = img.src.replace("low-res", "high-res");
                    loadedImages++;
                    checkAllImagesLoaded();
                }
            }
        };
    };

    const today = new Date();
    const ano4 = today.getFullYear();
    const ano2 = today.getFullYear().toString().substr(-2);
    const mesextenso = today.toLocaleString("pt-BR", { month: "long" });
    const dia = today.toLocaleString("pt-BR", { day: "2-digit" });

    // se forem 1.000 toneladas   = 1.000.000 quilos
    // se foram 300,250 toneladas =   300.250 quilos

    let quantity_aux = !formData.quantity.match(/,/g)
        ? formData.quantity.replace(/[.]/g, "")
        : formData.quantity.replace(/[,]/g, ".");

    let qtd_informada = Number(quantity_aux) * 1000; // Multiplicar por mil para exibir em quilos
    let formattedQtd = qtd_informada.toLocaleString();

    console.log("qAux", quantity_aux);
    console.log("qinformada", qtd_informada);
    const qtde_extenso = Extenso(qtd_informada);
    let formattedExtenso = `(${qtde_extenso})`;

    let price = parseFloat(formData.price.replace(",", "."));
    let quantity_kg = qtd_informada;
    let quantity_bag = quantity_kg / 60;
    let total_contract_value = price * quantity_bag;
    Math.round(total_contract_value).toFixed(2);
    useEffect(() => {
        if (total_contract_value) {
            updateFormData?.({
                total_contract_value: total_contract_value,
                quantity_kg: quantity_kg,
                quantity_bag: quantity_bag,
            });
        }
    }, []);

    let formattedSellerCNPJ = formData.seller.cnpj_cpf
        ? insertMaskInCnpj(formData.seller.cnpj_cpf)
        : "";
    let formattedBuyerCNPJ = formData.buyer.cnpj_cpf
        ? insertMaskInCnpj(formData.buyer.cnpj_cpf)
        : "";

    let formattedCSeller = `${formData.commissionSeller}%`;

    function formatObservationText(observation: string) {
        // Quebra o texto em linhas usando o caractere de nova linha como delimitador
        const lines = observation.split("\n");

        // Mapeia as linhas, adicionando as margens de acordo
        return lines
            .map((line) => {
                // Verifica se a linha começa com um número seguido de um traço (número de item)
                if (/^\d+-/.test(line)) {
                    return `<span style="display:block; margin-left:0;">${line}</span>`;
                } else {
                    return `<span style="display:block; margin-left:15px;">${line}</span>`;
                }
            })
            .join("");
    }

    return (
        <>
            <div style={{ width: 900 }}>
                <div id="contrato">
                    <div style={{ margin: 0, textAlign: "center" }}>
                        <img
                            src="/src/assets/img/Logo_Ary_Completo.jpg"
                            alt="logo ary completo jpg"
                            width={330}
                        />
                    </div>
                    <br />
                    <h3>
                        <p style={{ paddingLeft: "280px" }}>
                            S&atilde;o Paulo,{" "}
                            <span>
                                {" "}
                                {dia} de {mesextenso} de {ano4}
                            </span>
                        </p>
                        <p style={{ paddingLeft: "280px" }}>
                            Confirma&ccedil;&atilde;o de venda nr.
                            <span>
                                {" "}
                                {formData.product}.{formData.numberBroker}
                                -NNN/{ano2}{" "}
                            </span>
                            fechada nesta data:
                        </p>
                    </h3>
                    <br />
                    <p
                        style={{
                            textAlign: "left",
                            margin: "0",
                        }}
                    >
                        <div>
                            <strong>VENDEDOR:</strong>
                            <span style={{ paddingLeft: "50px" }}>
                                {formData.seller.name}
                            </span>
                            <br></br>
                            <span style={{ paddingLeft: "140px" }}>
                                {formData.seller.address}
                                {","}
                                {formData.seller.number}
                                {" - "}
                                {formData.seller.district}
                            </span>
                            <br></br>
                            <span style={{ paddingLeft: "140px" }}>
                                <strong>
                                    {formData.seller.city}
                                    {" - "}
                                    {formData.seller.state}
                                </strong>
                            </span>
                            <br></br>
                            <span style={{ paddingLeft: "140px" }}>
                                CNPJ: {formattedSellerCNPJ}
                            </span>
                            <span style={{ paddingLeft: "30px" }}>
                                {"Inscr.Est.: "}
                                {formData.seller.ins_est}
                            </span>
                            <br></br>
                        </div>
                    </p>
                    <br></br>
                    <p
                        style={{
                            textAlign: "left",
                            margin: "0",
                        }}
                    >
                        <div>
                            <strong>COMPRADOR:</strong>
                            <span style={{ paddingLeft: "30px" }}>
                                {formData.buyer.name}
                            </span>
                            <br></br>
                            <span style={{ paddingLeft: "140px" }}>
                                {formData.buyer.address}
                                {","}
                                {formData.buyer.number}
                                {" - "}
                                {formData.buyer.district}
                            </span>
                            <br></br>
                            <span style={{ paddingLeft: "140px" }}>
                                <strong>
                                    {formData.buyer.city}
                                    {" - "}
                                    {formData.buyer.state}
                                </strong>
                            </span>
                            <br></br>
                            <span style={{ paddingLeft: "140px" }}>
                                CNPJ: {formattedBuyerCNPJ}
                            </span>
                            <span style={{ paddingLeft: "30px" }}>
                                {"Inscr.Est.: "}
                                {formData.buyer.ins_est}
                            </span>
                            <br></br>
                        </div>
                    </p>

                    <br />
                    <p style={{ textAlign: "left", margin: "0" }}>
                        <strong>Mercadoria:</strong>
                        <p style={{ textAlign: "left" }}>
                            <span>{formData.nameProduct}</span>
                            <span>
                                <strong>
                                    {" - "}
                                    Safra: <span>{formData.crop}</span>
                                </strong>
                            </span>
                        </p>
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>Qualidade:</strong>
                    </p>
                    <p style={{ textAlign: "left", whiteSpace: "pre-line" }}>
                        {formData.quality}
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>Quantidade:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        <strong>
                            {formattedQtd} {formattedExtenso}
                        </strong>{" "}
                        quilos.
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>Pre&ccedil;o:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        <strong>
                            {formatCurrency(
                                formData.price,
                                formData.typeCurrency
                            )}
                        </strong>{" "}
                        por sacas de 60(sessenta) quilos, (+D.U.E.).
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>ICMS:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>{formData.icms}</p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>Pagamento:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        {formData.payment}
                        {/* No dia {formData.payment} , via Banco ...., Ag. nr .
                        ..... , c/c nr . ......, no CNPJ:{" "}
                        <strong>{formData.seller.cnpjCpf}</strong> em nome de
                        <strong>{formData.seller.name}</strong>. */}
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>{formData.typePickup}:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>{formData.pickup}</p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>Local de {formData.typePickup}:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        {formData.pickupLocation}
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>Confer&ecirc;ncia:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        {formData.inspection}
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>Observa&ccedil;&otilde;es:</strong>
                    </p>
                    {/* <p style={{ textAlign: "justify", whiteSpace: "pre-line" }}>
                        {formData.observation}
                    </p> */}
                    <p
                        style={{ textAlign: "justify", whiteSpace: "pre-line" }}
                        dangerouslySetInnerHTML={{
                            __html: formatObservationText(formData.observation),
                        }}
                    />

                    <br />

                    <p style={{ textAlign: "justify" }}>
                        <strong>
                            "Favor comunicar qualquer discrepância em 01 (um)
                            dia útil do recebimento da confirmação por escrito.
                            Se não houver discrepâncias relatadas, presume-se
                            que todas as partes envolvidas aceitam e concordam
                            com todos os termos conforme descrito na confirmação
                            de negócio acima."
                        </strong>
                    </p>
                    <br />

                    <p style={{ textAlign: "justify" }}>
                        <strong>===</strong>
                        <br></br>
                        <strong>
                            Comissão de{" "}
                            <span>{formattedCSeller.replace(".", ",")}</span>{" "}
                            por conta do vendedor.
                        </strong>
                        <br></br>
                        <strong>===</strong>
                    </p>
                    {/* <p style={{ textAlign: "justify" }}>
                        <strong>
                            === Comissão de{" "}
                            <span>
                                {formData.commissionBuyer.replace(".", ",")}
                            </span>{" "}
                            por conta do comprador. ===
                        </strong>
                    </p> */}
                    <br />
                    <br />

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ flex: "1" }}>
                                ______________________________________
                            </div>
                            <div style={{ flex: "1" }}>
                                _____________________________________
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ flex: "1" }}>
                                <strong>VENDEDOR</strong>
                                {/* <strong>{formData.seller}</strong> */}
                            </div>
                            <div style={{ flex: "1" }}>
                                <strong>COMPRADOR</strong>
                                {/* <strong>{formData.buyer}</strong> */}
                            </div>
                        </div>
                    </div>
                    <br />
                    {/* <div style={{ flex: "1" }}>
                        <p style={{ textAlign: "center" }}>
                            Gerado automaticamente pelo sistema AryOleofar.
                        </p>
                    </div> */}
                </div>
                <div style={{ textAlign: "right" }}>
                    <CustomButton onClick={handleImprimir} $variant={"primary"}>
                        Gerar PDF
                    </CustomButton>
                </div>
            </div>
        </>
    );
};
