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
import { BrokerContext } from "../../../../contexts/BrokerContext";
import { IBroker } from "../../../../contexts/BrokerContext/types";
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

function parseFlexibleDate(value?: string) {
    const normalizedValue = String(value ?? "").trim();
    if (!normalizedValue) return null;

    const dateText = normalizedValue.split(/[T ]/)[0];
    const parts = dateText.split(/[\/.-]/).filter(Boolean);
    if (parts.length !== 3) return null;

    const numbers = parts.map(Number);
    if (numbers.some((part) => !Number.isInteger(part))) return null;

    const [first, second, third] = numbers;
    const year = parts[0].length === 4 ? first : third;
    const month = second;
    const day = parts[0].length === 4 ? third : first;
    if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31)
        return null;

    const date = new Date(year, month - 1, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    )
        return null;

    date.setHours(0, 0, 0, 0);
    return date;
}

function parseContractCode(numberContract?: string) {
    const raw = String(numberContract ?? "").trim();
    if (!raw) return { letter: "", brokerNumber: "" };

    const letter = (raw.match(/^[a-z]+/i)?.[0] ?? "").toUpperCase();
    const dotIndex = raw.indexOf(".");
    if (dotIndex === -1) return { letter, brokerNumber: "" };

    const afterDot = raw.slice(dotIndex + 1);
    const digitsMatch = afterDot.match(/^\d+/);

    return { letter, brokerNumber: digitsMatch ? digitsMatch[0] : "" };
}

function findMatchingBrokers(
    brokers: IBroker[],
    letter: string,
    brokerNumber: string,
    contractEmissionDate?: string,
) {
    if (!letter || !brokerNumber) return [];

    const emissionDate = parseFlexibleDate(contractEmissionDate);
    if (!emissionDate) return [];

    return brokers.filter((broker) => {
        const brokerCode = String(broker.broker ?? "")
            .trim()
            .toUpperCase();
        const brokerProduct = String(broker.product ?? "")
            .trim()
            .toUpperCase();

        if (brokerCode !== brokerNumber.toUpperCase()) return false;
        if (brokerProduct !== letter) return false;

        const startDate = parseFlexibleDate(broker.date_ini);
        const endDate = parseFlexibleDate(broker.date_fin);
        if (!startDate || !endDate) return false;

        return emissionDate >= startDate && emissionDate <= endDate;
    });
}

export function CommissionReport() {
    const contractContext = ContractContext();
    const billingContext = BillingContext();
    const brokerContext = BrokerContext();
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
    const [maxBrokerColumns, setMaxBrokerColumns] = useState<number>(1);

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
                            { toastId: "commission-report-filter" },
                        );
                    } else {
                        toast.info("Nenhum contrato encontrado", {
                            toastId: "commission-report-filter",
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
            const responseBrokers = await brokerContext.listBrokers();

            const contractList =
                responseContract?.data || responseContract || [];
            const brokerList: IBroker[] =
                responseBrokers?.data || responseBrokers || [];

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
                    const limitJunho2026 = new Date(2026, 5, 30); // 30/06/2026

                    if (
                        receiptDate > limit2025 &&
                        receiptDate <= limitMarco2026
                    ) {
                        // Faixa 1: Superior a 31/12/2025 e Inferior/Igual a 31/03/2026
                        csll_value = total_service * 0.0288; // 2.88%
                    } else if (
                        receiptDate > limitMarco2026 &&
                        receiptDate <= limitJunho2026
                    ) {
                        // Faixa 2: Superior a 31/03/2026 e Inferior/Igual a 30/06/2026
                        csll_value = total_service * 0.032; // 3.2%
                    } else if (receiptDate > limitJunho2026) {
                        // Faixa 3: A partir de 01/07/2026
                        csll_value = total_service * 0.0348; // 3.48%
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

                const contractEmissionDate =
                    contract?.contract_emission_date || "";

                const { letter, brokerNumber } = parseContractCode(
                    billing.number_contract,
                );
                const matchedBrokers = findMatchingBrokers(
                    brokerList,
                    letter,
                    brokerNumber,
                    contractEmissionDate,
                );

                const formatValue = (num: number) =>
                    num.toFixed(2).replace(".", ",");

                const baseRow = {
                    ...billing,
                    total_service_value: formatValue(total_service),
                    liquid_value: formatValue(liquid),
                    adjustment_value: formatValue(adjustment),
                    irrf_value: formatValue(irrf),
                    iss: formatValue(iss),
                    pis_cofins: formatValue(piscofins),
                    csll: formatValue(csll_value),
                    value_base: formatValue(tot_base),
                    commission: "0,00",
                    commission_ary: formatValue(tot_base),
                    contract_emission_date: contractEmissionDate,
                    seller_name: contract?.seller.name || "",
                    buyer_name: contract?.buyer.name || "",
                    product: contract?.product || "",
                };

                const brokers = matchedBrokers.map((matchedBroker) => {
                    const commissionPercent =
                        Number(matchedBroker.commision) || 0;
                    const commission_value =
                        tot_base * (commissionPercent / 100);

                    return {
                        nick: matchedBroker.broker_nick || "",
                        commission: formatValue(commission_value),
                    };
                });

                const totalCommission = brokers.reduce(
                    (sum, broker) =>
                        sum + parseFloat(broker.commission.replace(",", ".")),
                    0,
                );

                return {
                    ...baseRow,
                    commission: formatValue(totalCommission),
                    commission_ary: formatValue(tot_base - totalCommission),
                    brokers,
                };
            });

            // Cada broker vinculado ao contrato é exibido em colunas próprias
            // (Broker N / Comissão N) subsequentes ao Valor Base, sem agrupar.
            const resolvedMaxBrokers = Math.max(
                1,
                updatedBilling.reduce(
                    (max: number, row: any) =>
                        Math.max(max, row.brokers.length),
                    0,
                ),
            );

            const flattenedBilling = updatedBilling.map((row: any) => {
                const { brokers, ...rest } = row;
                const brokerFields: Record<string, string> = {};

                for (let index = 0; index < resolvedMaxBrokers; index += 1) {
                    const position = index + 1;
                    brokerFields[`broker_nick_${position}`] =
                        brokers[index]?.nick ?? "";
                    brokerFields[`broker_commission_${position}`] =
                        brokers[index]?.commission ?? "0,00";
                }

                return { ...rest, ...brokerFields };
            });

            setMaxBrokerColumns(resolvedMaxBrokers);
            setAllBillings(flattenedBilling);
            setListBillings(flattenedBilling);
        } catch (error) {
            toast.error(`Erro ao tentar ler recebimentos: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [billingContext, contractContext, brokerContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Aplica o filtro inicial automaticamente ao carregar os dados
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
            {
                field: "commission",
                header: "Comissão",
                headerTooltip: "Soma da comissão dos brokers",
                width: "150px",
                align: "right",
            },
            {
                field: "commission_ary",
                header: "Comissão Ary",
                headerTooltip: "Valor Base menos a Comissão",
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

        const monetaryFields = nameColumns
            .filter((col) => (col as any).align === "right")
            .map((col) => col.field);

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

        const emptyTotals: Record<string, number> = Object.fromEntries(
            monetaryFields.map((field) => [field, 0]),
        );

        const groupedByMesa = dataToPrint.reduce((acc, billing) => {
            const sigla = normalizeText((billing as any).product);
            const mesa = siglaToMesa.get(sigla) || "Sem mesa cadastrada";
            const current = acc.get(mesa) || {
                items: [] as any[],
                totals: { ...emptyTotals },
            };

            current.items.push(billing);
            monetaryFields.forEach((field) => {
                current.totals[field] += parseMoney((billing as any)[field]);
            });

            acc.set(mesa, current);
            return acc;
        }, new Map<string, { items: any[]; totals: Record<string, number> }>());

        const generalTotals = dataToPrint.reduce(
            (acc, billing) => {
                monetaryFields.forEach((field) => {
                    acc[field] += parseMoney((billing as any)[field]);
                });
                return acc;
            },
            { ...emptyTotals },
        );

        const columns = nameColumns.map((col) => col.header);

        const numericColumnIndexes = new Set(
            nameColumns.reduce<number[]>((acc, col, index) => {
                if ((col as any).align === "right") acc.push(index);
                return acc;
            }, []),
        );

        const colWidths = nameColumns.map((col) => col.width || "120px");

        const buildTotalsRowHtml = (
            label: string,
            totals: Record<string, number>,
        ) =>
            nameColumns
                .map((col, index) => {
                    if (index === 0) return `<td>${label}</td>`;
                    if (monetaryFields.includes(col.field)) {
                        return `<td class="num">${formatMoney(totals[col.field] ?? 0)}</td>`;
                    }
                    return "<td></td>";
                })
                .join("");

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
                <h4>Relatório de Comissão</h4>
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
                                        `<th class="${numericColumnIndexes.has(index) ? "num" : ""}">${header}</th>`,
                                )
                                .join("")}
                        </tr>
                    </thead>
                    <tbody>
        `);

        mesaOrder.forEach(([mesa, data]) => {
            data.items.forEach((row) => {
                const values = nameColumns.map((col) => {
                    const raw = (row as any)[col.field];
                    if (monetaryFields.includes(col.field)) {
                        return formatMoney(raw);
                    }
                    return raw !== undefined && raw !== null ? String(raw) : "";
                });

                printWindow.document.write(`
                    <tr>
                        ${values
                            .map(
                                (value, index) =>
                                    `<td class="${numericColumnIndexes.has(index) ? "num" : ""}">${value}</td>`,
                            )
                            .join("")}
                    </tr>
                `);
            });

            printWindow.document.write(`
                <tr class="mesa-total">
                    ${buildTotalsRowHtml(`Mesa ${mesa}`, data.totals)}
                </tr>
            `);
        });

        printWindow.document.write(`
            <tr class="total-geral">
                ${buildTotalsRowHtml("Total Geral", generalTotals)}
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
        const yy = String(year || "")
            .slice(-2)
            .padStart(2, "0");

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
                    normalizeList(item.product_types || []) ===
                    selectedTypesKey,
            ) ||
            tableProducts.find((item) => {
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

        return `RC${sigla}${mm}${yy}`;
    };

    const handleExportExcel = async () => {
        try {
            const startDateFormatted = formatIsoYMDToBR(selectData.date_start);
            const endDateFormatted = formatIsoYMDToBR(selectData.date_end);
            const monetaryFields = nameColumns
                .filter((col) => (col as any).align === "right")
                .map((col) => col.field);

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

            const emptyTotals: Record<string, number> = Object.fromEntries(
                monetaryFields.map((field) => [field, 0]),
            );

            const groupedByMesa = dataToExport.reduce((acc, billing) => {
                const sigla = normalizeText((billing as any).product);
                const mesa = siglaToMesa.get(sigla) || "Sem mesa cadastrada";
                const current = acc.get(mesa) || {
                    items: [] as any[],
                    totals: { ...emptyTotals },
                };

                current.items.push(billing);
                monetaryFields.forEach((field) => {
                    current.totals[field] += parseMoney(
                        (billing as any)[field],
                    );
                });

                acc.set(mesa, current);
                return acc;
            }, new Map<string, { items: any[]; totals: Record<string, number> }>());

            const generalTotals = dataToExport.reduce(
                (acc, billing) => {
                    monetaryFields.forEach((field) => {
                        acc[field] += parseMoney((billing as any)[field]);
                    });
                    return acc;
                },
                { ...emptyTotals },
            );

            const buildTotalsRow = (
                label: string,
                totals: Record<string, number>,
            ) =>
                nameColumns.map((col, index) => {
                    if (index === 0) return label;
                    if (monetaryFields.includes(col.field)) {
                        return totals[col.field] ?? 0;
                    }
                    return "";
                });

            const mesaOrder = Array.from(groupedByMesa.entries()).sort(
                ([a], [b]) => a.localeCompare(b, "pt-BR"),
            );

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

            const buildContractsSheet = () => {
                const exportRows: any[][] = [
                    ["RELATÓRIO DE COMISSÃO"],
                    [
                        `PERÍODO: DE ${startDateFormatted} ATÉ ${endDateFormatted}`,
                    ],
                    [],
                    nameColumns.map((col) => col.header),
                ];

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

                    exportRows.push(
                        buildTotalsRow(`Mesa ${mesa}`, data.totals),
                    );
                });

                exportRows.push(buildTotalsRow("Total Geral", generalTotals));

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
                            Math.round(
                                Number.parseInt(col.width || "120", 10) / 8,
                            ),
                        ),
                    })),
                    ...Array.from(
                        { length: totalColumns - columnCount },
                        () => ({
                            wch: 15,
                        }),
                    ),
                ];

                const currentWorkbookSheet = worksheet;
                const applyStyleToContracts = (cellRef: string, style: any) => {
                    if (currentWorkbookSheet[cellRef]) {
                        currentWorkbookSheet[cellRef].s = style;
                    }
                };

                for (let col = 0; col < columnCount; col += 1) {
                    applyStyleToContracts(
                        XLSX.utils.encode_cell({ r: 0, c: col }),
                        titleStyle,
                    );
                    applyStyleToContracts(
                        XLSX.utils.encode_cell({ r: 1, c: col }),
                        periodStyle,
                    );
                    applyStyleToContracts(
                        XLSX.utils.encode_cell({ r: 3, c: col }),
                        headerStyle,
                    );
                }

                for (let row = 4; row < totalGeneralRow; row += 1) {
                    for (let col = 4; col < columnCount; col += 1) {
                        if (!monetaryFields.includes(nameColumns[col].field))
                            continue;
                        applyStyleToContracts(
                            XLSX.utils.encode_cell({ r: row, c: col }),
                            moneyDetailStyle,
                        );
                    }
                }

                let currentRow = 4;
                mesaOrder.forEach(([, data]) => {
                    currentRow += data.items.length;
                    for (let col = 0; col < totalColumns; col += 1) {
                        applyStyleToContracts(
                            XLSX.utils.encode_cell({ r: currentRow, c: col }),
                            col === 0 ? totalLabelStyle : moneyTotalStyle,
                        );
                    }
                    currentRow += 1;
                });

                for (let col = 0; col < totalColumns; col += 1) {
                    applyStyleToContracts(
                        XLSX.utils.encode_cell({ r: totalGeneralRow, c: col }),
                        col === 0 ? totalLabelStyle : moneyTotalStyle,
                    );
                }

                return worksheet;
            };

            const buildCommissionSheet = () => {
                const commissionNickMap = new Map<string, string>();

                dataToExport.forEach((row: any) => {
                    for (let index = 1; index <= maxBrokerColumns; index += 1) {
                        const nick = String(
                            row[`broker_nick_${index}`] ?? "",
                        ).trim();
                        if (!nick) continue;

                        const key = normalizeText(nick);
                        if (!commissionNickMap.has(key)) {
                            commissionNickMap.set(key, nick);
                        }
                    }
                });

                const commissionHeaders = Array.from(
                    commissionNickMap.entries(),
                )
                    .map(([key, nick]) => ({ key, nick }))
                    .sort((a, b) =>
                        a.nick.localeCompare(b.nick, "pt-BR", {
                            numeric: true,
                            sensitivity: "base",
                        }),
                    );

                const commissionRows = dataToExport.map((row: any) => {
                    const commissionsByBroker = new Map<string, number>();

                    for (let index = 1; index <= maxBrokerColumns; index += 1) {
                        const nick = String(
                            row[`broker_nick_${index}`] ?? "",
                        ).trim();
                        if (!nick) continue;

                        const commissionValue = parseMoney(
                            row[`broker_commission_${index}`],
                        );
                        commissionsByBroker.set(
                            normalizeText(nick),
                            commissionValue,
                        );
                    }

                    return {
                        receipt_date: row.receipt_date ?? "",
                        contract_emission_date:
                            row.contract_emission_date ?? "",
                        number_contract: row.number_contract ?? "",
                        commissionsByBroker,
                    };
                });

                const commissionTotals = new Map<string, number>();
                const commissionTotalSum = commissionRows.reduce((sum, row) => {
                    commissionHeaders.forEach((broker) => {
                        const brokerValue =
                            row.commissionsByBroker.get(broker.key) ?? 0;
                        commissionTotals.set(
                            broker.key,
                            (commissionTotals.get(broker.key) ?? 0) +
                                brokerValue,
                        );
                        sum += brokerValue;
                    });

                    return sum;
                }, 0);

                const exportRows: any[][] = [
                    [
                        "Dt.Recebto",
                        "Dt.Contrato",
                        "Contrato",
                        ...commissionHeaders.map((broker) => broker.nick),
                        "Total Comissão",
                    ],
                    ...commissionRows.map((row) => [
                        row.receipt_date,
                        row.contract_emission_date,
                        row.number_contract,
                        ...commissionHeaders.map(
                            (broker) =>
                                row.commissionsByBroker.get(broker.key) ?? "",
                        ),
                        commissionHeaders.reduce(
                            (sum, broker) =>
                                sum +
                                (row.commissionsByBroker.get(broker.key) ?? 0),
                            0,
                        ),
                    ]),
                    [
                        "Total",
                        "",
                        "",
                        ...commissionHeaders.map(
                            (broker) => commissionTotals.get(broker.key) ?? 0,
                        ),
                        commissionTotalSum,
                    ],
                ];

                const worksheet = XLSX.utils.aoa_to_sheet(exportRows);
                const columnCount = 4 + commissionHeaders.length;

                worksheet["!cols"] = [
                    { wch: 14 },
                    { wch: 14 },
                    { wch: 20 },
                    ...commissionHeaders.map((broker) => ({
                        wch: Math.max(14, broker.nick.length + 2),
                    })),
                    { wch: 16 },
                ];

                const commissionHeaderStyle = {
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

                const commissionTextStyle = {
                    alignment: { horizontal: "left", vertical: "center" },
                };

                const commissionMoneyStyle = {
                    alignment: { horizontal: "right", vertical: "center" },
                    numFmt: "#,##0.00",
                };

                const applyStyleToCommission = (
                    cellRef: string,
                    style: any,
                ) => {
                    if (worksheet[cellRef]) {
                        worksheet[cellRef].s = style;
                    }
                };

                for (let col = 0; col < columnCount; col += 1) {
                    applyStyleToCommission(
                        XLSX.utils.encode_cell({ r: 0, c: col }),
                        commissionHeaderStyle,
                    );
                }

                for (let row = 1; row < exportRows.length; row += 1) {
                    for (let col = 0; col < 3; col += 1) {
                        applyStyleToCommission(
                            XLSX.utils.encode_cell({ r: row, c: col }),
                            commissionTextStyle,
                        );
                    }

                    for (let col = 3; col < columnCount; col += 1) {
                        applyStyleToCommission(
                            XLSX.utils.encode_cell({ r: row, c: col }),
                            commissionMoneyStyle,
                        );
                    }
                }

                const totalRowIndex = exportRows.length - 1;
                applyStyleToCommission(
                    XLSX.utils.encode_cell({ r: totalRowIndex, c: 0 }),
                    totalLabelStyle,
                );
                for (let col = 1; col < columnCount; col += 1) {
                    applyStyleToCommission(
                        XLSX.utils.encode_cell({ r: totalRowIndex, c: col }),
                        moneyTotalStyle,
                    );
                }

                return worksheet;
            };

            const worksheet = buildContractsSheet();
            const commissionWorksheet = buildCommissionSheet();

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Contratos");
            XLSX.utils.book_append_sheet(
                workbook,
                commissionWorksheet,
                "Comissão",
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
            <STitle>Relatório de Comissão</STitle>
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
                    titleText="Filtros - Relatório de Comissão"
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
