import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useTableSearch from "../../../../hooks/useTableSearch";
import { CustomSearch } from "../../../../components/CustomSearch";
import {
    SContainerSearchAndButton,
    SCustomTableWrapper,
    STitle,
} from "./styles";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import CustomButton from "../../../../components/CustomButton";
import { BillingContext } from "../../../../contexts/BillingContext";
import { IBillingData } from "../../../../contexts/BillingContext/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { TableProductContext } from "../../../../contexts/TablesProducts";
import { ITableProductsData } from "../../../../contexts/TablesProducts/types";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import { sortTableData } from "../../../../components/CustomTable/helpers";
import * as XLSX from "xlsx-js-style";

export function ReceiptMap() {
    const contractContext = ContractContext();
    const billingContext = BillingContext();
    const tableProductContext = TableProductContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [allBillings, setAllBillings] = useState<IBillingData[]>([]);
    const [listBillings, setListBillings] = useState<IBillingData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState("receipt_date");
    const [isSelectionModal, setSelectionModal] = useState<boolean>(false);
    const [useInfiniteScroll, setUseInfiniteScroll] = useState<boolean>(false);

    const getInitialSelectData = (): SelectState => {
        const today = new Date();
        // mês atual (sem +1)
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
        };
    };

    const [selectData, setSelectData] = useState<SelectState>(
        getInitialSelectData(),
    );

    const handleSelectionModal = () => setSelectionModal((prev) => !prev);
    const handleCloseModal = () => setSelectionModal(false);

    const fetchSelectData = useCallback(
        (filters: SelectState, showToast = true) => {
            try {
                setIsLoading(true);

                const normalizeStr = (value?: string) =>
                    (value || "")
                        .toString()
                        .toUpperCase()
                        .normalize("NFD")
                        .replace(/\u0300-\u036f/g, "")
                        .trim();

                // Parse das datas da seleção de forma segura (sem usar new Date(isoString))
                const parseYMD = (iso?: string) => {
                    if (!iso) return null;
                    const [y, m, d] = iso.split("-").map(Number);
                    return new Date(y, m - 1, d); // criação local, sem timezone-shift
                };

                const startDate = parseYMD(filters.date_start);
                const endDate = parseYMD(filters.date_end);

                // Função que normaliza a data para comparações sem horário (00:00 local)
                const onlyDate = (d: Date) =>
                    new Date(d.getFullYear(), d.getMonth(), d.getDate());

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

                const productTerm = normalizeStr(filters.product);
                const productTypes = filters.product_types;
                const productTypesList: string[] = Array.isArray(productTypes)
                    ? productTypes.map((item) => normalizeStr(item))
                    : typeof productTypes === "string" && productTypes !== ""
                      ? [normalizeStr(productTypes)]
                      : [];

                const filtered = allBillings.filter((billing) => {
                    if (!billing.receipt_date) return false;

                    // receipt_date esperado no formato "dd/MM/yyyy"
                    const [day, month, year] = billing.receipt_date
                        .split("/")
                        .map(Number);
                    if (!day || !month || !year) return false;

                    const receiptDate = new Date(year, month - 1, day); // criação local correta
                    const rDate = onlyDate(receiptDate);

                    const matchStart = sDate ? rDate >= sDate : true;
                    const matchEnd = eDate ? rDate <= eDate : true;
                    const sellerName = normalizeStr(
                        (billing as any).seller_name,
                    );
                    const buyerName = normalizeStr((billing as any).buyer_name);
                    const product = normalizeStr((billing as any).product);
                    const matchSeller =
                        sellerTerms.length === 0 ||
                        sellerTerms.some((term) => sellerName.includes(term));
                    const matchBuyer =
                        buyerTerms.length === 0 ||
                        buyerTerms.some((term) => buyerName.includes(term));
                    const matchProduct =
                        !productTerm || product.includes(productTerm);
                    const matchProductTypes =
                        productTypesList.length === 0 ||
                        productTypesList.includes(product);

                    return (
                        matchStart &&
                        matchEnd &&
                        matchSeller &&
                        matchBuyer &&
                        matchProduct &&
                        matchProductTypes
                    );
                });

                setSelectData(filters);
                setListBillings(filtered);

                if (showToast) {
                    if (filtered.length > 0) {
                        toast.success(
                            `${filtered.length} contrato(s) encontrado(s)`,
                            { toastId: "receipt-map-filter" },
                        );
                    } else {
                        toast.info("Nenhum contrato encontrado", {
                            toastId: "receipt-map-filter",
                        });
                    }
                }

                setSelectionModal(false);
            } catch (error) {
                if (showToast) toast.error(`Erro ao aplicar filtros: ${error}`);
            } finally {
                setIsLoading(false);
            }
        },
        [allBillings],
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
        const productTypesEmpty =
            !selectData.product_types ||
            (Array.isArray(selectData.product_types)
                ? selectData.product_types.length === 0
                : selectData.product_types === "");

        return (
            (isDefaultRange &&
                isSellerCleared &&
                isBuyerCleared &&
                isProductCleared &&
                productTypesEmpty) ||
            (isClearedRange &&
                isSellerCleared &&
                isBuyerCleared &&
                isProductCleared &&
                productTypesEmpty)
        );
    }, [selectData]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);

            const responseContract = await contractContext.listContracts();
            const response = await billingContext.listBillings();

            const contractList =
                responseContract?.data || responseContract || [];

            const updatedBilling = response.data.map((billing: any) => {
                const contract = contractList.find(
                    (c: any) => c.number_contract === billing.number_contract,
                );

                const total_service = Number(billing.total_service_value) || 0;
                const liquid = Number(billing.liquid_value) || 0;
                const adjustment = Number(billing.adjustment_value) || 0;
                const irrf = Number(billing.irrf_value) || 0;

                let csll_value = 0;
                if (billing.receipt_date) {
                    const [day, month, year] = billing.receipt_date
                        .split("/")
                        .map(Number);
                    const receiptDate = new Date(year, month - 1, day);

                    // Definição dos marcos temporais
                    const limit2025 = new Date(2025, 11, 31); // 31/12/2025
                    const limitMarco2026 = new Date(2026, 2, 31); // 31/03/2026

                    if (
                        receiptDate > limit2025 &&
                        receiptDate <= limitMarco2026
                    ) {
                        // Faixa 1: Superior a 31/12/2025 e Inferior/Igual a 31/03/2026
                        csll_value = total_service * 0.0288; // 2.88%
                    } else if (receiptDate > limitMarco2026) {
                        // Faixa 2: Após 31/03/2026
                        // Altere o 0.03 (3%) abaixo para o percentual correto que será aplicado após março
                        csll_value = total_service * 0.032;
                    }
                }

                const ISS_PERCENT = 0.05; // 5%
                const PIS_COFINS_PERCENT = 0.0465; // 4,65%

                const iss = total_service * ISS_PERCENT;
                const piscofins = total_service * PIS_COFINS_PERCENT;
                const tot_base =
                    total_service -
                    adjustment -
                    irrf -
                    iss -
                    piscofins -
                    csll_value;
                const formatValue = (num: number) =>
                    num.toFixed(2).replace(".", ",");

                return {
                    ...billing,
                    total_service_value: formatValue(total_service),
                    liquid_value: formatValue(liquid),
                    adjustment_value: formatValue(adjustment),
                    irrf_value: formatValue(irrf),
                    iss: formatValue(iss),
                    pis_cofins: formatValue(piscofins),
                    csll: formatValue(csll_value),
                    value_base: formatValue(tot_base),
                    contract_emission_date:
                        contract?.contract_emission_date || "",
                    seller_name: contract?.seller.name || "",
                    buyer_name: contract?.buyer.name || "",
                    product: contract?.product || "",
                };
            });

            setAllBillings(updatedBilling);
            setListBillings(updatedBilling);
        } catch (error) {
            toast.error(`Erro ao tentar ler recebimentos: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [billingContext, contractContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Aplica o filtro inicial automaticamente ao carregar os dados
    // TODO []: Validar com o Carlos!
    useEffect(() => {
        if (allBillings.length > 0 && isInitialFilter) {
            fetchSelectData(selectData, false);
        }
    }, [allBillings, isInitialFilter, fetchSelectData]);

    useEffect(() => {
        if (isSelectionModal) {
            const input = document.querySelector('input[name="date_start"]');
            (input as HTMLInputElement)?.focus();
        }
    }, [isSelectionModal]);

    const { filteredData } = useTableSearch({
        data: listBillings,
        searchTerm,
        searchableFields: ["receipt_date", "number_contract"],
    });

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "receipt_date",
                header: "Dt.Recebto.",
                headerTooltip: "Data de Recebimento",
                width: "100px",
                sortable: true,
            },
            {
                field: "contract_emission_date",
                header: "Dt.Contrato",
                headerTooltip: "Data do Contrato",
                width: "100px",
            },
            {
                field: "number_contract",
                header: "Contrato",
                width: "180px",
                sortable: true,
            },
            {
                field: "seller_name",
                header: "Vendedor",
                width: "200px",
            },
            {
                field: "total_service_value",
                header: "Valor Bruto",
                width: "150px",
                align: "right",
            },
            {
                field: "liquid_value",
                header: "Valor Recebido",
                width: "150px",
                align: "right",
            },
            {
                field: "adjustment_value",
                header: "Valor Corretora",
                width: "150px",
                align: "right",
            },
            {
                field: "irrf_value",
                header: "IRRF",
                headerTooltip: "Imposto de Renda Retido na Fonte",
                width: "150px",
                align: "right",
            },
            {
                field: "iss",
                header: "ISS",
                headerTooltip: "Imposto Sobre Serviços",
                width: "150px",
                align: "right",
            },
            {
                field: "pis_cofins",
                header: "PIS+COFINS",
                headerTooltip:
                    "Programa de Integração Social e Contribuição para o Financiamento da Seguridade Social",
                width: "150px",
                align: "right",
            },
            {
                field: "csll",
                header: "CSLL",
                headerTooltip: "Contribuição Social sobre o Lucro Líquido",
                width: "150px",
                align: "right",
            },
            {
                field: "value_base",
                header: "Valor Base",
                headerTooltip: "Valor Base de Cálculo",
                width: "150px",
                align: "right",
            },
        ],
        [],
    );

    const getNestedValue = (obj: any, path: string): any => {
        return path.split(".").reduce((acc, part) => acc?.[part], obj);
    };

    const normalizeText = (value?: string) =>
        (value || "")
            .toString()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

    const compareContracts = (a: string, b: string) => {
        const aNum = Number(a);
        const bNum = Number(b);
        const aIsNumeric = a !== "" && !Number.isNaN(aNum);
        const bIsNumeric = b !== "" && !Number.isNaN(bNum);

        if (aIsNumeric && bIsNumeric) {
            return aNum - bNum;
        }

        return a.localeCompare(b, "pt-BR", {
            numeric: true,
            sensitivity: "base",
        });
    };

    const sortedData = useMemo(() => {
        const sorted = [...filteredData].sort((a, b) => {
            const aRaw = getNestedValue(a, orderBy);
            const bRaw = getNestedValue(b, orderBy);

            // Tenta converter para número decimal com . como separador
            const aNum =
                typeof aRaw === "string"
                    ? parseFloat(aRaw.replace(".", "").replace(",", "."))
                    : Number(aRaw);
            const bNum =
                typeof bRaw === "string"
                    ? parseFloat(bRaw.replace(".", "").replace(",", "."))
                    : Number(bRaw);

            return order === "asc" ? aNum - bNum : bNum - aNum;
        });
        return sorted;
    }, [filteredData, order, orderBy]);

    const displayedData = useMemo(
        () => sortTableData(sortedData, orderBy, order),
        [sortedData, orderBy, order],
    );

    // const sortedData = [...filteredData].sort((a, b) => {
    //     const qA = Number(a.quantity) || 0;
    //     const qB = Number(b.quantity) || 0;
    //     return qA - qB;
    // });

    const handlePrint = async (): Promise<void> => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const formatIsoYMDToBR = (iso?: string) => {
            if (!iso) return "";
            const [y, m, d] = iso.split("-").map(Number);
            if (!y || !m || !d) return "";
            const dd = String(d).padStart(2, "0");
            const mm = String(m).padStart(2, "0");
            return `${dd}/${mm}/${y}`;
        };

        const formatMoney = (value: unknown) => {
            const numericValue =
                typeof value === "number"
                    ? value
                    : Number(
                          parseFloat(
                              String(value ?? 0)
                                  .replace(/\./g, "")
                                  .replace(",", "."),
                          ) || 0,
                      );

            return numericValue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        };

        const monetaryFields = [
            "total_service_value",
            "liquid_value",
            "adjustment_value",
            "irrf_value",
            "iss",
            "pis_cofins",
            "csll",
            "value_base",
        ];

        const parseMoney = (value: unknown) => {
            if (typeof value === "number") return value;
            const normalized = String(value ?? "")
                .replace(/\./g, "")
                .replace(",", ".")
                .replace(/[^\d.-]/g, "");
            const parsed = Number(normalized);
            return Number.isNaN(parsed) ? 0 : parsed;
        };

        const startDateFormatted = formatIsoYMDToBR(selectData.date_start);
        const endDateFormatted = formatIsoYMDToBR(selectData.date_end);

        const tablesResponse = await tableProductContext.listTableProducts();
        const tableProducts: ITableProductsData[] = tablesResponse?.data || [];
        const reportFileBase = getReportFileBase(tableProducts);

        const siglaToMesa = new Map<string, string>();
        tableProducts.forEach((mesa) => {
            (mesa.product_types || []).forEach((sigla) => {
                siglaToMesa.set(normalizeText(sigla), mesa.name);
            });
        });

        const dataToPrint = [...filteredData].sort((a, b) =>
            compareContracts(
                String(a.number_contract ?? ""),
                String(b.number_contract ?? ""),
            ),
        );

        const emptyTotals = {
            total_service_value: 0,
            liquid_value: 0,
            adjustment_value: 0,
            irrf_value: 0,
            iss: 0,
            pis_cofins: 0,
            csll: 0,
            value_base: 0,
        };

        const groupedByMesa = dataToPrint.reduce((acc, billing) => {
            const sigla = normalizeText((billing as any).product);
            const mesa = siglaToMesa.get(sigla) || "Sem mesa cadastrada";
            const current = acc.get(mesa) || {
                items: [] as any[],
                totals: { ...emptyTotals },
            };

            current.items.push(billing);
            monetaryFields.forEach((field) => {
                current.totals[field as keyof typeof current.totals] +=
                    parseMoney((billing as any)[field]);
            });

            acc.set(mesa, current);
            return acc;
        }, new Map<string, { items: any[]; totals: typeof emptyTotals }>());

        const generalTotals = dataToPrint.reduce(
            (acc, billing) => {
                monetaryFields.forEach((field) => {
                    acc[field as keyof typeof acc] += parseMoney(
                        (billing as any)[field],
                    );
                });
                return acc;
            },
            { ...emptyTotals },
        );

        const columns = [
            "Dt.Recebto.",
            "Dt.Contrato",
            "Contrato",
            "Vendedor",
            "Valor Bruto",
            "Valor Recebido",
            "Valor Corretora",
            "IRRF",
            "ISS",
            "PIS+COFINS",
            "CSLL",
            "Valor Base",
        ];

        const colWidths = [
            "110px",
            "110px",
            "140px",
            "220px",
            ...Array(8).fill("110px"),
        ];

        const mesaOrder = Array.from(groupedByMesa.entries()).sort(([a], [b]) =>
            a.localeCompare(b, "pt-BR"),
        );

        printWindow.document.write(`
        <html>
            <head>
                <title>${reportFileBase}</title>
                <style>
                    body { font-family: "Courier New", monospace; margin: 24px; color: #111; }
                    h3, h4, h6 { margin: 0; }
                    h3 { text-align: left; }
                    h4, h6 { text-align: center; }
                    .report-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 12px; }
                    .report-table th, .report-table td {
                        border-bottom: 1px solid #777;
                        padding: 4px 6px;
                        font-size: 10px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: clip;
                    }
                    .report-table th { border-top: 2px solid #222; border-bottom: 2px solid #222; text-align: left; }
                    .report-table td.num, .report-table th.num { text-align: right; }
                    .mesa-total td {
                        font-weight: bold;
                        border-top: 1px solid #222;
                        border-bottom: 1px solid #222;
                    }
                    .total-geral td {
                        font-weight: bold;
                        border-top: 2px solid #222;
                        border-bottom: 2px solid #222;
                    }
                    .page-break { page-break-after: always; }
                </style>
            </head>
            <body>
                <h3>Ary Oleofar</h3>
                <h4>Mapa de Recebimento</h4>
                <h6>DE: ${startDateFormatted} ATÉ ${endDateFormatted}</h6>
                <table class="report-table">
                    <colgroup>
                        ${colWidths.map((width) => `<col style="width:${width}" />`).join("")}
                    </colgroup>
                    <thead>
                        <tr>
                            ${columns
                                .map(
                                    (header, index) =>
                                        `<th class="${index >= 4 ? "num" : ""}">${header}</th>`,
                                )
                                .join("")}
                        </tr>
                    </thead>
                    <tbody>
        `);

        mesaOrder.forEach(([mesa, data]) => {
            data.items.forEach((row) => {
                const values = [
                    row.receipt_date ?? "",
                    row.contract_emission_date ?? "",
                    String(row.number_contract ?? ""),
                    row.seller_name ?? "",
                    formatMoney(row.total_service_value),
                    formatMoney(row.liquid_value),
                    formatMoney(row.adjustment_value),
                    formatMoney(row.irrf_value),
                    formatMoney(row.iss),
                    formatMoney(row.pis_cofins),
                    formatMoney(row.csll),
                    formatMoney(row.value_base),
                ];

                printWindow.document.write(`
                    <tr>
                        ${values
                            .map(
                                (value, index) =>
                                    `<td class="${index >= 4 ? "num" : ""}">${value}</td>`,
                            )
                            .join("")}
                    </tr>
                `);
            });

            printWindow.document.write(`
                <tr class="mesa-total">
                    <td>Mesa ${mesa}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="num">${formatMoney(data.totals.total_service_value)}</td>
                    <td class="num">${formatMoney(data.totals.liquid_value)}</td>
                    <td class="num">${formatMoney(data.totals.adjustment_value)}</td>
                    <td class="num">${formatMoney(data.totals.irrf_value)}</td>
                    <td class="num">${formatMoney(data.totals.iss)}</td>
                    <td class="num">${formatMoney(data.totals.pis_cofins)}</td>
                    <td class="num">${formatMoney(data.totals.csll)}</td>
                    <td class="num">${formatMoney(data.totals.value_base)}</td>
                </tr>
            `);
        });

        printWindow.document.write(`
            <tr class="total-geral">
                <td>Total Geral</td>
                <td></td>
                <td></td>
                <td></td>
                <td class="num">${formatMoney(generalTotals.total_service_value)}</td>
                <td class="num">${formatMoney(generalTotals.liquid_value)}</td>
                <td class="num">${formatMoney(generalTotals.adjustment_value)}</td>
                <td class="num">${formatMoney(generalTotals.irrf_value)}</td>
                <td class="num">${formatMoney(generalTotals.iss)}</td>
                <td class="num">${formatMoney(generalTotals.pis_cofins)}</td>
                <td class="num">${formatMoney(generalTotals.csll)}</td>
                <td class="num">${formatMoney(generalTotals.value_base)}</td>
            </tr>
            <tr>
                <td colspan="${columns.length}">&nbsp;</td>
            </tr>
            <tr>
                <td colspan="${columns.length}" style="text-align: center; font-weight: bold;">
                    ${reportFileBase}
                </td>
            </tr>
                    </tbody>
                </table>
            </body>
        </html>
        `);

        printWindow.document.close();
        printWindow.document.title = reportFileBase;

        const printAndClose = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };

        printWindow.onload = () => setTimeout(printAndClose, 100);
        setTimeout(printAndClose, 500);
    };

    const formatIsoYMDToBR = (iso?: string) => {
        if (!iso) return "";
        const [y, m, d] = iso.split("-").map(Number);
        if (!y || !m || !d) return "";
        const dd = String(d).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        return `${dd}/${mm}/${y}`;
    };

    const getReportFileBase = (tableProducts: ITableProductsData[]) => {
        const dateEnd = selectData.date_end || selectData.date_start || "";
        const [year, month] = dateEnd.split("-").map((part) => part.trim());
        const mm = String(Number(month || 0)).padStart(2, "0");
        const yy = String(year || "").slice(-2).padStart(2, "0");

        const selectedProductTypes = Array.isArray(selectData.product_types)
            ? selectData.product_types
            : typeof selectData.product_types === "string" &&
                selectData.product_types
              ? [selectData.product_types]
              : [];

        const normalizeList = (values: string[]) =>
            values
                .map((value) => normalizeText(value))
                .filter(Boolean)
                .sort()
                .join("|");

        const selectedTypesKey = normalizeList(selectedProductTypes);
        const mesa =
            tableProducts.find(
                (item) =>
                    normalizeList(item.product_types || []) === selectedTypesKey,
            ) || tableProducts.find((item) => {
                const itemTypes = normalizeList(item.product_types || []);
                return (
                    selectedProductTypes.length > 0 &&
                    selectedProductTypes.some((selected) =>
                        itemTypes.includes(normalizeText(selected)),
                    )
                );
            });

        const normalizedMesaName = normalizeText(mesa?.name || "");
        let sigla = "";

        if (normalizedMesaName.includes("OLEO")) {
            sigla = "O";
        } else if (normalizedMesaName.includes("FARELO")) {
            sigla = "F";
        } else if (normalizedMesaName.includes("GRAOS")) {
            sigla = "S";
        }

        return `MR${sigla}${mm}${yy}`;
    };

    const handleExportExcel = async () => {
        try {
            const startDateFormatted = formatIsoYMDToBR(selectData.date_start);
            const endDateFormatted = formatIsoYMDToBR(selectData.date_end);
            const monetaryFields = [
                "total_service_value",
                "liquid_value",
                "adjustment_value",
                "irrf_value",
                "iss",
                "pis_cofins",
                "csll",
                "value_base",
            ];

            const parseMoney = (value: unknown) => {
                if (typeof value === "number") {
                    return value;
                }

                const normalized = String(value ?? "")
                    .replace(/\./g, "")
                    .replace(",", ".")
                    .replace(/[^\d.-]/g, "");

                const parsed = Number(normalized);
                return Number.isNaN(parsed) ? 0 : parsed;
            };

            const tablesResponse =
                await tableProductContext.listTableProducts();
            const tableProducts: ITableProductsData[] =
                tablesResponse?.data || [];
            const reportFileBase = getReportFileBase(tableProducts);

            const siglaToMesa = new Map<string, string>();
            tableProducts.forEach((mesa) => {
                (mesa.product_types || []).forEach((sigla) => {
                    siglaToMesa.set(normalizeText(sigla), mesa.name);
                });
            });

            const dataToExport = [...filteredData].sort((a, b) =>
                compareContracts(
                    String(a.number_contract ?? ""),
                    String(b.number_contract ?? ""),
                ),
            );

            const emptyTotals = {
                total_service_value: 0,
                liquid_value: 0,
                adjustment_value: 0,
                irrf_value: 0,
                iss: 0,
                pis_cofins: 0,
                csll: 0,
                value_base: 0,
            };

            const groupedByMesa = dataToExport.reduce((acc, billing) => {
                const sigla = normalizeText((billing as any).product);
                const mesa = siglaToMesa.get(sigla) || "Sem mesa cadastrada";
                const current = acc.get(mesa) || {
                    items: [] as any[],
                    totals: { ...emptyTotals },
                };

                current.items.push(billing);
                monetaryFields.forEach((field) => {
                    current.totals[field as keyof typeof current.totals] +=
                        parseMoney((billing as any)[field]);
                });

                acc.set(mesa, current);
                return acc;
            }, new Map<string, { items: any[]; totals: typeof emptyTotals }>());

            const generalTotals = dataToExport.reduce(
                (acc, billing) => {
                    monetaryFields.forEach((field) => {
                        acc[field as keyof typeof acc] += parseMoney(
                            (billing as any)[field],
                        );
                    });
                    return acc;
                },
                { ...emptyTotals },
            );

            const exportRows: any[][] = [
                ["MAPA DE RECEBIMENTOS"],
                [`PERÍODO: DE ${startDateFormatted} ATÉ ${endDateFormatted}`],
                [],
                nameColumns.map((col) => col.header),
            ];

            const mesaOrder = Array.from(groupedByMesa.entries()).sort(
                ([a], [b]) => a.localeCompare(b, "pt-BR"),
            );

            mesaOrder.forEach(([mesa, data]) => {
                data.items.forEach((row) => {
                    exportRows.push(
                        nameColumns.map((col) => {
                            const fields = col.field.split(".");
                            let value: any = row;

                            for (const field of fields) {
                                value = value?.[field];
                            }

                            if (monetaryFields.includes(col.field)) {
                                return parseMoney(value);
                            }

                            return value ?? "";
                        }),
                    );
                });

                exportRows.push([
                    `Mesa ${mesa}`,
                    "",
                    "",
                    "",
                    data.totals.total_service_value,
                    data.totals.liquid_value,
                    data.totals.adjustment_value,
                    data.totals.irrf_value,
                    data.totals.iss,
                    data.totals.pis_cofins,
                    data.totals.csll,
                    data.totals.value_base,
                ]);
            });

            exportRows.push([
                "Total Geral",
                "",
                "",
                "",
                generalTotals.total_service_value,
                generalTotals.liquid_value,
                generalTotals.adjustment_value,
                generalTotals.irrf_value,
                generalTotals.iss,
                generalTotals.pis_cofins,
                generalTotals.csll,
                generalTotals.value_base,
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet(exportRows);
            const columnCount = nameColumns.length;
            const totalColumns = Math.max(columnCount, 10);
            const totalGeneralRow = exportRows.length - 1;

            worksheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: columnCount - 1 } },
            ];

            worksheet["!cols"] = [
                ...nameColumns.map((col) => ({
                    wch: Math.max(
                        12,
                        Math.round(Number.parseInt(col.width || "120", 10) / 8),
                    ),
                })),
                ...Array.from({ length: totalColumns - columnCount }, () => ({
                    wch: 15,
                })),
            ];

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

            const totalLabelStyle = {
                font: { bold: true },
                fill: { patternType: "solid", fgColor: { rgb: "E2F0D9" } },
            };

            const moneyTotalStyle = {
                font: { bold: true },
                fill: { patternType: "solid", fgColor: { rgb: "E2F0D9" } },
                numFmt: "#,##0.00",
            };

            const moneyDetailStyle = {
                numFmt: "#,##0.00",
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

            for (let row = 4; row < totalGeneralRow; row += 1) {
                for (let col = 4; col < columnCount; col += 1) {
                    applyStyle(
                        XLSX.utils.encode_cell({ r: row, c: col }),
                        moneyDetailStyle,
                    );
                }
            }

            let currentRow = 4;
            mesaOrder.forEach(([, data]) => {
                currentRow += data.items.length;
                for (let col = 0; col < totalColumns; col += 1) {
                    applyStyle(
                        XLSX.utils.encode_cell({ r: currentRow, c: col }),
                        col === 0 ? totalLabelStyle : moneyTotalStyle,
                    );
                }
                currentRow += 1;
            });

            for (let col = 0; col < totalColumns; col += 1) {
                applyStyle(
                    XLSX.utils.encode_cell({ r: totalGeneralRow, c: col }),
                    col === 0 ? totalLabelStyle : moneyTotalStyle,
                );
            }

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Mapa de Recebimentos",
            );
            XLSX.writeFile(workbook, `${reportFileBase}.xlsx`, {
                bookType: "xlsx",
            });
        } catch (error) {
            toast.error(`Erro ao exportar Excel: ${error}`);
        }
    };

    return (
        <>
            <STitle>Mapa de Recebimento</STitle>
            <SContainerSearchAndButton>
                <CustomSearch
                    width="450px"
                    placeholder="Filtre por Data de Recebimento ou Contrato"
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
                    titleText="Filtros - Mapa de Recebimento"
                    open={isSelectionModal}
                    initialFilters={selectData}
                    onClose={handleCloseModal}
                    onChange={(filters) => setSelectData(filters)}
                    onConfirm={fetchSelectData}
                    visibleFields={[
                        "seller",
                        "buyer",
                        "product_types",
                        "date_start",
                        "date_end",
                        "product",
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

                <Tooltip
                    title={
                        useInfiniteScroll
                            ? "Ativar scroll infinito"
                            : "Voltar para paginação"
                    }
                >
                    <IconButton
                        onClick={() => setUseInfiniteScroll((prev) => !prev)}
                        sx={{ color: "#E7B10A" }}
                    >
                        {!useInfiniteScroll ? <PiScroll /> : <TbInfinity />}
                    </IconButton>
                </Tooltip>
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
        </>
    );
}
