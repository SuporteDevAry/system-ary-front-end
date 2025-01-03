import { formatCurrency } from "../helpers/currencyFormat";
import { Extenso } from "../helpers/Extenso";
import { insertMaskInCnpj } from "../helpers/front-end/insertMaskInCnpj";
import { formatDateWithLongMonth } from "../helpers/dateFormat";
import { formatQuantity } from "../pages/Contracts/pages/CreateNewContract/components/Step3/hooks";
import logoContrato from "../assets/img/Logo_Ary_Completo.jpg";

interface ContratoTemplateProps {
  data: any;
  modeSave: boolean;
}

const ContratoTemplateSoja: React.FC<ContratoTemplateProps> = ({
  data,
  modeSave,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear().toString().substr(-2);

  // Verifique se data é válida e contém as propriedades necessárias
  if (!data || Object.keys(data).length === 0) {
    return <div>Erro: Dados do contrato não encontrados.</div>;
  }

  // Extraindo as propriedades necessárias de data
  const {
    seller,
    buyer,
    number_contract,
    product,
    number_broker,
    quantity,
    commission_seller,
    commission_buyer,
    quality,
    price,
    type_currency,
    complement_destination,
    destination,
    icms,
    payment,
    pickup,
    pickup_location,
    inspection,
    observation,
    crop,
    name_product,
    type_commission_seller,
    type_commission_buyer,
    type_pickup,
  } = data;

  // Lógica de formatação
  let quantity_aux = modeSave
    ? !quantity.match(/,/g)
      ? quantity.replace(/[.]/g, "")
      : quantity.replace(/[,]/g, ".")
    : quantity;

  let formattedQtd = formatQuantity(quantity_aux);
  const qtde_extenso = Extenso(quantity_aux);
  let formattedExtenso = `(${qtde_extenso})`;

  let formattedSellerCNPJ = seller?.cnpj_cpf
    ? insertMaskInCnpj(seller.cnpj_cpf)
    : "";
  let formattedBuyerCNPJ = buyer?.cnpj_cpf
    ? insertMaskInCnpj(buyer.cnpj_cpf)
    : "";

  let formattedCSeller = commission_seller
    ? type_commission_seller === "Percentual"
      ? `${commission_seller}%`
      : `${formatCurrency(commission_seller, type_currency, true)} por saca,`
    : "";

  let formattedCBuyer = commission_buyer
    ? type_commission_buyer === "Percentual"
      ? `${commission_buyer}%`
      : `${formatCurrency(commission_buyer, type_currency, true)} por saca,`
    : "";

  const numberContract = number_contract
    ? number_contract
    : `${product}.${number_broker}-NNN/${currentYear}`;

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

  return (
    <div id="contrato">
      <div style={{ margin: 0, textAlign: "center" }}>
        <img src={logoContrato} alt="logo Ary Completo" width={330} />
      </div>
      <br />
      <h3>
        <div style={{ paddingLeft: "280px" }}>
          São Paulo,{" "}
          <span>{formatDateWithLongMonth(data.contract_emission_date)}</span>
        </div>
        <div style={{ paddingLeft: "280px" }}>
          Confirmação de venda nr. <span> {numberContract} </span> fechada nesta
          data:
        </div>
      </h3>
      <br />
      <div style={{ textAlign: "left", margin: "0" }}>
        <strong>VENDEDOR:</strong>
        <span style={{ paddingLeft: "50px" }}>{seller.name}</span>
        <br />
        <span style={{ paddingLeft: "140px" }}>
          {seller.address}, {seller.number} - {seller.district}
        </span>
        <br />
        <span style={{ paddingLeft: "140px" }}>
          <strong>
            {seller.city} - {seller.state}
          </strong>
        </span>
        <br />
        <span style={{ paddingLeft: "140px" }}>
          CNPJ: {formattedSellerCNPJ}
        </span>
        <span style={{ paddingLeft: "30px" }}>
          Inscr.Est.: {seller.ins_est}
        </span>
        <br />
      </div>
      <br />
      <div style={{ textAlign: "left", margin: "0" }}>
        <strong>COMPRADOR:</strong>
        <span style={{ paddingLeft: "30px" }}>{buyer.name}</span>
        <br />
        <span style={{ paddingLeft: "140px" }}>
          {buyer.address}, {buyer.number} - {buyer.district}
        </span>
        <br />
        <span style={{ paddingLeft: "140px" }}>
          <strong>
            {buyer.city} - {buyer.state}
          </strong>
        </span>
        <br />
        <span style={{ paddingLeft: "140px" }}>CNPJ: {formattedBuyerCNPJ}</span>
        <span style={{ paddingLeft: "30px" }}>Inscr.Est.: {buyer.ins_est}</span>
        <br />
      </div>

      <br />
      <div style={{ textAlign: "left", margin: "0" }}>
        <strong>Mercadoria:</strong>
        <div style={{ textAlign: "left" }}>
          <span>{name_product}</span>
          <span>
            <strong>
              {" - "}
              Safra: <span>{crop}</span>
            </strong>
          </span>
        </div>
      </div>
      <br />

      <div style={{ textAlign: "left" }}>
        <strong>Qualidade:</strong>
      </div>
      <div style={{ textAlign: "left", whiteSpace: "pre-line" }}>{quality}</div>
      <br />

      <div style={{ textAlign: "left" }}>
        <strong>Quantidade:</strong>
      </div>
      <div style={{ textAlign: "justify" }}>
        <strong>
          {formattedQtd} {formattedExtenso}
        </strong>{" "}
        quilos.
      </div>
      <br />

      <div style={{ textAlign: "left" }}>
        <strong>Preço:</strong>
      </div>
      <div style={{ textAlign: "justify" }}>
        <strong>{formatCurrency(price, data.type_currency, modeSave)}</strong>{" "}
        por saca de 60(sessenta) quilos,{" "}
        <strong>
          (
          {complement_destination
            ? `${destination} ${complement_destination}`
            : destination}
          )
        </strong>
        .
      </div>
      <br />

      <div style={{ textAlign: "left" }}>
        <strong>ICMS:</strong>
      </div>
      <div style={{ textAlign: "justify" }}>{icms}</div>
      <br />

      <div style={{ textAlign: "left" }}>
        <strong>Pagamento:</strong>
      </div>
      <div style={{ textAlign: "justify" }}>{payment}</div>
      <br />

      <div style={{ textAlign: "left" }}>
        <strong>{type_pickup}:</strong>
      </div>
      <div style={{ textAlign: "justify" }}>{pickup}</div>
      <br />

      <div style={{ textAlign: "left" }}>
        <strong>Local de {type_pickup}:</strong>
      </div>
      <div style={{ textAlign: "justify" }}>{pickup_location}</div>
      <br />

      <div style={{ textAlign: "left" }}>
        <strong>Conferência:</strong>
      </div>
      <div style={{ textAlign: "justify" }}>{inspection}</div>
      <br />

      <div style={{ textAlign: "left" }}>
        <strong>Observações:</strong>
      </div>
      <div
        style={{ textAlign: "justify", whiteSpace: "pre-line" }}
        dangerouslySetInnerHTML={{
          __html: formatObservationText(observation),
        }}
      />
      <br />

      <div style={{ textAlign: "justify" }}>
        <strong>
          "Favor comunicar qualquer discrepância em 01 (um) dia útil do
          recebimento da confirmação por escrito. Se não houver discrepâncias
          relatadas, presume-se que todas as partes envolvidas aceitam e
          concordam com todos os termos conforme descrito na confirmação de
          negócio acima."
        </strong>
      </div>
      <br />

      {formattedCSeller ? (
        <div style={{ textAlign: "justify" }}>
          <strong>===</strong>
          <br />
          <strong>
            Comissão de <span>{formattedCSeller.replace(".", ",")}</span>
            {"  "}
            por conta do vendedor.
          </strong>
          <br />
          <strong>===</strong>
        </div>
      ) : (
        ""
      )}

      {formattedCBuyer ? (
        <div style={{ textAlign: "justify" }}>
          <strong>===</strong>
          <br />
          <strong>
            Comissão de <span>{formattedCBuyer.replace(".", ",")}</span>
            {"  "}
            por conta do comprador.
          </strong>
          <br />
          <strong>===</strong>
        </div>
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
          <div style={{ flex: "1" }}>_____________________________________</div>
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
          </div>
          <div style={{ flex: "1" }}>
            <strong>COMPRADOR</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContratoTemplateSoja;
