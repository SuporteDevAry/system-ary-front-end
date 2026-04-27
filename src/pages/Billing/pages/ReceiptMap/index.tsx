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
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import { sortTableData } from "../../../../components/CustomTable/helpers";

export function ReceiptMap() {
    const contractContext = ContractContext();
    const billingContext = BillingContext();
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

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageSize = 25;

        const formatIsoYMDToBR = (iso?: string) => {
            if (!iso) return "";
            const [y, m, d] = iso.split("-").map(Number);
            if (!y || !m || !d) return "";
            const dd = String(d).padStart(2, "0");
            const mm = String(m).padStart(2, "0");
            return `${dd}/${mm}/${y}`;
        };

        const startDateFormatted = formatIsoYMDToBR(selectData.date_start);
        const endDateFormatted = formatIsoYMDToBR(selectData.date_end);

        printWindow.document.write(`
        <html>
            <head>
                <title>Mapa de Recebimento</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 80%; border-collapse: collapse; margin-bottom: 10px; }
                    th, td { border: 1px solid black; padding: 5px; font-size: 8px; }
                    .page-break { page-break-after: always; }
                    h3 { text-align: left; margin: 0; }
                    h4, h5, h6 { text-align: center; margin: 4px 0; }
                    h2 { text-align: center; }
                </style>
            </head>
            <body>
                <h3>Ary Oleofar</h3>
                <h4>Mapa de Recebimento</h4>
                <h6>DE: ${startDateFormatted} ATÉ ${endDateFormatted}</h6>
        `);

        for (let i = 0; i < displayedData.length; i += pageSize) {
            const pageRows = displayedData.slice(i, i + pageSize);

            printWindow.document.write(`<table><thead><tr>`);
            nameColumns.forEach((col) => {
                printWindow.document.write(
                    `<th style="width: ${col.width}px;">${col.header}</th>`,
                );
            });
            printWindow.document.write(`</tr></thead><tbody>`);

            pageRows.forEach((row) => {
                printWindow.document.write(`<tr>`);
                nameColumns.forEach((col) => {
                    const fields = col.field.split(".");
                    let value: any = row;
                    for (const f of fields) {
                        value = value?.[f];
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

        // Chrome: aguardar carregamento antes de imprimir
        const printAndClose = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
        // onload pode não disparar sempre, então usar fallback com setTimeout
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

    const handleExportCSV = () => {
        const startDateFormatted = formatIsoYMDToBR(selectData.date_start);
        const endDateFormatted = formatIsoYMDToBR(selectData.date_end);

        // Cabeçalho do relatório
        const headerTitle = "MAPA DE RECEBIMENTOS";
        const headerDate = `DE: ${startDateFormatted} ATÉ ${endDateFormatted}`;

        // Cabeçalho das colunas
        const headers = nameColumns
            .filter((col) => col.field)
            .map((col) => `"${col.header}"`)
            .join(";");

        // Linhas de dados
        const rows = displayedData.map((row) => {
            return nameColumns
                .filter((col) => col.field)
                .map((col) => {
                    const fields = col.field!.split(".");
                    let value: any = row;

                    for (const f of fields) {
                        value = value?.[f];
                    }

                    // Corrige campos numéricos com vírgula decimal
                    if (
                        [
                            "total_service_value",
                            "liquid_value",
                            "adjustment_value",
                            "irrf_value",
                            "iss",
                            "pis_cofins",
                            "csll",
                        ].includes(col.field!)
                    ) {
                        const number = parseFloat(
                            String(value).replace(",", "."),
                        );
                        if (!isNaN(number)) {
                            value = number.toFixed(2).replace(".", ",");
                        }
                    }

                    return `"${value ?? ""}"`;
                })
                .join(";");
        });

        // Gera conteúdo CSV com cabeçalho adicional
        const BOM = "\uFEFF"; // evita erro de acentuação
        const csvContent = [
            headerTitle,
            headerDate,
            "", // linha em branco entre cabeçalho e colunas
            headers,
            ...rows,
        ].join("\n");

        // Cria e baixa o arquivo
        const blob = new Blob([BOM + csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "mapa-de-recebimento.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    onClick={handleExportCSV}
                >
                    Exportar CSV
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
