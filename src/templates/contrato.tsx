import { formatCurrency } from "../helpers/currencyFormat";
import { Extenso } from "../helpers/Extenso";
import { insertMaskInCnpj } from "../helpers/front-end/insertMaskInCnpj";
import logoContrato from "../assets/img/Logo_Ary_Completo.jpg";
import { formatDateWithLongMonth } from "../helpers/dateFormat";
import { formatQuantity } from "../pages/Contracts/pages/CreateNewContract/components/Step3/hooks";

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

  let quantity_aux = modeSave
    ? !formData.quantity.match(/,/g)
      ? formData.quantity.replace(/[.]/g, "")
      : formData.quantity.replace(/[,]/g, ".")
    : formData.quantity;

  let formattedQtd = formatQuantity(quantity_aux);

  const qtde_extenso = Extenso(quantity_aux);
  let formattedExtenso = `(${qtde_extenso})`;

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
    const lines = observation.split("\n");
    return lines
      .map((line) => {
        if (/^\d+-/.test(line)) {
          return `<span style="display:block; margin-left:0;">${line}</span>`;
        } else {
          return `<span style="display:block; margin-left:15px;">${line}</span>`;
        }
      })
      .join("");
  }

  const listProductsForMetricTon = ["O", "F", "OC", "OA", "SB", "EP"];
  const validProductsForMetricTon = listProductsForMetricTon.includes(
    formData.product
  );

  let formattedSafra = validProductsForMetricTon
    ? ` `
    : ` - Safra: ${formData.crop}`;

  let formattedMetrica =
    formData.type_quantity === "toneladas métricas"
      ? ` toneladas métricas.`
      : ` quilos.`;

  let Dot =
    formData.destination === "Nenhum" &&
    formData.complement_destination?.length === 0
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
          {/* Remover codigo depois de aprovado */}
          {/* {formData.destination && (
            <span>
              <strong>
                (
                {formData.complement_destination
                  ? `${formData.destination} ${formData.complement_destination}`
                  : formData.destination}
                )
              </strong>
              .
            </span>
          )} */}
          {(formData.destination !== "Nenhum" ||
            formData.complement_destination) && (
            <span>
              <strong>
                (
                {formData.destination === "Nenhum"
                  ? formData.complement_destination || ""
                  : `${formData.destination}${
                      formData.complement_destination
                        ? ` ${formData.complement_destination}`
                        : ""
                    }`}
                )
              </strong>
              .
            </span>
          )}
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
