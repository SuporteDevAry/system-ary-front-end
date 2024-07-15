import { StepProps } from "../../types";
import CustomButton from "../../../../../../components/CustomButton";
import { Extenso } from "../../../../../../utils/Extenso";

export const Review: React.FC<StepProps> = ({ formData }) => {
    const handleImprimir = () => {
        const elemento = document.getElementById("contrato");
        const conteudo = elemento ? elemento.innerHTML : "";

        const win = window.open("", "_blank", "height=2480px, width=3508px");
        if (win && !win.closed) {
            const estilo = `
                <style>
                body {
                    font-family: 'Roboto', sans-serif;
                    font-weight: 400;
                    font-size: 0.6rem;
                    letter-spacing: .6px;
                }
                </style>
            `;

            win.document.open();
            win.document.write(`
                <html>
                  <head>
                    ${estilo}
                  </head>
                  <body>
                    ${conteudo}
                  </body>
                </html>
            `);

            win.print();
            win.close();

            win.onload = () => {
                const imgs = win.document.getElementsByTagName("img");
                for (let img of imgs) {
                    img.src = img.src; // força o recarregamento da imagem
                }
            };
        } else {
            console.error("Falha ao abrir a nova janela.");
        }
    };

    const today = new Date();
    const ano = today.getFullYear();
    const mesextenso = today.toLocaleString("pt-BR", { month: "long" });
    const dia = today.toLocaleString("pt-BR", { day: "2-digit" });

    let quantity_aux = formData.quantity.replace(/[.,]/g, "");
    let int_qtd = parseInt(quantity_aux);

    const qtde_extenso = Extenso(int_qtd);

    //const qtde_extenso = "Quinze milhões e quinhentos mil - exemplo";

    return (
        <>
            <div>
                <div id="contrato">
                    <div style={{ textAlign: "center" }}>
                        <img
                            src="/src/assets/img/logo-ary-contrato.jpeg"
                            alt="logo ary contrato jpg"
                        />
                    </div>
                    <br />
                    <h3>
                        <p style={{ textAlign: "center" }}>
                            S&atilde;o Paulo,{" "}
                            <span>
                                {" "}
                                {dia} de {mesextenso} de {ano}
                            </span>
                        </p>
                        <br />
                        <p style={{ textAlign: "center" }}>
                            Confirma&ccedil;&atilde;o de venda nr.
                            <span>
                                {" "}
                                {formData.product}.5.NNNNNN/{ano}{" "}
                            </span>
                            nesta data:
                        </p>
                    </h3>
                    <br />
                    <p
                        style={{
                            textAlign: "left",
                            margin: "0",
                        }}
                    >
                        <strong>VENDEDOR:</strong>
                        <span style={{ paddingLeft: "10px" }}>
                            {formData.seller}
                        </span>
                    </p>

                    <p style={{ textAlign: "left" }}>
                        <strong>COMPRADOR:</strong>
                        <span style={{ paddingLeft: "10px" }}>
                            {formData.buyer}
                        </span>
                    </p>
                    <br />
                    <p style={{ textAlign: "left", margin: "0" }}>
                        <strong>MERCADORIA:</strong>
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
                        <strong>QUALIDADE:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>{formData.quality}</p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>QUANTIDADE:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        {formData.quantity} ({qtde_extenso} quilos.)
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>PRE&Ccedil;O:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        R$ {formData.price.replace(".", ",")} por sacas de
                        60(sessenta) quilos, (+D.U.E.).
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>ICMS:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>{formData.icms}</p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>PAGAMENTO:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        No dia {formData.payment} , via Banco ...., Ag. nr .
                        ..... , c/c nr . ......, no CNPJ: &cnpj_vendedor em nome
                        de <strong>{formData.seller}</strong>.
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>ENTREGA:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        Até o dia {formData.pickup},limpo e seco sobre rodas.
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>LOCAL DE ENTREGA:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        No terminal de {formData.pickupLocation} em{" "}
                        {formData.pickup}.
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>CONFER&Ecirc;NCIA:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        {formData.inspection}
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>OBSERVA&Ccedil;&Otilde;ES:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        {formData.observation}
                    </p>
                    <br />

                    <p style={{ textAlign: "justify" }}>
                        <strong>
                            “Favor comunicar qualquer discrepância em 01 (um)
                            dia útil do recebimento da confirmação por escrito.
                            Se não houver discrepâncias relatadas, presume-se
                            que todas as partes envolvidas aceitam e concordam
                            com todos os termos conforme descrito na confirmação
                            de negócio acima.“
                        </strong>
                    </p>
                    <br />
                    <br />

                    <p style={{ textAlign: "justify" }}>
                        <strong>
                            === Comissão de <span>&perc_comissao</span> por
                            conta do vendedor. ===
                        </strong>
                    </p>
                    <br />
                    <br />
                    <br />

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
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
                            }}
                        >
                            <div style={{ flex: "1" }}>
                                <strong>{formData.seller}</strong>
                            </div>
                            <div style={{ flex: "1" }}>
                                <strong>{formData.buyer}</strong>
                            </div>
                        </div>
                    </div>
                    <br />
                    <br />
                    {/* <div style={{ flex: "1" }}>
                        <p style={{ textAlign: "center" }}>
                            Gerado automaticamente pelo sistema AryOleofar.
                        </p>
                    </div> */}
                </div>
                <div style={{ textAlign: "right" }}>
                    <CustomButton onClick={handleImprimir} variant={"primary"}>
                        Imprimir
                    </CustomButton>
                </div>
            </div>
        </>
    );
};
