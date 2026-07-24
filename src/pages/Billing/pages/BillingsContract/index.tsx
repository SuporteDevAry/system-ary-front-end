import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { TbFilter, TbFilterOff } from "react-icons/tb";
import { TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import CustomTooltipLabel from "../../../../components/CustomTooltipLabel";
import {
    SContainer,
    SContainerSearchAndButton,
    SCustomTableWrapper,
    STitle,
} from "./styles";
import { BillingContext } from "../../../../contexts/BillingContext";
import { IBillingData } from "../../../../contexts/BillingContext/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { TableProductContext } from "../../../../contexts/TablesProducts";
import { ITableProductsData } from "../../../../contexts/TablesProducts/types";
import CustomButton from "../../../../components/CustomButton";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import { sortTableData } from "../../../../components/CustomTable/helpers";
import * as XLSX from "xlsx-js-style";

const toIsoDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
    ).padStart(2, "0")}`;

const normalizeStr = (value?: string) =>
    (value ?? "")
        .toString()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

const parseBrazilianDate = (dateString?: string) => {
    if (!dateString) return 0;

    const [day, month, year] = dateString.split("/").map(Number);
    if (!day || !month || !year) return 0;

    return new Date(year, month - 1, day).getTime();
};

const compareContractNumbers = (left?: string, right?: string) => {
    const a = (left ?? "").toString();
    const b = (right ?? "").toString();

    return a.localeCompare(b, "pt-BR", {
        numeric: true,
        sensitivity: "base",
    });
};

const INITIAL_ORDER_BY = "number_contract";
const INITIAL_ORDER: "asc" | "desc" = "desc";

export function BillingsContract() {
    const billingContext = BillingContext();
    const contractContext = ContractContext();
    const tableProductContext = TableProductContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [allBillings, setAllBillings] = useState<IBillingData[]>([]);
    const [allContracts, setAllContracts] = useState<IContractData[]>([]);
    const [tableProducts, setTableProducts] = useState<ITableProductsData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">(INITIAL_ORDER);
    const [orderBy, setOrderBy] = useState<string>(INITIAL_ORDER_BY);
    const [isSelectionModal, setSelectionModal] = useState<boolean>(false);
    const [useInfiniteScroll, setUseInfiniteScroll] = useState<boolean>(false);

    const getInitialSelectData = (): SelectState => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

        return {
            date_start: toIsoDate(firstDay),
            date_end: toIsoDate(today),
            number_contract: "",
            product_types: "",
        };
    };

    const [selectData, setSelectData] = useState<SelectState>(
        getInitialSelectData(),
    );

    const handleSelectionModal = () => setSelectionModal((prev) => !prev);
    const handleCloseModal = () => setSelectionModal(false);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [billingResponse, contractResponse, tablesResponse] =
                await Promise.all([
                    billingContext.listBillings(),
                    contractContext.listContracts(),
                    tableProductContext.listTableProducts(),
                ]);

            const formatted = billingResponse.data.map((item: any) => ({
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

            const contractsArray = Array.isArray(contractResponse.data)
                ? contractResponse.data
                : (contractResponse.data as any)?.data || [];

            setAllContracts(contractsArray);
            setTableProducts(tablesResponse?.data || []);
            setAllBillings(formatted);
        } catch (error) {
            toast.error(`Erro ao tentar ler recebimentos: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [billingContext, contractContext, tableProductContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const processedBillings = useMemo(() => {
        let processedData = [...allBillings];

        const startDate = selectData.date_start
            ? new Date(`${selectData.date_start}T00:00:00`)
            : null;
        const endDate = selectData.date_end
            ? new Date(`${selectData.date_end}T23:59:59`)
            : null;
        const contractFilter = normalizeStr(selectData.number_contract);
        const selectedProductTypes = Array.isArray(selectData.product_types)
            ? selectData.product_types
            : typeof selectData.product_types === "string" &&
                selectData.product_types
              ? [selectData.product_types]
              : [];

        const normalizeList = (values: string[]) =>
            values
                .map((value) => normalizeStr(value))
                .filter(Boolean)
                .sort()
                .join("|");

        const siglaToMesa = new Map<string, string>();
        tableProducts.forEach((mesa) => {
            (mesa.product_types || []).forEach((sigla) => {
                siglaToMesa.set(normalizeStr(sigla), mesa.name);
            });
        });

        const selectedMesaNames = selectedProductTypes.length
            ? tableProducts
                  .filter((mesa) => {
                      const mesaTypesKey = normalizeList(mesa.product_types || []);
                      const selectedTypesKey = normalizeList(selectedProductTypes);
                      return mesaTypesKey === selectedTypesKey;
                  })
                  .map((mesa) => normalizeStr(mesa.name))
            : tableProducts
                  .filter(
                      (mesa) =>
                          normalizeStr(mesa.name) === normalizeStr("GRÃOS"),
                  )
                  .map((mesa) => normalizeStr(mesa.name));

        if (searchTerm) {
            const lowerSearchTerm = normalizeStr(searchTerm);

            processedData = processedData.filter((billing) => {
                const receiptDate = normalizeStr(billing.receipt_date);
                const numberContract = normalizeStr(billing.number_contract);
                const productName = normalizeStr(billing.product_name);

                return (
                    receiptDate.includes(lowerSearchTerm) ||
                    numberContract.includes(lowerSearchTerm) ||
                    productName.includes(lowerSearchTerm)
                );
            });
        }

        processedData = processedData.filter((billing) => {
            if (!billing.receipt_date) return false;

            const receiptDateValue = parseBrazilianDate(billing.receipt_date);
            if (!receiptDateValue) return false;

            const matchStart = startDate ? receiptDateValue >= startDate.getTime() : true;
            const matchEnd = endDate ? receiptDateValue <= endDate.getTime() : true;

            const numberContract = normalizeStr(billing.number_contract);
            const contract = allContracts.find(
                (item) => item.number_contract === billing.number_contract,
            );
            const contractProduct = normalizeStr(contract?.product);
            const mesaName = normalizeStr(siglaToMesa.get(contractProduct));

            const matchContract =
                !contractFilter || numberContract.includes(contractFilter);
            const matchMesa =
                selectedMesaNames.length === 0 ||
                selectedMesaNames.includes(mesaName);

            return matchStart && matchEnd && matchContract && matchMesa;
        });

        processedData.sort((a, b) => {
            const contractCompare = compareContractNumbers(
                a.number_contract,
                b.number_contract,
            );

            if (contractCompare !== 0) {
                return contractCompare;
            }

            return parseBrazilianDate(b.receipt_date) - parseBrazilianDate(a.receipt_date);
        });

        return processedData;
    }, [allBillings, allContracts, searchTerm, selectData, tableProducts]);

    const initialSortedData = useMemo(() => {
        return [...processedBillings].sort((a, b) => {
            const contractCompare = compareContractNumbers(
                a.number_contract,
                b.number_contract,
            );

            if (contractCompare !== 0) {
                return contractCompare;
            }

            return parseBrazilianDate(b.receipt_date) - parseBrazilianDate(a.receipt_date);
        });
    }, [processedBillings]);

    const displayedData = useMemo(
        () => sortTableData(initialSortedData, orderBy, order),
        [initialSortedData, orderBy, order],
    );

    const fetchSelectData = useCallback(async (filters: SelectState) => {
        setSelectData(filters);
        setSelectionModal(false);
        setPage(0);
    }, []);

    const handleClearFilterModal = () => {
        const initial = getInitialSelectData();
        setSelectData(initial);
        setSelectionModal(false);
        setPage(0);
    };

    const isInitialFilter = useMemo(() => {
        const initial = getInitialSelectData();
        return (
            (selectData.date_start ?? "") === (initial.date_start ?? "") &&
            (selectData.date_end ?? "") === (initial.date_end ?? "") &&
            (selectData.number_contract ?? "").trim() === "" &&
            (!selectData.product_types ||
                (Array.isArray(selectData.product_types)
                    ? selectData.product_types.length === 0
                    : selectData.product_types === ""))
        );
    }, [selectData]);

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "number_contract",
                header: "Nº Contrato",
                headerTooltip: "Numero do Contrato",
                width: "150px",
                sortable: true,
            },
            {
                field: "receipt_date",
                header: "Dt.Recbto.",
                headerTooltip: "Data de Recebimento",
                width: "150px",
                sortable: true,
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

        const allRowsHtml = processedBillings.map((row) => {
            const cols = nameColumns
                .map((col) => {
                    const raw = getValue(row, col.field);
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
                <title>Contratos Recebidos</title>
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
                <h2>Contratos Recebidos</h2>
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

    const handleExportExcelStyled = () => {
        try {
            const formatIsoDateToBR = (iso?: string) => {
                if (!iso) return "";
                const [y, m, d] = iso.split("-").map(Number);
                if (!y || !m || !d) return "";
                return `${String(d).padStart(2, "0")}/${String(m).padStart(
                    2,
                    "0",
                )}/${y}`;
            };

            const exportRows = [
                ["Contratos Recebidos"],
                [
                    `Data: ${formatIsoDateToBR(selectData.date_start)} até ${formatIsoDateToBR(
                        selectData.date_end,
                    )}`,
                ],
                [],
                nameColumns.map((col) => col.header),
                ...displayedData.map((row) =>
                    nameColumns.map((col) => {
                        const value = (row as any)[col.field];
                        if (
                            col.field === "receipt_date" ||
                            col.field === "number_contract"
                        ) {
                            return value ?? "";
                        }

                        if (
                            col.field === "total_service_value" ||
                            col.field === "irrf_value" ||
                            col.field === "adjustment_value" ||
                            col.field === "liquid_value"
                        ) {
                            const numericValue = Number(
                                String(value ?? "0")
                                    .replace(/\./g, "")
                                    .replace(",", "."),
                            );
                            return Number.isNaN(numericValue) ? 0 : numericValue;
                        }

                        return value ?? "";
                    }),
                ),
            ];

            const worksheet = XLSX.utils.aoa_to_sheet(exportRows);
            const columnCount = nameColumns.length;

            worksheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: columnCount - 1 } },
            ];

            worksheet["!cols"] = nameColumns.map((col) => ({
                wch: Math.max(
                    12,
                    Math.round(Number.parseInt(col.width || "120", 10) / 8),
                ),
            }));

            const titleStyle = {
                font: { bold: true, sz: 14, color: { rgb: "1F1F1F" } },
                fill: { patternType: "solid", fgColor: { rgb: "E7B10A" } },
                alignment: { horizontal: "center", vertical: "center" },
            };

            const periodStyle = {
                font: { bold: true, sz: 11, color: { rgb: "1F1F1F" } },
                fill: { patternType: "solid", fgColor: { rgb: "E7B10A" } },
                alignment: { horizontal: "center", vertical: "center" },
            };

            const headerStyle = {
                font: { bold: true, color: { rgb: "1F1F1F" } },
                fill: { patternType: "solid", fgColor: { rgb: "E7B10A" } },
                border: {
                    top: { style: "thin", color: { rgb: "FFFFFF" } },
                    bottom: { style: "thin", color: { rgb: "FFFFFF" } },
                    left: { style: "thin", color: { rgb: "FFFFFF" } },
                    right: { style: "thin", color: { rgb: "FFFFFF" } },
                },
                alignment: { horizontal: "center", vertical: "center" },
            };

            const textStyle = {
                alignment: { horizontal: "left", vertical: "center" },
            };

            const numberStyle = {
                numFmt: "#,##0.00",
                alignment: { horizontal: "right", vertical: "center" },
            };

            const applyStyle = (cellRef: string, style: any) => {
                if (worksheet[cellRef]) {
                    worksheet[cellRef].s = style;
                }
            };

            for (let col = 0; col < columnCount; col += 1) {
                applyStyle(
                    XLSX.utils.encode_cell({ r: 0, c: col }),
                    titleStyle,
                );
                applyStyle(
                    XLSX.utils.encode_cell({ r: 1, c: col }),
                    periodStyle,
                );
                applyStyle(
                    XLSX.utils.encode_cell({ r: 3, c: col }),
                    headerStyle,
                );
            }

            for (let row = 4; row < exportRows.length; row += 1) {
                for (let col = 0; col < columnCount; col += 1) {
                    const field = nameColumns[col].field;
                    const style =
                        field === "total_service_value" ||
                        field === "irrf_value" ||
                        field === "adjustment_value" ||
                        field === "liquid_value"
                            ? numberStyle
                            : textStyle;

                    applyStyle(
                        XLSX.utils.encode_cell({ r: row, c: col }),
                        style,
                    );
                }
            }

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Contratos Recebidos");
            XLSX.writeFile(workbook, "contratos-recebidos.xlsx", {
                bookType: "xlsx",
            });
        } catch (error) {
            toast.error(`Erro ao exportar Excel: ${error}`);
        }
    };

    const handleExportExcel = () => {
        handleExportExcelStyled();
    };

    return (
        <SContainer>
            <STitle>Contratos Recebidos</STitle>

            <SContainerSearchAndButton>
                <CustomSearch
                    width="400px"
                    placeholder="Digite Contrato ou Data"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Tooltip title="Filtrar contratos">
                    <IconButton
                        aria-label="filter"
                        onClick={handleSelectionModal}
                        sx={{ color: "#E7B10A" }}
                    >
                        <TbFilter />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Limpar filtros">
                    <span>
                        <IconButton
                            aria-label="clearfilter"
                            onClick={handleClearFilterModal}
                            sx={{ color: "#E7B10A" }}
                            disabled={isInitialFilter}
                        >
                            <TbFilterOff />
                        </IconButton>
                    </span>
                </Tooltip>

                <ReportFilter
                    titleText="Filtros - Contratos Recebidos"
                    open={isSelectionModal}
                    initialFilters={selectData}
                    onClose={handleCloseModal}
                    onChange={(filters) => setSelectData(filters)}
                    onConfirm={fetchSelectData}
                    visibleFields={[
                        "date_start",
                        "date_end",
                        "number_contract",
                        "product_types",
                    ]}
                    defaultMesaName="GRÃOS"
                />

                <CustomButton
                    $variant="success"
                    width="150px"
                    onClick={handlePrint}
                >
                    Imprimir
                </CustomButton>

                <CustomButton
                    $variant="success"
                    width="150px"
                    onClick={handleExportExcel}
                >
                    Excel
                </CustomButton>

                <CustomTooltipLabel
                    title={
                        useInfiniteScroll
                            ? "Voltar para paginação"
                            : "Ativar scroll infinito"
                    }
                >
                    <IconButton
                        onClick={() => setUseInfiniteScroll((prev) => !prev)}
                        sx={{ color: "#E7B10A" }}
                    >
                        {!useInfiniteScroll ? <TbInfinity /> : <PiScroll />}
                    </IconButton>
                </CustomTooltipLabel>
            </SContainerSearchAndButton>

            <SCustomTableWrapper>
                <CustomTable
                    isLoading={isLoading}
                    data={displayedData}
                    columns={nameColumns}
                    hasInfiniteScroll={!useInfiniteScroll}
                    hasPagination={useInfiniteScroll}
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
