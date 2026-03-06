import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import {
  SContainer,
  SContainerSearchAndButton,
  SCustomTableWrapper,
  STitle,
} from "./styles";
import { IColumn } from "../../../../components/CustomTable/types";
import { toast } from "react-toastify";
import { BillingContext } from "../../../../contexts/BillingContext";
import { IBillingData } from "../../../../contexts/BillingContext/types";
import CustomButton from "../../../../components/CustomButton";

export function BillingsContract() {
  const billingContext = BillingContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listBillings, setListBillings] = useState<IBillingData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("payment_date");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await billingContext.listBillings();

      const formatted = response.data.map((item: any) => ({
        ...item,
        total_service_value: item.total_service_value
          ? Number(item.total_service_value).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })
          : "",
        irrf_value: item.irrf_value
          ? Number(item.irrf_value).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })
          : "",
        adjustment_value: item.adjustment_value
          ? Number(item.adjustment_value).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })
          : "",
        liquid_value: item.liquid_value
          ? Number(item.liquid_value).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })
          : "",
      }));

      setListBillings(formatted);
    } catch (error) {
      toast.error(`Erro ao tentar ler recebimentos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [billingContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const normalizeStr = (v?: string) => {
    if (!v) return "";
    return v
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/[^a-z0-9]/g, ""); // remove tudo que não seja letra ou número
  };

  const processedContracts = useMemo(() => {
    let processedData = [...listBillings];

    if (searchTerm) {
      const lowerSearchTerm = normalizeStr(searchTerm);

      processedData = processedData.filter((billing) => {
        const receiptDate = billing.receipt_date
          ? normalizeStr(billing.receipt_date)
          : "";

        const numberContract = billing.number_contract
          ? normalizeStr(billing.number_contract)
          : "";

        // busca tanto por data quanto por número de contrato
        return (
          receiptDate.includes(lowerSearchTerm) ||
          numberContract.includes(lowerSearchTerm)
        );
      });
    }

    processedData.sort((a, b) => {
      const parseDate = (d?: string) => {
        if (!d) return 0;
        const [day, month, year] = d.split("/").map(Number);
        return new Date(year, month - 1, day).getTime();
      };
      return order === "asc"
        ? parseDate(a.receipt_date) - parseDate(b.receipt_date)
        : parseDate(b.receipt_date) - parseDate(a.receipt_date);
    });
    return processedData;
  }, [listBillings, searchTerm, order]);

  const nameColumns: IColumn[] = useMemo(
    () => [
      {
        field: "number_contract",
        header: "Nº Contrato",
        headerTooltip: "Numero do Contrato",
        width: "150px",
      },
      {
        field: "receipt_date",
        header: "Dt.Recbto.",
        headerTooltip: "Data de Recebimento",
        width: "150px",
      },
      {
        field: "rps_number",
        header: "Nº RPS",
        headerTooltip: "Numero do RPS",
        width: "150px",
      },
      {
        field: "nfs_number",
        header: "Nº NF",
        headerTooltip: "Numero da Nota Fiscal",
        width: "150px",
      },
      {
        field: "total_service_value",
        header: "Vlr. Total",
        headerTooltip: "Valor Total",
        align: "right",
      },
      {
        field: "irrf_value",
        header: "Vlr.IR",
        headerTooltip: "Valor do IRRF",
        align: "right",
      },
      {
        field: "adjustment_value",
        header: "Valor Ajuste",
        align: "right",
      },
      { field: "liquid_value", header: "Valor Líquido", align: "right" },
      { field: "liquid_contract", header: "Liquidado" },
    ],
    [],
  );

  const handlePrint = (): void => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Quantidade de registros por página
    const pageSize = 30;

    const getValue = (row: any, field?: string) => {
      if (!field) return "";
      const parts = field.split(".");
      let value: any = row;
      for (const p of parts) {
        value = value?.[p];
        if (value === undefined || value === null) break;
      }
      return value ?? "";
    };

    const headerHtml = `<tr>
        ${nameColumns
          .map(
            (col) =>
              `<th style="border:1px solid black;padding:4px;font-size:9px;">${col.header}</th>`,
          )
          .join("")}
    </tr>`;

    const allRowsHtml = processedContracts.map((row) => {
      const cols = nameColumns
        .map((col) => {
          const raw = getValue(row, col.field);
          // escape simples
          const cell = String(raw ?? "")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          return `<td style="border:1px solid black;padding:4px;font-size:9px;">${cell}</td>`;
        })
        .join("");
      return `<tr>${cols}</tr>`;
    });

    printWindow.document.write(`
        <html>
            <head>
                <title>Recebimento do Contrato</title>
                <style>
                    @page { size: A4 portrait; margin: 10mm; }
                    body { font-family: Arial, sans-serif; margin: 0; padding: 10mm; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10mm; }
                    th, td { border: 1px solid black; padding: 4px; font-size: 9px; }
                    th { background-color: #f0f0f0; }
                    .page-break { page-break-after: always; }
                    h3 { text-align: left; margin: 0 0 8px 0; }
                    h2 { text-align: center; margin: 0 0 12px 0; }
                </style>
            </head>
            <body>
                <h3>Ary Oleofar</h3>
                <h2>Recebimento do Contrato</h2>
    `);
    for (let i = 0; i < allRowsHtml.length; i += pageSize) {
      const pageRows = allRowsHtml.slice(i, i + pageSize).join("");
      printWindow.document.write(`<table>`);
      printWindow.document.write(`<thead>${headerHtml}</thead>`);
      printWindow.document.write(`<tbody>${pageRows}</tbody>`);
      printWindow.document.write(`</table>`);

      if (i + pageSize < allRowsHtml.length) {
        printWindow.document.write(`<div class="page-break"></div>`);
      }
    }

    printWindow.document.write(`
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleExportCSV = () => {
    const headers = nameColumns
      .filter((col) => col.field)
      .map((col) => `"${col.header}"`)
      .join(";");

    const rows = processedContracts.map((row) => {
      return nameColumns
        .filter((col) => col.field)
        .map((col) => {
          const fields = col.field!.split(".");
          let value: any = row;
          for (const f of fields) {
            value = value?.[f];
          }
          return `"${value ?? ""}"`;
        })
        .join(";");
    });

    const BOM = "\uFEFF"; // UTF-8 BOM
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "recebimento-contrato.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <SContainer>
      <STitle>Recebimentos do Contrato</STitle>

      <SContainerSearchAndButton>
        <CustomSearch
          width="400px"
          placeholder="Digite Contrato ou Data"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <CustomButton $variant="success" width="150px" onClick={handlePrint}>
          Imprimir
        </CustomButton>

        <CustomButton
          $variant="success"
          width="150px"
          onClick={handleExportCSV}
        >
          Exportar CSV
        </CustomButton>
      </SContainerSearchAndButton>

      <SCustomTableWrapper>
        <CustomTable
          isLoading={isLoading}
          data={processedContracts}
          columns={nameColumns}
          hasPagination
          page={page}
          setPage={setPage}
          order={order}
          orderBy={orderBy}
          setOrder={setOrder}
          setOrderBy={setOrderBy}
        />
      </SCustomTableWrapper>
    </SContainer>
  );
}
