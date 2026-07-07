import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import useTableSearch from "../../../../hooks/useTableSearch";
import { InvoiceContext } from "../../../../contexts/InvoiceContext";
import { IListInvoices } from "../../../../contexts/InvoiceContext/types";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import CustomButton from "../../../../components/CustomButton";
import CustomTooltipLabel from "../../../../components/CustomTooltipLabel";
import {
    sortTableData,
    getNestedValue,
} from "../../../../components/CustomTable/helpers";
import * as XLSX from "xlsx-js-style";

const DATE_FIELDS = ["rps_emission_date", "nfs_emission_date"];
const CURRENCY_FIELDS = [
    "service_value",
    "value_adjust1",
    "irrf_value",
    "service_liquid_value",
    "pis_value",
    "cofins_value",
    "csll_value",
    "iss_value",
    "ibs_value",
    "cbs_value",
];

const parseLocaleNumber = (value: number | string | null | undefined) => {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value !== "string") {
        return 0;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return 0;
    }

    const normalizedValue = trimmedValue.includes(",")
        ? trimmedValue.replace(/\./g, "").replace(",", ".")
        : trimmedValue;

    const parsedValue = Number(normalizedValue);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export function ListInvoices() {
    const invoiceContext = InvoiceContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [allInvoices, setAllInvoices] = useState<IListInvoices[]>([]);
    const [listInvoices, setListInvoices] = useState<IListInvoices[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("nfs_number");
    const [isSelectionModal, setSelectionModal] = useState<boolean>(false);
    const [useInfiniteScroll, setUseInfiniteScroll] = useState<boolean>(false);

    const getInitialSelectData = (): SelectState => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const fmt = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate(),
            ).padStart(2, "0")}`;

        return {
            seller: "",
            buyer: "",
            date_start: fmt(firstDay),
            date_end: fmt(today),
            product: "",
            name_product: "",
        };
    };

    const [selectData, setSelectData] = useState<SelectState>(
        getInitialSelectData(),
    );

    const handleSelectionModal = () => setSelectionModal((prev) => !prev);
    const handleCloseModal = () => setSelectionModal(false);

    const normalizeStr = useCallback((value?: string | number | null) => {
        return (value ?? "")
            .toString()
            .toUpperCase()
            .normalize("NFD")
            .replace(/̀-ͯ/g, "")
            .trim();
    }, []);

    const parseYMD = useCallback((iso?: string) => {
        if (!iso) return null;
        const [y, m, d] = iso.split("-").map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d);
    }, []);

    const onlyDate = useCallback(
        (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        [],
    );

    const formatDateBR = useCallback((value?: string) => {
        if (!value) return "";
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

        const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const [, year, month, day] = isoMatch;
            return `${day}/${month}/${year}`;
        }

        return value;
    }, []);

    const getInvoiceDate = useCallback(
        (invoice: IListInvoices) =>
            invoice.nfs_emission_date || invoice.rps_emission_date || "",
        [],
    );

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await invoiceContext.listInvoices();
            const onlyIssuedInvoices = (response.data || []).filter(
                (invoice: IListInvoices) => Boolean(invoice.nfs_number),
            );

            setAllInvoices(onlyIssuedInvoices);
            setListInvoices(onlyIssuedInvoices);
        } catch (error) {
            toast.error(
                `Erro ao tentar ler invoices, contacte o administrador do sistema: ${error}`,
            );
        } finally {
            setIsLoading(false);
        }
    }, [invoiceContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchSelectData = useCallback(
        (filters: SelectState, showToast = true) => {
            try {
                setIsLoading(true);

                const startDate = parseYMD(filters.date_start);
                const endDate = parseYMD(filters.date_end);
                const sDate = startDate ? onlyDate(startDate) : null;
                const eDate = endDate ? onlyDate(endDate) : null;

                const sellerTerms = (filters.seller || "")
                    .split(",")
                    .map((item) => normalizeStr(item))
                    .filter(Boolean);
                const buyerTerms = (filters.buyer || "")
                    .split(",")
                    .map((item) => normalizeStr(item))
                    .filter(Boolean);
                const rpsTerm = normalizeStr(filters.product);
                const nfsTerm = normalizeStr(filters.name_product);

                const filtered = allInvoices.filter((invoice) => {
                    const invoiceDate = getInvoiceDate(invoice);
                    if (!invoiceDate) return false;

                    const normalizedDate = formatDateBR(invoiceDate);
                    const [day, month, year] = normalizedDate
                        .split("/")
                        .map(Number);

                    if (!day || !month || !year) return false;

                    const currentDate = onlyDate(
                        new Date(year, month - 1, day),
                    );
                    const matchStart = sDate ? currentDate >= sDate : true;
                    const matchEnd = eDate ? currentDate <= eDate : true;

                    const name = normalizeStr(invoice.name);
                    const serviceCode = normalizeStr(invoice.service_code);
                    const rpsNumber = normalizeStr(invoice.rps_number);
                    const nfsNumber = normalizeStr(invoice.nfs_number);

                    const matchSeller =
                        sellerTerms.length === 0 ||
                        sellerTerms.some((term) => name.includes(term));
                    const matchBuyer =
                        buyerTerms.length === 0 ||
                        buyerTerms.some((term) => serviceCode.includes(term));
                    const matchRps = !rpsTerm || rpsNumber.includes(rpsTerm);
                    const matchNfs = !nfsTerm || nfsNumber.includes(nfsTerm);

                    return (
                        matchStart &&
                        matchEnd &&
                        matchSeller &&
                        matchBuyer &&
                        matchRps &&
                        matchNfs
                    );
                });

                setSelectData(filters);
                setListInvoices(filtered);

                if (showToast) {
                    if (filtered.length > 0) {
                        toast.success(
                            `${filtered.length} NFSe(s) encontrada(s)`,
                            { toastId: "list-invoices-filter" },
                        );
                    } else {
                        toast.info("Nenhuma NFSe encontrada", {
                            toastId: "list-invoices-filter",
                        });
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
        [
            allInvoices,
            formatDateBR,
            getInvoiceDate,
            normalizeStr,
            onlyDate,
            parseYMD,
        ],
    );

    const handleClearFilterModal = () => {
        const initialFilters = getInitialSelectData();
        setSelectData(initialFilters);
        fetchSelectData(initialFilters, false);
        setSelectionModal(false);
    };

    const isInitialFilter = useMemo(() => {
        const initial = getInitialSelectData();
        const isDefaultRange =
            (selectData.date_start ?? "") === (initial.date_start ?? "") &&
            (selectData.date_end ?? "") === (initial.date_end ?? "");

        const isClearedRange =
            (selectData.date_start ?? "") === "" &&
            (selectData.date_end ?? "") === "";

        const isSellerCleared = (selectData.seller ?? "").trim() === "";
        const isBuyerCleared = (selectData.buyer ?? "").trim() === "";
        const isProductCleared = (selectData.product ?? "").trim() === "";
        const isNfsCleared = (selectData.name_product ?? "").trim() === "";

        return (
            (isDefaultRange &&
                isSellerCleared &&
                isBuyerCleared &&
                isProductCleared &&
                isNfsCleared) ||
            (isClearedRange &&
                isSellerCleared &&
                isBuyerCleared &&
                isProductCleared &&
                isNfsCleared)
        );
    }, [selectData]);

    useEffect(() => {
        if (allInvoices.length > 0 && isInitialFilter) {
            fetchSelectData(selectData, false);
        }
    }, [allInvoices, fetchSelectData, isInitialFilter, selectData]);

    const { filteredData } = useTableSearch({
        data: listInvoices,
        searchTerm,
        searchableFields: [
            "rps_number",
            "nfs_number",
            "name",
            "cpf_cnpj",
            "city",
            "state",
        ],
    });

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "rps_number",
                header: "Nº RPS",
                width: "130px",
                sortable: false,
            },
            {
                field: "rps_emission_date",
                header: "Dt. RPS",
                width: "120px",
                sortable: false,
            },
            {
                field: "nfs_number",
                header: "NFS",
                width: "120px",
                sortable: true,
            },
            {
                field: "nfs_emission_date",
                header: "Dt. NFS",
                width: "120px",
                sortable: false,
            },
            {
                field: "status",
                header: "Status",
                width: "120px",
                sortable: false,
            },
            {
                field: "code_verif",
                header: "Cód.Verificação",
                width: "120px",
                sortable: false,
            },
            {
                field: "name",
                header: "Tomador",
                width: "220px",
                sortable: false,
            },
            {
                field: "cpf_cnpj",
                header: "CPF/CNPJ",
                width: "150px",
                sortable: false,
            },
            {
                field: "ins_est",
                header: "Insc.Estadual",
                width: "150px",
                sortable: false,
            },
            {
                field: "address",
                header: "Endereço",
                width: "220px",
                sortable: false,
            },
            {
                field: "number",
                header: "Número",
                width: "90px",
                sortable: false,
            },
            {
                field: "complement",
                header: "Complemento",
                width: "160px",
                sortable: false,
            },
            {
                field: "district",
                header: "Bairro",
                width: "150px",
                sortable: false,
            },
            {
                field: "city",
                header: "Cidade",
                width: "150px",
                sortable: false,
            },
            {
                field: "state",
                header: "UF",
                width: "80px",
                sortable: false,
            },
            {
                field: "zip_code",
                header: "CEP",
                width: "120px",
                sortable: false,
            },
            {
                field: "service_discrim",
                header: "Discriminação",
                width: "260px",
                sortable: false,
            },
            {
                field: "service_value",
                header: "Valor Serviço",
                width: "130px",
                sortable: false,
            },
            {
                field: "name_adjust1",
                header: "Ajuste",
                width: "160px",
                sortable: false,
            },
            {
                field: "value_adjust1",
                header: "Valor Ajuste",
                width: "130px",
                sortable: false,
            },
            {
                field: "irrf_value",
                header: "IRRF",
                width: "120px",
                sortable: false,
            },
            {
                field: "service_liquid_value",
                header: "Valor Líquido",
                width: "140px",
                sortable: false,
            },
            {
                field: "pis_value",
                header: "PIS",
                width: "110px",
                sortable: false,
            },
            {
                field: "cofins_value",
                header: "COFINS",
                width: "120px",
                sortable: false,
            },
            {
                field: "csll_value",
                header: "CSLL",
                width: "120px",
                sortable: false,
            },
            {
                field: "iss_value",
                header: "ISS",
                width: "110px",
                sortable: false,
            },
            {
                field: "ibs_value",
                header: "IBS",
                width: "110px",
                sortable: false,
            },
            {
                field: "cbs_value",
                header: "CBS",
                width: "110px",
                sortable: false,
            },
            {
                field: "exportacao",
                header: "Exportação",
                width: "130px",
                sortable: false,
            },
            {
                field: "cod_pais",
                header: "País",
                width: "130px",
                sortable: false,
            },
            {
                field: "owner_record",
                header: "Usuário RPS",
                width: "120px",
                sortable: false,
            },
            {
                field: "owner_send",
                header: "Usuário Emissão",
                width: "120px",
                sortable: false,
            },
        ],
        [],
    );

    const displayedData = useMemo(
        () => sortTableData([...filteredData], orderBy, order),
        [filteredData, orderBy, order],
    );

    const buildReportTitle = () => "Listagem de NFSe";

    const formatIsoDateToBR = (value?: string) => {
        if (!value) return "";
        const [year, month, day] = value.split("-").map(Number);
        if (!year || !month || !day) return "";
        return `${String(day).padStart(2, "0")}/${String(month).padStart(
            2,
            "0",
        )}/${year}`;
    };

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageSize = 25;
        const startDate = formatIsoDateToBR(selectData.date_start);
        const endDate = formatIsoDateToBR(selectData.date_end);
        const reportTitle = `${buildReportTitle()} - ${startDate} até ${endDate}`;
        const reportPeriod = `Data: ${startDate} até ${endDate}`;

        printWindow.document.write(`
        <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    @page { size: A4 landscape; margin: 10mm; }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        color: #1f1f1f;
                    }
                    h3, h4 { margin: 0; }
                    h3 { text-align: left; font-size: 12px; }
                    h4 { text-align: center; margin-bottom: 2px; font-size: 10px; }
                    .report-period {
                        text-align: center;
                        font-size: 9px;
                        margin: 0 0 8px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 4px;
                        table-layout: fixed;
                    }
                    th, td {
                        border: 1px solid #c8c8c8;
                        padding: 2px 3px;
                        font-size: 7px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        line-height: 1.05;
                    }
                    th {
                        background: #e7b10a;
                        color: #1f1f1f;
                        font-weight: bold;
                        text-align: center;
                    }
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
                    let value: any = getNestedValue(row, col.field);
                    if (DATE_FIELDS.includes(col.field)) {
                        value = formatDateBR(value) || "-";
                    } else if (CURRENCY_FIELDS.includes(col.field)) {
                        const num = parseLocaleNumber(value);
                        value = num.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });
                    }
                    printWindow.document.write(`<td>${value ?? ""}</td>`);
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

    const handleExportExcelStyled = () => {
        try {
            const startDate = formatIsoDateToBR(selectData.date_start);
            const endDate = formatIsoDateToBR(selectData.date_end);

            const exportRows = [
                [buildReportTitle()],
                [`Data: ${startDate} até ${endDate}`],
                [],
                nameColumns.map((col) => col.header),
                ...displayedData.map((row) =>
                    nameColumns.map((col) => {
                        let value: any = getNestedValue(row, col.field);

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
                        DATE_FIELDS.includes(field) ||
                        col === 0 ||
                        field === "status" ||
                        field === "code_verif" ||
                        field === "exportacao" ||
                        field === "cod_pais" ||
                        field === "owner_record" ||
                        field === "owner_send"
                            ? textStyle
                            : CURRENCY_FIELDS.includes(field)
                              ? numberStyle
                              : textStyle;

                    applyStyle(
                        XLSX.utils.encode_cell({ r: row, c: col }),
                        style,
                    );
                }
            }

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Listagem NFSe");
            XLSX.writeFile(workbook, `${buildReportTitle()}.xlsx`, {
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
            <STitle>Listagem de NFSe</STitle>

            <SContainerSearchAndButton>
                <CustomSearch
                    width="400px"
                    placeholder="Digite Nº RPS,Nº NFS,Tomador ou CPF/CNPJ"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    titleText="Filtros - Listagem de NFSe"
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

            <CustomTable
                isLoading={isLoading}
                data={displayedData}
                columns={nameColumns}
                hasInfiniteScroll={useInfiniteScroll}
                hasPagination={!useInfiniteScroll}
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

