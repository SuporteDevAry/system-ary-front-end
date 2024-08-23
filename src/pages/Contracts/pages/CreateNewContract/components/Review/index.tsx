import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { StepProps } from "../../types";
import CustomButton from "../../../../../../components/CustomButton";
import { Extenso } from "../../../../../../helpers/Extenso";

//import puppeteer from "puppeteer";

export const Review: React.FC<StepProps> = ({ formData }) => {
  const handleImprimir = () => {
    const elemento = document.getElementById("contrato");
    if (!elemento) {
      console.error("Elemento não encontrado.");
      return;
    }

    const htmlContent = elemento.innerHTML;

    // Estilos básicos para a impressão
    const estilo = `
        body, p, span {
            font-family: Roboto, sans-serif;
            font-weight: 400;
            font-size: 0.8rem;
            margin: 0;
            padding: 0;
        }
    `;

    // Cria um iframe para a impressão
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) {
      console.error("Falha ao acessar o contentWindow do iframe.");
      document.body.removeChild(iframe);
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

    // Espera que o conteúdo e os recursos estejam carregados
    iframe.onload = () => {
      iframeWindow.focus();
      iframeWindow.print();
      document.body.removeChild(iframe);
    };

    // Garante que o onload seja acionado se o iframe carregar imediatamente
    setTimeout(() => {
      if (iframeWindow.document.readyState === "complete") {
        iframeWindow.focus();
        iframeWindow.print();
        document.body.removeChild(iframe);
      }
    }, 1000);
  };

  const today = new Date();
  const ano = today.getFullYear();
  const mesextenso = today.toLocaleString("pt-BR", { month: "long" });
  const dia = today.toLocaleString("pt-BR", { day: "2-digit" });

  let quantity_aux = formData.quantity.replace(/[.,]/g, "");
  let int_qtd = parseInt(quantity_aux) * 1000; // Multiplicar por mil para exibir em quilos
  let formattedQtd = int_qtd.toLocaleString();
  let formattedObs = formData.observation; //.replace(/[". "]/g, "");

  const qtde_extenso = Extenso(int_qtd);
  let qtde_em_quilos =
    int_qtd <= 1000000
      ? `(${qtde_extenso}) quilos.`
      : `(${qtde_extenso}) de quilos.`;

  return (
    <>
      <div style={{ width: 900 }}>
        <div id="contrato">
          <div style={{ textAlign: "center" }}>
            <img
              src="/src/assets/img/logo-ary-contrato.jpeg"
              alt="logo ary contrato jpg"
              width={300}
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
                {formData.product}.{formData.numberBroker}
                .NNNNNN/{ano}{" "}
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
            <strong>Vendedor:</strong>
            <span style={{ paddingLeft: "10px" }}>{formData.seller.name}</span>
            <span style={{ paddingLeft: "10px" }}>
              {formData.seller.address}
            </span>
            <span style={{ paddingLeft: "10px" }}>
              {formData.seller.cnpjCpf}
            </span>
          </p>

          <p style={{ textAlign: "left" }}>
            <strong>Comprador:</strong>
            <span style={{ paddingLeft: "10px" }}>
              {formData.buyer?.cnpjCpf}
            </span>
            <span style={{ paddingLeft: "10px" }}>{formData.buyer.name}</span>
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
          <p style={{ textAlign: "justify" }}>{formData.quality}</p>
          <br />

          <p style={{ textAlign: "left" }}>
            <strong>Quantidade:</strong>
          </p>
          <p style={{ textAlign: "justify" }}>
            {formattedQtd} {qtde_em_quilos}
          </p>
          <br />

          <p style={{ textAlign: "left" }}>
            <strong>Pre&ccedil;o:</strong>
          </p>
          <p style={{ textAlign: "justify" }}>
            {formatCurrency(formData.price, formData.typeCurrency)} por sacas de
            60(sessenta) quilos, (+D.U.E.).
          </p>
          <br />

          <p style={{ textAlign: "left" }}>
            <strong>Icms:</strong>
          </p>
          <p style={{ textAlign: "justify" }}>{formData.icms}</p>
          <br />

          <p style={{ textAlign: "left" }}>
            <strong>Pagamento:</strong>
          </p>
          <p style={{ textAlign: "justify" }}>
            No dia {formData.payment} , via Banco ...., Ag. nr . ..... , c/c nr
            . ......, no CNPJ: <strong>{formData.seller.cnpjCpf}</strong> em
            nome de
            <strong>{formData.seller.name}</strong>.
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
          <p style={{ textAlign: "justify" }}>{formData.pickupLocation}</p>
          <br />

          <p style={{ textAlign: "left" }}>
            <strong>Confer&ecirc;ncia:</strong>
          </p>
          <p style={{ textAlign: "justify" }}>{formData.inspection}</p>
          <br />

          <p style={{ textAlign: "left" }}>
            <strong>Observa&ccedil;&otilde;es:</strong>
          </p>
          <p style={{ textAlign: "justify" }}>{formattedObs}</p>
          <br />

          <p style={{ textAlign: "justify" }}>
            <strong>
              "Favor comunicar qualquer discrepância em 01 (um) dia útil do
              recebimento da confirmação por escrito. Se não houver
              discrepâncias relatadas, presume-se que todas as partes envolvidas
              aceitam e concordam com todos os termos conforme descrito na
              confirmação de negócio acima."
            </strong>
          </p>
          <br />
          <br />

          <p style={{ textAlign: "justify" }}>
            <strong>
              === Comissão de <span>{formData.commissionSeller}</span> por conta
              do vendedor. ===
            </strong>
          </p>
          <p style={{ textAlign: "justify" }}>
            <strong>
              === Comissão de <span>{formData.commissionBuyer}</span> por conta
              do comprador. ===
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
                <strong>{formData.seller.name}</strong>
              </div>
              <div style={{ flex: "1" }}>
                <strong>{formData.buyer.name}</strong>
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
          <CustomButton onClick={handleImprimir} $variant={"primary"}>
            Imprimir
          </CustomButton>
        </div>
      </div>
    </>
  );
};
