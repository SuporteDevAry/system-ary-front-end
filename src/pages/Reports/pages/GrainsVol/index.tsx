import { useCallback, useEffect, useMemo, useState } from "react";
import CustomTable from "../../../../components/CustomTable";
import { CustomSearch } from "../../../../components/CustomSearch";
import useTableSearch from "../../../../hooks/useTableSearch";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import CustomButton from "../../../../components/CustomButton";
import IconButton from "@mui/material/IconButton";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import CustomTooltipLabel from "../../../../components/CustomTooltipLabel";
import * as XLSX from "xlsx-js-style";

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

const normalizeText = (value?: string) =>
    (value || "")
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

const formatMoneyBR = (value: number) =>
    value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const VALUE_FIELDS = [
    "quantity",
    "price_real",
    "total_contract_real",
    "commission_value",
];

const parseBrDateToTimestamp = (date?: string) => {
    if (!date) return 0;

    const [day, month, year] = date.split("/").map(Number);
    if (!day || !month || !year) return 0;

    return new Date(year, month - 1, day).getTime();
};

const compareText = (a?: string, b?: string) =>
    String(a ?? "").localeCompare(String(b ?? ""), "pt-BR", {
        numeric: true,
        sensitivity: "base",
    });

const parseBrDateParts = (date?: string) => {
    if (!date) return null;

    const [day, month, year] = date.split("/").map(Number);
    if (!day || !month || !year) return null;

    return { day, month, year };
};

const getMonthKeyFromBrDate = (date?: string) => {
    const parts = parseBrDateParts(date);
    if (!parts) return "";

    return `${parts.year}-${String(parts.month).padStart(2, "0")}`;
};

type GrainsVolRow = Partial<IContractData> & {
    id: string;
    quantity?: number | string;
    price_real?: string;
    day_exchange_formatted?: string;
    type_commission?: string;
    resp_commission?: string;
    commission?: string | number;
    total_contract_real?: string;
    commission_value?: string;
    is_month_total?: boolean;
    is_sigla_total?: boolean;
    is_grand_total?: boolean;
};

export function GrainsVol() {
    const contractContext = ContractContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [allContracts, setAllContracts] = useState<IContractData[]>([]);
    const [listcontracts, setListContracts] = useState<IContractData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState("contract_emission_date");
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
            product_types: "",
            name_product: "",
        };
    };

    const [selectData, setSelectData] = useState<SelectState>(
        getInitialSelectData(),
    );

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await contractContext.listContracts();

            const filteredContracts = response.data.filter(
                (contract: {
                    total_contract_value: any;
                    price: any;
                    commission_seller: any;
                    commission_buyer: any;
                    type_commission_seller: any;
                    type_commission_buyer: any;
                    type_commission: any;
                    resp_commission: any;
                    commission: any;
                    commission_contract: any;
                    type_commission_seller_currency: any;
                    quantity: any;
                    product: any;
                    name_product: any;
                    day_exchange_rate: any;
                    type_currency: any;
                }) =>
                    (contract.name_product &&
                        contract.name_product.toUpperCase() ===
                            "SOJA EM GRÃOS") ||
                    contract.name_product.toUpperCase() === "MILHO EM GRÃOS" ||
                    contract.name_product.toUpperCase() === "TRIGO" ||
                    contract.name_product.toUpperCase() === "SORGO",
            );

            const updatedContracts = filteredContracts.map(
                (contract: {
                    price: any;
                    total_contract_value: any;
                    commission_seller: any;
                    commission_buyer: any;
                    type_commission_seller: any;
                    type_commission_buyer: any;
                    type_commission: any;
                    resp_commission: any;
                    commission_contract: any;
                    type_commission_seller_currency: any;
                    quantity: any;
                    product: any;
                    name_product: any;
                    day_exchange_rate: any;
                    type_currency: any;
                }) => {
                    // 02/01/2025 - Carlos - Farelo e Ã“leo nÃ£o divide por 60
                    // SÃ³ iremos remover essa regra das siglas, caso o cliente aceite a sugestÃ£o da reuniÃ£o do dia 09/04/2025
                    const validProducts = [
                        "O",
                        "F",
                        "OC",
                        "OA",
                        "SB",
                        "EP",
                        "OX",
                    ];
                    const quantityTon = validProducts.includes(contract.product)
                        ? Number(contract.quantity) / 1
                        : Number(contract.quantity) / 1000;

                    const totalContractValue = parseLocaleNumber(
                        contract.total_contract_value,
                    );
                    const exchangeRate = parseLocaleNumber(
                        contract.day_exchange_rate,
                    );
                    const priceValue = parseLocaleNumber(contract.price);

                    const sellerCommission = contract.commission_seller;
                    const buyerCommission = contract.commission_buyer;

                    const total =
                        contract.type_currency == "Dólar"
                            ? totalContractValue * exchangeRate
                            : totalContractValue;

                    const commission =
                        sellerCommission === 0
                            ? buyerCommission
                            : sellerCommission;

                    const type_commission = contract.type_commission_seller;

                    // const type_commission =
                    //   contract.commission_seller != 0
                    //     ? contract.type_commission_seller == "Percentual"
                    //       ? "P"
                    //       : "V"
                    //     : contract.type_commission_buyer != 0
                    //       ? contract.type_commission_buyer == "Percentual"
                    //         ? "P"
                    //         : "V"
                    //       : "?";

                    const commissionValue = parseLocaleNumber(
                        contract.commission_contract,
                    );

                    const resp_commission =
                        contract.commission_seller == undefined ? "C" : "V";

                    const formattedCommission = commissionValue.toLocaleString(
                        "pt-BR",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        },
                    );

                    const formattedTotal = total.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });

                    const formattedPrice = Number(
                        contract.type_currency == "Dólar"
                            ? priceValue * exchangeRate
                            : priceValue,
                    ).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });

                    const formattedDayExchange =
                        contract.day_exchange_rate != 0 ||
                        contract.type_currency == "Dólar"
                            ? exchangeRate.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 4,
                                  maximumFractionDigits: 4,
                              })
                            : "";

                    return {
                        ...contract,
                        quantity: quantityTon,
                        type_commission: type_commission,
                        resp_commission: resp_commission,
                        commission: commission,
                        commission_value: formattedCommission,
                        total_contract_real: formattedTotal,
                        price_real: formattedPrice,
                        day_exchange_formatted: formattedDayExchange,
                    };
                },
            );

            setAllContracts(updatedContracts);
            setListContracts(updatedContracts);
        } catch (error) {
            toast.error(`Erro ao tentar ler contratos: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [contractContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSelectionModal = () => setSelectionModal((prev) => !prev);
    const handleCloseModal = () => setSelectionModal(false);

    const isInitialFilter = useMemo(() => {
        const initial = getInitialSelectData();
        const productTypesEmpty =
            !selectData.product_types ||
            (Array.isArray(selectData.product_types)
                ? selectData.product_types.length === 0
                : selectData.product_types === "");
        return (
            (selectData.seller ?? "") === (initial.seller ?? "") &&
            (selectData.buyer ?? "") === (initial.buyer ?? "") &&
            (selectData.date_start ?? "") === (initial.date_start ?? "") &&
            (selectData.date_end ?? "") === (initial.date_end ?? "") &&
            (selectData.product ?? "") === (initial.product ?? "") &&
            (selectData.name_product ?? "") === (initial.name_product ?? "") &&
            productTypesEmpty
        );
    }, [selectData]);

    const handleClearFilterModal = () => {
        const initialFilters = getInitialSelectData();
        setSelectData(initialFilters);
        fetchSelectData(initialFilters);
        setSelectionModal(false);
    };

    const fetchSelectData = useCallback(
        (filters: SelectState, showToast = true) => {
            try {
                setIsLoading(true);

                const parseIsoDate = (date?: string) => {
                    if (!date) return null;
                    const [year, month, day] = date.split("-").map(Number);
                    if (!year || !month || !day) return null;
                    return new Date(year, month - 1, day);
                };

                const parseBrDate = (date?: string) => {
                    if (!date) return null;
                    const [day, month, year] = date.split("/").map(Number);
                    if (!year || !month || !day) return null;
                    return new Date(year, month - 1, day);
                };

                const sellerTerms = (filters.seller || "")
                    .split(",")
                    .map((item) => normalizeText(item))
                    .filter(Boolean);

                const buyerTerms = (filters.buyer || "")
                    .split(",")
                    .map((item) => normalizeText(item))
                    .filter(Boolean);

                const productTerm = normalizeText(filters.product as string);
                const nameProductTerm = normalizeText(
                    filters.name_product as string,
                );

                const startDate = parseIsoDate(filters.date_start as string);
                const endDate = parseIsoDate(filters.date_end as string);

                const productTypes = filters.product_types;
                const productTypesList: string[] = Array.isArray(productTypes)
                    ? productTypes
                    : typeof productTypes === "string" && productTypes !== ""
                      ? [productTypes]
                      : [];

                const filtered = allContracts.filter((contract: any) => {
                    const sellerName = normalizeText(contract?.seller?.name);
                    const buyerName = normalizeText(contract?.buyer?.name);
                    const product = normalizeText(contract?.product);
                    const nameProduct = normalizeText(contract?.name_product);
                    const emissionDate = parseBrDate(
                        contract?.contract_emission_date,
                    );

                    const matchSeller =
                        sellerTerms.length === 0 ||
                        sellerTerms.some((term) => sellerName.includes(term));

                    const matchBuyer =
                        buyerTerms.length === 0 ||
                        buyerTerms.some((term) => buyerName.includes(term));

                    const matchProduct =
                        !productTerm || product.includes(productTerm);

                    const matchNameProduct =
                        !nameProductTerm ||
                        nameProduct.includes(nameProductTerm);

                    const matchProductTypes =
                        productTypesList.length === 0 ||
                        productTypesList.includes(contract?.product);

                    const matchStart = startDate
                        ? emissionDate
                            ? emissionDate >= startDate
                            : false
                        : true;

                    const matchEnd = endDate
                        ? emissionDate
                            ? emissionDate <= endDate
                            : false
                        : true;

                    return (
                        matchSeller &&
                        matchBuyer &&
                        matchProduct &&
                        matchNameProduct &&
                        matchProductTypes &&
                        matchStart &&
                        matchEnd
                    );
                });

                setSelectData(filters);
                setListContracts(filtered);

                if (showToast) {
                    if (filtered.length > 0) {
                        toast.success(
                            `${filtered.length} contrato(s) encontrado(s)`,
                        );
                    } else {
                        toast.info("Nenhum contrato encontrado");
                    }
                }

                setSelectionModal(false);
            } catch (error) {
                toast.error(`Erro ao aplicar filtros: ${error}`);
            } finally {
                setIsLoading(false);
            }
        },
        [allContracts],
    );

    useEffect(() => {
        if (allContracts.length > 0 && isInitialFilter) {
            fetchSelectData(selectData, false);
        }
    }, [allContracts, isInitialFilter, fetchSelectData]);

    const { filteredData } = useTableSearch({
        data: listcontracts,
        searchTerm,
        searchableFields: ["contract_emission_date", "number_contract"],
    });

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "contract_emission_date",
                header: "DATA",
                width: "100px",
            },
            {
                field: "number_contract",
                header: "CONTRATO",
                width: "180px",
            },
            {
                field: "seller.name",
                header: "VENDEDOR",
                width: "200px",
            },
            {
                field: "buyer.name",
                header: "COMPRADOR",
                width: "200px",
            },
            {
                field: "quantity",
                header: "QUANTIDADE (TON)",
                width: "150px",
                renderCell: (row) => (
                    <div style={{ width: "100%", textAlign: "right" }}>
                        {parseLocaleNumber(row.quantity).toLocaleString(
                            "pt-BR",
                            {
                                minimumFractionDigits: 3,
                            },
                        )}
                    </div>
                ),
            },
            {
                field: "price_real",
                header: "PREÇO R$",
                width: "150px",
                renderCell: (row) => (
                    <div style={{ width: "100%", textAlign: "right" }}>
                        {row.price_real ?? ""}
                    </div>
                ),
            },
            {
                field: "total_contract_real",
                header: "VALOR CONTRATO R$",
                width: "20px",
                renderCell: (row) => (
                    <div style={{ width: "100%", textAlign: "right" }}>
                        {row.total_contract_real ?? ""}
                    </div>
                ),
            },
            {
                field: "commission_value",
                header: "COMISSÃO R$",
                width: "130px",
                renderCell: (row) => (
                    <div style={{ width: "100%", textAlign: "right" }}>
                        {row.commission_value ?? ""}
                    </div>
                ),
            },
        ],
        [],
    );

    const reportRows = useMemo(() => {
        const sortedRows = [...filteredData].sort((a, b) => {
            const siglaDiff = compareText(a.product, b.product);
            if (siglaDiff !== 0) return siglaDiff;

            const dateDiff =
                parseBrDateToTimestamp(a.contract_emission_date) -
                parseBrDateToTimestamp(b.contract_emission_date);

            if (dateDiff !== 0) return dateDiff;

            return compareText(a.number_contract, b.number_contract);
        }) as GrainsVolRow[];

        const totalsBySigla = new Map<
            string,
            {
                quantity: number;
                total_contract_real: number;
                commission_value: number;
            }
        >();
        const totalsBySiglaAndMonth = new Map<
            string,
            {
                quantity: number;
                total_contract_real: number;
                commission_value: number;
            }
        >();
        const grandTotals = {
            quantity: 0,
            total_contract_real: 0,
            commission_value: 0,
        };

        sortedRows.forEach((row) => {
            const sigla = String(row.product ?? "").trim();
            if (!sigla) return;

            const monthKey = getMonthKeyFromBrDate(row.contract_emission_date);
            const siglaTotals = totalsBySigla.get(sigla) ?? {
                quantity: 0,
                total_contract_real: 0,
                commission_value: 0,
            };
            const monthTotalsKey = `${sigla}::${monthKey}`;
            const monthTotals = totalsBySiglaAndMonth.get(monthTotalsKey) ?? {
                quantity: 0,
                total_contract_real: 0,
                commission_value: 0,
            };

            const quantityValue = Number(row.quantity ?? 0) || 0;
            grandTotals.quantity += quantityValue;
            grandTotals.total_contract_real += parseLocaleNumber(
                row.total_contract_real,
            );
            grandTotals.commission_value += parseLocaleNumber(
                row.commission_value,
            );
            siglaTotals.total_contract_real += parseLocaleNumber(
                row.total_contract_real,
            );
            siglaTotals.commission_value += parseLocaleNumber(
                row.commission_value,
            );
            siglaTotals.quantity += quantityValue;
            monthTotals.total_contract_real += parseLocaleNumber(
                row.total_contract_real,
            );
            monthTotals.commission_value += parseLocaleNumber(
                row.commission_value,
            );
            monthTotals.quantity += quantityValue;
            totalsBySigla.set(sigla, siglaTotals);
            totalsBySiglaAndMonth.set(monthTotalsKey, monthTotals);
        });

        const rowsWithTotals: GrainsVolRow[] = [];

        sortedRows.forEach((row, index) => {
            const sigla = String(row.product ?? "").trim();
            const monthKey = getMonthKeyFromBrDate(row.contract_emission_date);
            rowsWithTotals.push(row);

            if (!sigla) return;

            const nextRow = sortedRows[index + 1];
            const nextSigla = String(nextRow?.product ?? "").trim();
            const nextMonthKey = getMonthKeyFromBrDate(
                nextRow?.contract_emission_date,
            );
            const isLastRowInMonth =
                sigla !== nextSigla || monthKey !== nextMonthKey;

            if (!isLastRowInMonth) return;

            const totals = totalsBySiglaAndMonth.get(`${sigla}::${monthKey}`);
            if (!totals) return;

            rowsWithTotals.push({
                id: `month-total-${sigla}-${monthKey}`,
                product: `Total mês ${sigla}`,
                contract_emission_date: "",
                number_contract: `Total mês ${sigla}`,
                seller: { name: "" },
                buyer: { name: "" },
                quantity: totals.quantity,
                price_real: "",
                type_currency: "",
                day_exchange_formatted: "",
                total_contract_real: formatMoneyBR(totals.total_contract_real),
                type_commission: "",
                resp_commission: "",
                commission: "",
                commission_value: formatMoneyBR(totals.commission_value),
                is_month_total: true,
            } as GrainsVolRow);
        });

        Array.from(totalsBySigla.entries())
            .sort(([a], [b]) => compareText(a, b))
            .forEach(([sigla, totals]) => {
                rowsWithTotals.push({
                    id: `sigla-total-${sigla}`,
                    product: `Total ${sigla}`,
                    contract_emission_date: "",
                    number_contract: `Total ${sigla}`,
                    seller: { name: "" },
                    buyer: { name: "" },
                    quantity: totals.quantity,
                    price_real: "",
                    type_currency: "",
                    day_exchange_formatted: "",
                    total_contract_real: formatMoneyBR(
                        totals.total_contract_real,
                    ),
                    type_commission: "",
                    resp_commission: "",
                    commission: "",
                    commission_value: formatMoneyBR(totals.commission_value),
                    is_sigla_total: true,
                } as GrainsVolRow);
            });

        rowsWithTotals.push({
            id: "grand-total",
            product: "Total",
            contract_emission_date: "",
            number_contract: "Total",
            seller: { name: "" },
            buyer: { name: "" },
            quantity: grandTotals.quantity,
            price_real: "",
            type_currency: "",
            day_exchange_formatted: "",
            total_contract_real: formatMoneyBR(grandTotals.total_contract_real),
            type_commission: "",
            resp_commission: "",
            commission: "",
            commission_value: formatMoneyBR(grandTotals.commission_value),
            is_grand_total: true,
        } as GrainsVolRow);

        return rowsWithTotals;
    }, [filteredData]);

    const buildReportTitle = () => "Grãos Volume - Produto";

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

        const pageSize = 30;
        const startDate = formatIsoDateToBR(selectData.date_start);
        const endDate = formatIsoDateToBR(selectData.date_end);
        const reportTitle = `${buildReportTitle()} - ${startDate} até ${endDate}`;
        const reportPeriod = `Data: ${startDate} até ${endDate}`;

        printWindow.document.write(`
        <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    @page { size: A4 portrait; margin: 10mm; }
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
                    tr.total-row td {
                        background: #e2f0d9;
                        font-weight: bold;
                    }
                    tr.grand-total-row td {
                        background: #c6e0b4;
                        font-weight: bold;
                    }
                    td:first-child { text-align: left; }
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

        for (let i = 0; i < reportRows.length; i += pageSize) {
            const pageRows = reportRows.slice(i, i + pageSize);

            printWindow.document.write(`<table><thead><tr>`);
            nameColumns.forEach((col) => {
                printWindow.document.write(
                    `<th style="width: ${col.width};">${col.header}</th>`,
                );
            });
            printWindow.document.write(`</tr></thead><tbody>`);

            pageRows.forEach((row) => {
                printWindow.document.write(
                    `<tr class="${row.is_grand_total ? "grand-total-row" : row.is_sigla_total || row.is_month_total ? "total-row" : ""}">`,
                );
                nameColumns.forEach((col) => {
                    const fields = col.field.split(".");
                    let value: any = row;
                    for (const f of fields) {
                        value = value?.[f];
                    }
                    printWindow.document.write(
                        `<td style="${
                            VALUE_FIELDS.includes(col.field)
                                ? "text-align:right;"
                                : ""
                        }">${value ?? ""}</td>`,
                    );
                });
                printWindow.document.write(`</tr>`);
            });

            printWindow.document.write(`</tbody></table>`);

            if (i + pageSize < reportRows.length) {
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
            const startDate = formatIsoDateToBR(selectData.date_start);
            const endDate = formatIsoDateToBR(selectData.date_end);

            const exportRows = [
                [buildReportTitle()],
                [`Data: ${startDate} até ${endDate}`],
                [],
                nameColumns.map((col) => col.header),
                ...reportRows.map((row) =>
                    nameColumns.map((col) => {
                        const fields = col.field.split(".");
                        let value: any = row;

                        for (const f of fields) {
                            value = value?.[f];
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
                    titleStyle,
                );
                applyStyle(
                    XLSX.utils.encode_cell({ r: 3, c: col }),
                    headerStyle,
                );
            }

            for (let row = 4; row < exportRows.length; row += 1) {
                const currentRow = reportRows[row - 4];
                const isTotalRow = Boolean(
                    currentRow?.is_sigla_total ||
                    currentRow?.is_month_total ||
                    currentRow?.is_grand_total,
                );
                for (let col = 0; col < columnCount; col += 1) {
                    const baseStyle = VALUE_FIELDS.includes(
                        nameColumns[col].field,
                    )
                        ? numberStyle
                        : textStyle;
                    const style = isTotalRow
                        ? {
                              ...baseStyle,
                              font: {
                                  ...(baseStyle as any).font,
                                  bold: true,
                              },
                              fill: {
                                  patternType: "solid",
                                  fgColor: {
                                      rgb: currentRow?.is_grand_total
                                          ? "C6E0B4"
                                          : currentRow?.is_sigla_total
                                            ? "C6E0B4"
                                            : "E2F0D9",
                                  },
                              },
                          }
                        : baseStyle;
                    applyStyle(
                        XLSX.utils.encode_cell({ r: row, c: col }),
                        style,
                    );
                }
            }

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Grãos Volume");
            XLSX.writeFile(workbook, `${buildReportTitle()}.xlsx`, {
                bookType: "xlsx",
            });
        } catch (error) {
            toast.error(`Erro ao exportar Excel: ${error}`);
        }
    };

    return (
        <>
            <STitle>Grãos Volume - Produto</STitle>
            <SContainerSearchAndButton>
                <CustomSearch
                    width="450px"
                    placeholder="Pesquise por Data ou Contrato"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <CustomTooltipLabel title="Filtrar contratos">
                    <IconButton
                        aria-label="filter"
                        onClick={handleSelectionModal}
                        sx={{ color: "#E7B10A" }}
                    >
                        <TbFilter />
                    </IconButton>
                </CustomTooltipLabel>

                <CustomTooltipLabel title="Limpar filtros">
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
                </CustomTooltipLabel>

                <ReportFilter
                    titleText="Grãos Volume"
                    open={isSelectionModal}
                    initialFilters={selectData}
                    onClose={handleCloseModal}
                    onChange={(filters) => setSelectData(filters)}
                    onConfirm={fetchSelectData}
                    visibleFields={[
                        "seller",
                        "buyer",
                        "date_start",
                        "date_end",
                        "product",
                        "name_product",
                    ]}
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
                        {!useInfiniteScroll ? <PiScroll /> : <TbInfinity />}
                    </IconButton>
                </CustomTooltipLabel>
            </SContainerSearchAndButton>
            <SContainer>
                <CustomTable
                    isLoading={isLoading}
                    data={reportRows}
                    columns={nameColumns}
                    hasInfiniteScroll={!useInfiniteScroll}
                    hasPagination={useInfiniteScroll}
                    disableSorting
                    //maxChars={15}
                    page={page}
                    setPage={setPage}
                    order={order}
                    orderBy={orderBy}
                    setOrder={setOrder}
                    setOrderBy={setOrderBy}
                />
            </SContainer>
        </>
    );
}
