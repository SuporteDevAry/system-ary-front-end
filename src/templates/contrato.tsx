import { formatCurrency } from "../helpers/currencyFormat";
import { Extenso } from "../helpers/Extenso";
import { insertMaskInCnpj } from "../helpers/front-end/insertMaskInCnpj";
import logoContrato from "../assets/img/Logo_Ary_Completo.jpg";
import { formatDateWithLongMonth } from "../helpers/dateFormat";
import {
  parseQuantityToNumber,
  numberToQuantityString,
} from "../helpers/quantityFormat";

interface ContratoTemplateProps {
  formData: any;
  nomeArquivo: string;
  modeSave?: boolean;
}

const ContratoTemplate: React.FC<ContratoTemplateProps> = ({
  formData,
  modeSave,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear().toString().substr(-2);

  const quantityValue =
    typeof formData.quantity === "number"
      ? formData.quantity
      : parseQuantityToNumber(formData.quantity);

  const formattedQtd = numberToQuantityString(quantityValue);

  // montar extenso dependendo do tipo de quantidade
  let formattedExtenso = "";

  if (formData.type_quantity === "toneladas métricas") {
    // tratar como toneladas métricas: parte inteira = toneladas, parte decimal = quilos (3 casas decimais)
    const raw = String(formData.quantity)
      .trim()
      .replace(/\./g, "")
      .replace(/,/g, ".");
    const parts = raw.split(".");
    const inteiro = Number(parts[0]) || 0;
    const decimais = parts[1] ? parts[1].padEnd(3, "0").slice(0, 3) : ""; // gramas/quilos em 3 dígitos

    const toneladasText =
      inteiro > 0
        ? Extenso(inteiro, "F") +
          (inteiro === 1 ? " tonelada métrica" : " toneladas métricas")
        : "";
    const kilosFromDecimals = decimais ? Number(decimais) : 0;
    const kilosText =
      kilosFromDecimals > 0
        ? Extenso(kilosFromDecimals, "M") +
          (kilosFromDecimals === 1 ? " quilo" : " quilos")
        : "";

    const combined = [toneladasText, kilosText].filter(Boolean).join(" e ");
    formattedExtenso = combined ? `(${combined})` : "";
  } else {
    // tratar como quilos (masculino)
    const inteiro = Math.round(quantityValue);
    const ext = Extenso(inteiro, "M");
    formattedExtenso = `(${ext})`;
  }

  let formattedSellerCNPJ = formData.seller.cnpj_cpf
    ? insertMaskInCnpj(formData.seller.cnpj_cpf)
    : "";
  let formattedBuyerCNPJ = formData.buyer.cnpj_cpf
    ? insertMaskInCnpj(formData.buyer.cnpj_cpf)
    : "";

  let formattedCSeller = formData.commission_seller
    ? formData.type_commission_seller === "Percentual"
      ? `${formData.commission_seller}%`
      : `${formatCurrency(
          formData.commission_seller,
          formData.type_currency,
          true
        )} por saca,`
    : "";

  let formattedCBuyer = formData.commission_buyer
    ? formData.type_commission_buyer === "Percentual"
      ? `${formData.commission_buyer}%`
      : `${formatCurrency(
          formData.commission_buyer,
          formData.type_currency,
          true
        )} por saca,`
    : "";

  // Só iremos remover essa regra das siglas, caso o cliente aceite a sugestão da reunião do dia 09/04/2025
  const listProducts = ["O", "OC", "OA", "SB", "EP"];
  const validProducts = listProducts.includes(formData.product);
  const siglaProduct = validProducts ? "O" : formData.product;

  const numberContract = formData?.number_contract
    ? formData.number_contract
    : `${siglaProduct}.${formData.number_broker}-NNN/${currentYear}`;

  function formatObservationText(observation: string) {
    if (!observation) {
      return "";
    }

    const lines = observation.split("\n");
    const hasMultipleLines = lines.length > 1;

    const formattedLines = lines.map((line) => {
      // Trim para remover espaços em branco no início/fim da linha
      const trimmedLine = line.trim();

      // Se a linha começar com um número seguido de hífen...
      if (/^\d+-/.test(trimmedLine)) {
        // ... não adicione margem.
        return `<p style="margin-left: 0;">${line}</p>`;
      } else if (hasMultipleLines) {
        // ... caso contrário, se houver múltiplas linhas, adicione margem para indentar.
        return `<p style="margin-left: 20px;">${line}</p>`;
      } else {
        // ... se houver apenas uma linha, não adicione margem.
        return `<p>${line}</p>`;
      }
    });

    return formattedLines.join("");
  }
  const listProductsForMetricTon = ["O", "F", "OC", "OA", "SB", "EP"];
  const validProductsForMetricTon = listProductsForMetricTon.includes(
    formData.product
  );

  let formattedSafra = validProductsForMetricTon
    ? ` `
    : ` - Safra: ${formData.crop}`;

  let formattedMetrica =
    formData.type_quantity === "toneladas métricas" ? `.` : ` quilos.`;

  let Dot =
    formData.destination === "Nenhum" ||
    (formData.destination === "" &&
      formData.complement_destination?.length === 0)
      ? "."
      : ", ";

  let formattedPreco =
    formData.type_quantity === "toneladas métricas"
      ? ` por tonelada métrica${Dot}`
      : ` por saca de 60(sessenta) quilos${Dot}`;

  let formattedComplementSeller = formData.seller.complement
    ? `${" - "} ${formData.seller.complement} `
    : "";

  let formattedComplementBuyer = formData.buyer.complement
    ? `${" - "} ${formData.buyer.complement} `
    : "";

  return (
    <>
      <div id="contrato">
        <div style={{ margin: 0, textAlign: "center" }}>
          <img src={logoContrato} alt="logo ary completo jpg" width={330} />
        </div>
        <br />
        <h3>
          <p style={{ paddingLeft: "280px" }}>
            São Paulo,{" "}
            <span>
              {formatDateWithLongMonth(formData.contract_emission_date)}
            </span>
          </p>
          <p style={{ paddingLeft: "280px" }}>
            Confirmação de negociação
            <span> {numberContract} </span>
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
            <span style={{ paddingLeft: "50px" }}>{formData.seller.name}</span>
            <br></br>
            <span style={{ paddingLeft: "140px" }}>
              {formData.seller.address}
              {","}
              {formData.seller.number}
              {formattedComplementSeller}
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
            <span style={{ paddingLeft: "30px" }}>{formData.buyer.name}</span>
            <br></br>
            <span style={{ paddingLeft: "140px" }}>
              {formData.buyer.address}
              {","}
              {formData.buyer.number}
              {formattedComplementBuyer}
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
            <span>{formData.name_product}</span>
            <span>
              <strong>
                {/* {" - "}
                                Safra: <span>{formData.crop}</span> */}
                <span>{formattedSafra}</span>
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
            {formattedQtd} {formattedExtenso}{" "}
          </strong>
          {formattedMetrica}
        </p>
        <br />

        <p style={{ textAlign: "left" }}>
          <strong>Pre&ccedil;o:</strong>
        </p>
        <p style={{ textAlign: "justify" }}>
          <strong>
            {formData.type_currency === "Dólar"
              ? formatCurrency(
                  formData.price,
                  formData.type_currency,
                  modeSave
                ).replace("$", "US$ ")
              : formatCurrency(
                  formData.price,
                  formData.type_currency,
                  modeSave
                )}
          </strong>{" "}
          {/* por saca de 60(sessenta) quilos, */}
          {formattedPreco}
          {(formData.destination && formData.destination !== "Nenhum") ||
          formData.complement_destination ? (
            <span>
              <strong>
                (
                {[
                  formData.destination !== "Nenhum" ? formData.destination : "",
                  formData.complement_destination,
                ]
                  .filter(Boolean)
                  .join(" ")}
                )
              </strong>
              .
            </span>
          ) : null}
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
        <p style={{ textAlign: "justify" }}>{formData.payment}</p>
        <br />

        <p style={{ textAlign: "left" }}>
          <strong>{formData.type_pickup}:</strong>
        </p>
        <p style={{ textAlign: "justify" }}>{formData.pickup}</p>
        <br />

        <p style={{ textAlign: "left" }}>
          <strong>Local de {formData.type_pickup}:</strong>
        </p>
        <p style={{ textAlign: "justify" }}>{formData.pickup_location}</p>
        <br />

        <p style={{ textAlign: "left" }}>
          <strong>Conferência:</strong>
        </p>
        <p style={{ textAlign: "justify" }}>{formData.inspection}</p>
        <br />

        {formData.observation && (
          <p style={{ textAlign: "left" }}>
            <strong>Observações:</strong>
          </p>
        )}
        <p
          style={{ textAlign: "justify", whiteSpace: "pre-line" }}
          dangerouslySetInnerHTML={{
            __html: formatObservationText(formData.observation),
          }}
        />

        <br />

        <p style={{ textAlign: "justify" }}>
          <strong>
            "Favor comunicar qualquer discrepância em 01 (um) dia útil do
            recebimento da confirmação por escrito. Se não houver discrepâncias
            relatadas, presume-se que todas as partes envolvidas aceitam e
            concordam com todos os termos conforme descrito na confirmação de
            negócio acima."
          </strong>
        </p>
        <br />

        {formattedCSeller ? (
          <p style={{ textAlign: "justify" }}>
            <strong>===</strong>
            <br></br>

            <strong>
              Comissão de <span>{formattedCSeller.replace(".", ",")}</span>
              {"  "}
              por conta do vendedor.
            </strong>

            <br></br>
            <strong>===</strong>
          </p>
        ) : (
          ""
        )}

        {formattedCBuyer ? (
          <p style={{ textAlign: "justify" }}>
            <strong>===</strong>
            <br></br>
            <strong>
              Comissão de <span>{formattedCBuyer.replace(".", ",")}</span>
              {"  "}
              por conta do comprador.
            </strong>
            <br></br>
            <strong>===</strong>
          </p>
        ) : (
          ""
        )}

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
    </>
  );
};
export default ContratoTemplate;
