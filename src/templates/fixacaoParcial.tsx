import logoContrato from "../assets/img/Logo_Ary_Completo.jpg";
import { formatCurrency } from "../helpers/currencyFormat";
import { formatDateWithLongMonth } from "../helpers/dateFormat";
import { numberToQuantityString } from "../helpers/quantityFormat";
import { Extenso } from "../helpers/Extenso";
import { IFixationItem } from "../contexts/PriceFixationContractContext/types";

interface FixacaoParcialTemplateProps {
  item: IFixationItem;
  contract: {
    number_contract?: string;
    name_product: string;
    crop?: string;
    type_quantity?: string;
    contract_emission_date?: string;
    number_external_contract_buyer?: string;
    number_external_contract_seller?: string;
    seller: { name: string };
    buyer: { name: string };
  };
}

// Documento "Aditivo Contratual — Fixação de CBOT, Prêmio e Câmbio", que
// registra a fixação parcial de preço de um contrato "a fixar" contra uma
// referência de bolsa (CBOT), nos mesmos moldes do modelo usado pela Ary Oleofar.
const FixacaoParcialTemplate: React.FC<FixacaoParcialTemplateProps> = ({
  item,
  contract,
}) => {
  const today = new Date().toLocaleDateString("pt-BR");
  const isMetricTon = contract.type_quantity === "toneladas métricas";
  const unidade = isMetricTon ? "toneladas" : "quilos";

  const quantityValue = Number(item.quantity) || 0;
  const formattedQtd = numberToQuantityString(quantityValue);
  const formattedExtenso = `(${Extenso(Math.round(quantityValue), isMetricTon ? "F" : "M")})`;

  const externalContractRef =
    contract.number_external_contract_buyer ||
    contract.number_external_contract_seller;

  const sectionStyle: React.CSSProperties = { margin: "0 0 14px 0" };
  const labelCellStyle: React.CSSProperties = {
    width: "190px",
    padding: "3px 0",
    verticalAlign: "top",
  };
  const valueCellStyle: React.CSSProperties = { padding: "3px 0" };

  return (
    <div
      id="fixacao-parcial"
      style={{
        width: "700px",
        fontFamily: "Roboto, Arial, sans-serif",
        fontSize: "14px",
        lineHeight: 1.5,
        color: "#000",
      }}
    >
      <div style={{ margin: "0 0 16px 0", textAlign: "center" }}>
        <img src={logoContrato} alt="logo ary completo jpg" width={280} />
      </div>

      <p style={{ ...sectionStyle, textAlign: "center" }}>
        São Paulo, {formatDateWithLongMonth(today)}
      </p>

      <h3 style={{ ...sectionStyle, textAlign: "center" }}>
        ADITIVO CONTRATUAL
      </h3>

      <p style={{ ...sectionStyle, textAlign: "center" }}>
        Referente a Confirmação de venda nr. {contract.number_contract}
        <br />
        {contract.contract_emission_date
          ? `fechada em ${formatDateWithLongMonth(contract.contract_emission_date)}`
          : ""}
      </p>

      <p style={sectionStyle}>
        <strong>VENDEDOR :</strong> {contract.seller?.name}
      </p>

      <p style={sectionStyle}>
        <strong>COMPRADOR :</strong> {contract.buyer?.name}
      </p>

      <p style={sectionStyle}>
        <strong>Mercadoria :</strong> {contract.name_product}
        {contract.crop ? ` - Safra: ${contract.crop}` : ""}
      </p>

      <p style={{ ...sectionStyle, textAlign: "center" }}>
        <strong>FIXAÇÃO DE CBOT, PRÊMIO E CÂMBIO</strong>
      </p>

      <p style={{ margin: "0 0 4px 0" }}>
        <strong>{contract.name_product}</strong>
        {contract.crop ? ` ${contract.crop}` : ""}
      </p>
      <p style={{ margin: "0 0 4px 0" }}>
        Contratos = ARY: {contract.number_contract}
        {externalContractRef ? ` // ${externalContractRef}` : ""}
      </p>
      <p style={{ margin: "0 0 4px 0" }}>
        Quantidade: {formattedQtd} {formattedExtenso} {unidade}
      </p>
      <p style={{ margin: "0 0 4px 0" }}>
        CBOT: {item.cbot_code} = {Number(item.cbot_value ?? 0).toFixed(2)}
      </p>
      <p style={sectionStyle}>
        Câmbio Pagamento {item.exchange_rate_date} = {item.exchange_rate}
      </p>

      <p style={{ margin: "0 0 4px 0" }}>
        <strong>Memória de Cálculo:</strong>
      </p>
      <p style={{ margin: "0 0 4px 0" }}>
        <strong>{item.reference_month}</strong>
      </p>
      <table
        style={{ borderCollapse: "collapse", marginBottom: "14px" }}
      >
        <tbody>
          <tr>
            <td style={labelCellStyle}>CBOT</td>
            <td style={valueCellStyle}>
              {Number(item.cbot_value ?? 0).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style={labelCellStyle}>Prêmio</td>
            <td style={valueCellStyle}>
              {Number(item.premium ?? 0).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style={labelCellStyle}>Fator Conv (t/m)</td>
            <td style={valueCellStyle}>{item.conversion_factor}</td>
          </tr>
          <tr>
            <td style={labelCellStyle}>Fobbings/tm</td>
            <td style={valueCellStyle}>
              {Number(item.fobbings ?? 0).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style={labelCellStyle}>PPE (Preço Parid. Exp.)</td>
            <td style={valueCellStyle}>
              USD {Number(item.ppe_usd ?? 0).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style={{ ...labelCellStyle, paddingLeft: "24px" }}>SACA</td>
            <td style={valueCellStyle}>
              USD {Number(item.price_usd_per_saca ?? 0).toFixed(2)} x{" "}
              {item.exchange_rate} ={" "}
              {formatCurrency(String(item.price ?? 0), "Real")} p/ saca
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ ...sectionStyle, textAlign: "justify" }}>
        "Favor comunicar qualquer discrepância em 01 (um) dia útil do
        recebimento da confirmação por escrito. Se não houver discrepâncias
        relatadas, presume-se que todas as partes envolvidas aceitam e
        concordam com todos os termos conforme descrito na confirmação de
        negócio acima."
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "50px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div>______________________________</div>
          <strong>VENDEDOR</strong>
        </div>
        <div style={{ textAlign: "center" }}>
          <div>_____________________________</div>
          <strong>COMPRADOR</strong>
        </div>
      </div>
    </div>
  );
};

export default FixacaoParcialTemplate;
