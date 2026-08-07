import { FaFilePdf, FaChevronRight, FaChartLine } from "react-icons/fa";
import { IPriceFixationContractData } from "../../../../../../../../contexts/PriceFixationContractContext/types";
import { formatCurrency } from "../../../../../../../../helpers/currencyFormat";
import { numberToQuantityString } from "../../../../../../../../helpers/quantityFormat";
import { openFixationItemPdf } from "../../../../../../../../helpers/PDFGenerator/fixationItemPdf";
import { defaultTheme } from "../../../../../../../../styles/themes/default";
import { SCardInfo } from "../../styles";

interface FixationHistoryPanelProps {
  contract: IPriceFixationContractData;
}

const parseSeq = (numberContract?: string): number | null => {
  const match = numberContract?.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
};

export function FixationHistoryPanel({ contract }: FixationHistoryPanelProps) {
  const items = contract.fixation_items || [];
  const unidade =
    contract.type_quantity === "toneladas métricas" ? "TM" : "Kg";

  const handleOpenPdf = (item: (typeof items)[number]) => {
    openFixationItemPdf(item, contract);
  };

  return (
    <SCardInfo>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaChartLine color={defaultTheme["yellow-600"]} />
          <strong style={{ fontSize: "16px" }}>Fixações de Mercado</strong>
          <span
            style={{
              backgroundColor: defaultTheme["gray-100"],
              color: defaultTheme["gray-600"],
              borderRadius: "999px",
              padding: "1px 10px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {items.length}
          </span>
        </div>
        {items.length > 0 && (
          <span style={{ fontSize: "12px", color: defaultTheme["gray-400"] }}>
            Clique em uma fixação para visualizar o documento
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p>Nenhuma fixação registrada ainda.</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
              backgroundColor: defaultTheme["gray-100"],
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "12px",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: defaultTheme["gray-500"] }}>
                TOTAL FIXADO
              </div>
              <strong>
                {numberToQuantityString(contract.fixed_quantity || 0)}{" "}
                {unidade}
              </strong>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: defaultTheme["gray-500"] }}>
                PREÇO MÉDIO ({contract.type_quantity === "toneladas métricas" ? "TM" : "SACA"})
              </div>
              <strong>
                {contract.average_fixed_price
                  ? formatCurrency(String(contract.average_fixed_price), "Real")
                  : "A definir"}
              </strong>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: defaultTheme["gray-500"] }}>
                VALOR BRUTO
              </div>
              <strong style={{ color: defaultTheme["green-500"] }}>
                {contract.total_contract_value
                  ? formatCurrency(String(contract.total_contract_value), "Real")
                  : "A definir"}
              </strong>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: defaultTheme["gray-500"] }}>
                FIXAÇÕES REGISTRADAS
              </div>
              <strong style={{ color: defaultTheme["yellow-600"] }}>
                {items.length}
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {items.map((item, index) => {
              const seq = parseSeq(item.number_contract) ?? index + 1;
              return (
                <div
                  key={item.id || index}
                  onClick={() => handleOpenPdf(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${defaultTheme["gray-100"]}`,
                    cursor: "pointer",
                  }}
                >
                  <FaFilePdf size={22} color={defaultTheme["red-500"]} />
                  <div style={{ flex: 1 }}>
                    <div>
                      <strong>
                        Fixação Parcial Nº {String(seq).padStart(2, "0")} de{" "}
                        {String(items.length).padStart(2, "0")}
                      </strong>
                    </div>
                    <div style={{ fontSize: "12px", color: defaultTheme["gray-400"] }}>
                      {item.pdf_file_name || `${item.number_contract}.pdf`}
                      {item.pdf_file_size_kb ? ` • ${item.pdf_file_size_kb} KB` : ""}
                      {item.pdf_pages ? ` • ${item.pdf_pages} pág.` : ""}
                      {" • "}
                      {item.fixation_date}
                      {item.cbot_code ? ` • CBOT ${item.cbot_code}` : ""}
                      {item.reference_month ? ` (${item.reference_month})` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div>
                      <strong>{numberToQuantityString(item.quantity)} {unidade}</strong>
                    </div>
                    <div style={{ fontSize: "13px", color: defaultTheme["black-300"] }}>
                      {formatCurrency(String(item.price ?? 0), item.type_currency || "Real")}/
                      {contract.type_quantity === "toneladas métricas" ? "TM" : "saca"}
                    </div>
                  </div>
                  <FaChevronRight color={defaultTheme["gray-400"]} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </SCardInfo>
  );
}
