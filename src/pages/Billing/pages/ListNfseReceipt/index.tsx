import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { TbFilter, TbFilterOff } from "react-icons/tb";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import CustomButton from "../../../../components/CustomButton";
import useTableSearch from "../../../../hooks/useTableSearch";
import { InvoiceContext } from "../../../../contexts/InvoiceContext";
import { IListInvoices } from "../../../../contexts/InvoiceContext/types";
import { BillingContext } from "../../../../contexts/BillingContext";
import { IBillingData } from "../../../../contexts/BillingContext/types";
import { sortTableData } from "../../../../components/CustomTable/helpers";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import * as XLSX from "xlsx-js-style";

type IListagemNfseRecebidaRow = IListInvoices & {
    billing_rps_number?: string;
    rps_number_has_diff?: boolean;
    has_receipt_record?: boolean;
    receipt_status_label?: string;
};

const DATE_FIELDS = [
    "nfs_emission_date",
    "rps_emission_date",
];
const CURRENCY_FIELDS = [
    "service_value",
    "irrf_value",
    "service_liquid_value",
];

const normalizeStr = (value?: string | number | null) =>
    (value ?? "")
        .toString()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const normalizeForCompare = (value?: string | number | null) =>
    normalizeStr(value).toUpperCase();

const parseYMD = (iso?: string) => {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
};

const onlyDate = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

const formatDateBR = (value?: string) => {
    if (!value) return "";
    const raw = String(value).trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;

    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        const [, year, month, day] = isoMatch;
        return `${day}/${month}/${year}`;
    }

    return raw;
};

const parseLocaleNumber = (value: number | string | null | undefined) => {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value !== "string") {
        return 0;
    }

    const trimmed = value.trim();
    if (!trimmed) return 0;

    const normalized = trimmed.includes(",")
        ? trimmed.replace(/\./g, "").replace(",", ".")
        : trimmed;

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getInvoiceNfsEmissionDate = (invoice: IListInvoices) => {
    return (invoice.nfs_emission_date as string | undefined) || "";
};

const getInvoiceStatus = (invoice: IListInvoices) =>
    normalizeForCompare(invoice.status);

export function ListNfseReceipt() {
    const invoiceContext = InvoiceContext();
    const billingContext = BillingContext();
    const [isLoading, setIsLoading] = useState(true);
    const [allInvoices, setAllInvoices] = useState<IListagemNfseRecebidaRow[]>(
        [],
    );
    const [listInvoices, setListInvoices] = useState<
        IListagemNfseRecebidaRow[]
    >([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("nfs_emission_date");
    const [isSelectionModal, setSelectionModal] = useState(false);
    const [receiptType, setReceiptType] = useState<"Recebida" | "Não Recebida">(
        "Recebida",
    );

    const getInitialSelectData = (): SelectState => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

        const fmt = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate(),
            ).padStart(2, "0")}`;

        return {
            date_start: fmt(firstDay),
            date_end: fmt(today),
        };
    };

    const [selectData, setSelectData] = useState<SelectState>(
        getInitialSelectData(),
    );

    const handleSelectionModal = () => setSelectionModal((prev) => !prev);
    const handleCloseModal = () => setSelectionModal(false);

    const buildComparisonMap = useCallback((billings: IBillingData[]) => {
        const map = new Map<string, IBillingData[]>();

        billings.forEach((billing) => {
            const nfsNumber = normalizeForCompare(billing.nfs_number);
            if (!nfsNumber) {
                return;
            }

            const current = map.get(nfsNumber) || [];
            current.push(billing);
            map.set(nfsNumber, current);
        });

        return map;
    }, []);

    const filterInvoicesByDate = useCallback(
        (invoices: IListagemNfseRecebidaRow[], filters: SelectState) => {
            const startDate = parseYMD(filters.date_start);
            const endDate = parseYMD(filters.date_end);
            const sDate = startDate ? onlyDate(startDate) : null;
            const eDate = endDate ? onlyDate(endDate) : null;

            return invoices.filter((invoice) => {
                const invoiceDate = getInvoiceNfsEmissionDate(invoice);
                if (!invoiceDate) return false;

                const normalizedDate = formatDateBR(invoiceDate);
                const [day, month, year] = normalizedDate.split("/").map(Number);
                if (!day || !month || !year) return false;

                const currentDate = onlyDate(new Date(year, month - 1, day));
                const matchStart = sDate ? currentDate >= sDate : true;
                const matchEnd = eDate ? currentDate <= eDate : true;

                return matchStart && matchEnd;
            });
        },
        [],
    );

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);

            const [invoiceResponse, billingResponse] = await Promise.all([
                invoiceContext.listInvoices(),
                billingContext.listBillings(),
            ]);

            const comparisonMap = buildComparisonMap(
                (billingResponse.data || []) as IBillingData[],
            );

            const receivedInvoices = (invoiceResponse.data || [])
                .filter((invoice: IListInvoices) => {
                    return (
                        getInvoiceStatus(invoice) === "EMITIDA" &&
                        normalizeForCompare(invoice.exportacao) !== "SIM"
                    );
                })
                .map((invoice: IListInvoices) => {
                    const invoiceNfsNumber = normalizeForCompare(
                        invoice.nfs_number,
                    );
                    const invoiceRpsNumber = normalizeForCompare(
                        invoice.rps_number,
                    );
                    const billingMatches = invoiceNfsNumber
                        ? comparisonMap.get(invoiceNfsNumber) || []
                        : [];
                    const matchedBilling =
                        billingMatches.find(
                            (billing) =>
                                normalizeForCompare(billing.rps_number) ===
                                invoiceRpsNumber,
                        ) || billingMatches[0];
                    const billingRpsNumber = matchedBilling?.rps_number ?? "";
                    const numberContract =
                        matchedBilling?.number_contract ??
                        (invoice as any)?.number_contract ??
                        "";
                    const billingRpsNormalized = normalizeForCompare(
                        billingRpsNumber,
                    );
                    const hasReceiptRecord = billingMatches.length > 0;
                    const invoiceEmissionDate = getInvoiceNfsEmissionDate(invoice);

                    return {
                        ...invoice,
                        number_contract: numberContract,
                        nfs_emission_date: invoiceEmissionDate,
                        billing_rps_number: billingRpsNumber,
                        has_receipt_record: hasReceiptRecord,
                        receipt_status_label: hasReceiptRecord
                            ? "Recebida"
                            : "Não Recebida",
                        rps_number_has_diff:
                            Boolean(invoiceRpsNumber) &&
                            Boolean(billingRpsNormalized) &&
                            invoiceRpsNumber !== billingRpsNormalized,
                    };
                })
                .filter((invoice: IListagemNfseRecebidaRow) =>
                    Boolean(normalizeForCompare(invoice.nfs_number)),
                );

            setAllInvoices(receivedInvoices);
            setListInvoices(
                filterInvoicesByDate(receivedInvoices, getInitialSelectData()),
            );
        } catch (error) {
            toast.error(`Erro ao tentar ler invoices recebidas: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [
        billingContext,
        buildComparisonMap,
        filterInvoicesByDate,
        invoiceContext,
    ]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchSelectData = useCallback(
        (filters: SelectState, showToast = true) => {
            try {
                setIsLoading(true);

                const filteredByDate = filterInvoicesByDate(allInvoices, filters);
                const filtered = filteredByDate.filter((invoice) =>
                    receiptType === "Recebida"
                        ? Boolean(invoice.has_receipt_record)
                        : !invoice.has_receipt_record,
                );

                setSelectData(filters);
                setListInvoices(filteredByDate);

                if (showToast) {
                    const receiptLabel =
                        receiptType === "Recebida"
                            ? "recebida(s)"
                            : "não recebida(s)";
                    if (filtered.length > 0) {
                        toast.success(
                            `${filtered.length} NFSe(s) ${receiptLabel} encontrada(s)`,
                            {
                                toastId: "listagem-nfse-recebida-filter",
                            },
                        );
                    } else {
                        toast.info(
                            `Nenhuma NFSe ${receiptLabel} encontrada`,
                            {
                                toastId: "listagem-nfse-recebida-filter",
                            },
                        );
                    }
                }

                setSelectionModal(false);
            } catch (error) {
                if (showToast) {
                    toast.error(`Erro ao aplicar filtros: ${error}`);
                }
        } finally {
            setIsLoading(false);
        }
    },
        [allInvoices, filterInvoicesByDate, receiptType],
    );

    const handleClearFilterModal = () => {
        const initialFilters = getInitialSelectData();
        setSelectData(initialFilters);
        fetchSelectData(initialFilters, false);
        setSelectionModal(false);
    };

    const isInitialFilter = useMemo(() => {
        const initial = getInitialSelectData();
        return (
            (selectData.date_start ?? "") === (initial.date_start ?? "") &&
            (selectData.date_end ?? "") === (initial.date_end ?? "")
        );
    }, [selectData]);

    const receiptFilteredInvoices = useMemo(() => {
        return listInvoices.filter((invoice) =>
            receiptType === "Recebida"
                ? Boolean(invoice.has_receipt_record)
                : !invoice.has_receipt_record,
        );
    }, [listInvoices, receiptType]);

    const getCountByReceiptType = useCallback(
        (
            invoices: IListagemNfseRecebidaRow[],
            type: "Recebida" | "Não Recebida",
        ) => {
            return invoices.filter((invoice) =>
                type === "Recebida"
                    ? Boolean(invoice.has_receipt_record)
                    : !invoice.has_receipt_record,
            ).length;
        },
        [],
    );

    const { filteredData } = useTableSearch({
        data: receiptFilteredInvoices,
        searchTerm,
        searchableFields: [
            "number_contract",
            "nfs_number",
            "rps_number",
        ],
    });

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "number_contract",
                header: "Contrato",
                width: "150px",
                sortable: true,
            },
            {
                field: "nfs_number",
                header: "NFS",
                width: "120px",
                sortable: true,
            },
            {
                field: "receipt_status_label",
                header: "Situação",
                width: "140px",
                sortable: true,
            },
            {
                field: "rps_number",
                header: "RPS",
                width: "120px",
                sortable: true,
                renderCell: (row) =>
                    `${row.rps_number ?? ""}${row.rps_number_has_diff ? "*" : ""}`,
            },
            {
                field: "nfs_emission_date",
                header: "Dt. NFS",
                width: "120px",
                sortable: true,
            },
            {
                field: "service_value",
                header: "Valor Serviço",
                width: "140px",
                sortable: true,
                renderCell: (row) => (
                    <div style={{ width: "100%", textAlign: "right" }}>
                        {Number(
                            parseLocaleNumber(row.service_value),
                        ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </div>
                ),
            },
            {
                field: "irrf_value",
                header: "IRRF",
                width: "120px",
                sortable: true,
                renderCell: (row) => (
                    <div style={{ width: "100%", textAlign: "right" }}>
                        {Number(parseLocaleNumber(row.irrf_value)).toLocaleString(
                            "pt-BR",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            },
                        )}
                    </div>
                ),
            },
            {
                field: "service_liquid_value",
                header: "Valor Líquido",
                width: "140px",
                sortable: true,
                renderCell: (row) => (
                    <div style={{ width: "100%", textAlign: "right" }}>
                        {Number(
                            parseLocaleNumber(row.service_liquid_value),
                        ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </div>
                ),
            },
        ],
        [],
    );

    const displayedData = useMemo(
        () => sortTableData([...filteredData], orderBy, order),
        [filteredData, orderBy, order],
    );

    const pageTitle =
        receiptType === "Recebida"
            ? "Listagem de NFSe Recebida"
            : "Listagem de NFSe Não Recebida";

    const buildReportTitle = () => pageTitle;

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageSize = 25;
        const startDate = formatDateBR(selectData.date_start);
        const endDate = formatDateBR(selectData.date_end);
        const reportTitle = `${buildReportTitle()} - ${startDate} até ${endDate}`;
        const reportPeriod = `Data: ${startDate} até ${endDate}`;

        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        @page { size: A4 landscape; margin: 10mm; }
                        body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #1f1f1f; }
                        h3, h4 { margin: 0; }
                        h3 { text-align: left; font-size: 12px; }
                        h4 { text-align: center; margin-bottom: 2px; font-size: 10px; }
                        .report-period { text-align: center; font-size: 9px; margin: 0 0 8px 0; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 4px; table-layout: fixed; }
                        th, td { border: 1px solid #c8c8c8; padding: 2px 3px; font-size: 7px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.05; }
                        th { background: #e7b10a; color: #1f1f1f; font-weight: bold; text-align: center; }
                        td { text-align: left; }
                        .page-break { page-break-after: always; }
                        .print-header { margin-bottom: 6px; }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                        <h3>Ary Oleofar</h3>
                        <h4>${reportTitle}</h4>
                        <div class="report-period">${reportPeriod}</div>
                    </div>
        `);

        for (let i = 0; i < displayedData.length; i += pageSize) {
            const pageRows = displayedData.slice(i, i + pageSize);

            printWindow.document.write(`<table><thead><tr>`);
            nameColumns.forEach((col) => {
                printWindow.document.write(
                    `<th style="width: ${col.width};">${col.header}</th>`,
                );
            });
            printWindow.document.write(`</tr></thead><tbody>`);

            pageRows.forEach((row) => {
                printWindow.document.write(`<tr>`);
                nameColumns.forEach((col) => {
                    let value: any = row[col.field];
                    const isCurrencyField = CURRENCY_FIELDS.includes(col.field);
                    if (col.field === "rps_number" && row.rps_number_has_diff) {
                        value = `${value ?? ""}*`;
                    } else if (DATE_FIELDS.includes(col.field)) {
                        value = formatDateBR(value) || "-";
                    } else if (isCurrencyField) {
                        const num = parseLocaleNumber(value);
                        value = num.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });
                    }
                    printWindow.document.write(
                        `<td style="${
                            isCurrencyField ? "text-align:right;" : ""
                        }">${value ?? ""}</td>`,
                    );
                });
                printWindow.document.write(`</tr>`);
            });

            printWindow.document.write(`</tbody></table>`);
            if (i + pageSize < displayedData.length) {
                printWindow.document.write(`<div class="page-break"></div>`);
            }
        }

        printWindow.document.write(`
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };

    const handleExportExcel = () => {
        try {
            const startDate = formatDateBR(selectData.date_start);
            const endDate = formatDateBR(selectData.date_end);

            const exportRows = [
                [buildReportTitle()],
                [`Data: ${startDate} até ${endDate}`],
                [],
                nameColumns.map((col) => col.header),
                ...displayedData.map((row) =>
                    nameColumns.map((col) => {
                        if (col.field === "rps_number" && row.rps_number_has_diff) {
                            return `${row.rps_number ?? ""}*`;
                        }

                        const value = row[col.field];

                        if (DATE_FIELDS.includes(col.field)) {
                            return formatDateBR(value) || "";
                        }

                        if (CURRENCY_FIELDS.includes(col.field)) {
                            return parseLocaleNumber(value);
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
                applyStyle(XLSX.utils.encode_cell({ r: 0, c: col }), titleStyle);
                applyStyle(XLSX.utils.encode_cell({ r: 1, c: col }), periodStyle);
                applyStyle(XLSX.utils.encode_cell({ r: 3, c: col }), headerStyle);
            }

            for (let row = 4; row < exportRows.length; row += 1) {
                for (let col = 0; col < columnCount; col += 1) {
                    const field = nameColumns[col].field;
                    const style = CURRENCY_FIELDS.includes(field)
                        ? numberStyle
                        : textStyle;

                    applyStyle(
                        XLSX.utils.encode_cell({ r: row, c: col }),
                        style,
                    );
                }
            }

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                receiptType === "Recebida" ? "NFSe Recebida" : "NFSe Não Recebida",
            );
            XLSX.writeFile(workbook, `${buildReportTitle()}.xlsx`, {
                bookType: "xlsx",
            });
        } catch (error) {
            toast.error(`Erro ao exportar Excel: ${error}`);
        }
    };

    const handleReceiptTypeChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const nextType = event.target.checked
            ? "Recebida"
            : "Não Recebida";

        const total = getCountByReceiptType(listInvoices, nextType);
        const receiptLabel =
            nextType === "Recebida" ? "recebida(s)" : "não recebida(s)";

        setReceiptType(nextType);

        if (total > 0) {
            toast.success(
                `${total} NFSe(s) ${receiptLabel} encontrada(s)`,
                {
                    toastId: "listagem-nfse-recebida-filter",
                },
            );
        } else {
            toast.info(`Nenhuma NFSe ${receiptLabel} encontrada`, {
                toastId: "listagem-nfse-recebida-filter",
            });
        }
    };

    return (
        <SContainer>
            <STitle>{pageTitle}</STitle>

            <SContainerSearchAndButton>
                <CustomSearch
                    width="400px"
                    placeholder="Digite Contrato, NFS ou RPS"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <FormControlLabel
                    label={
                        <span style={{ whiteSpace: "nowrap" }}>
                            {receiptType}
                        </span>
                    }
                    control={
                        <Switch
                            checked={receiptType === "Recebida"}
                            onChange={handleReceiptTypeChange}
                            sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                    color: "#E7B10A",
                                },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                    {
                                        backgroundColor: "#E7B10A",
                                    },
                            }}
                        />
                    }
                    sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
                />

                <Tooltip title="Filtrar invoices">
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
                    titleText={`Filtros - ${pageTitle}`}
                    open={isSelectionModal}
                    initialFilters={selectData}
                    onClose={handleCloseModal}
                    onChange={(filters) => setSelectData(filters)}
                    onConfirm={fetchSelectData}
                    visibleFields={["date_start", "date_end"]}
                    fieldLabels={{
                        date_start: "Data início da NFSe",
                        date_end: "Data fim da NFSe",
                    }}
                />

                <CustomButton $variant="success" width="150px" onClick={handlePrint}>
                    Imprimir
                </CustomButton>

                <CustomButton
                    $variant="success"
                    width="150px"
                    onClick={handleExportExcel}
                >
                    Excel
                </CustomButton>
            </SContainerSearchAndButton>

            <CustomTable
                isLoading={isLoading}
                data={displayedData}
                columns={nameColumns}
                hasPagination
                dateFields={DATE_FIELDS}
                currencyFields={CURRENCY_FIELDS}
                maxChars={20}
                page={page}
                setPage={setPage}
                order={order}
                orderBy={orderBy}
                setOrder={setOrder}
                setOrderBy={setOrderBy}
            />
        </SContainer>
    );
}
