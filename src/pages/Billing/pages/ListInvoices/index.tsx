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
        ],
        [],
    );

    const displayedData = useMemo(
        () => sortTableData([...filteredData], orderBy, order),
        [filteredData, orderBy, order],
    );

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageSize = 25;

        printWindow.document.write(`
        <html>
            <head>
                <title>Listagem de NFSe</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    th, td { border: 1px solid black; padding: 4px; font-size: 7px; }
                    .page-break { page-break-after: always; }
                    h3 { text-align: left; }
                    h4 { text-align: left; }
                </style>
            </head>
            <body>
                <h3>Ary Oleofar</h3>
                <h4>Listagem de NFSe</h4>
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
                        const num = Number(value) || 0;
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

    const handleExportCSV = () => {
        const headers = nameColumns
            .filter((col) => col.field)
            .map((col) => `"${col.header}"`)
            .join(";");

        const rows = displayedData.map((row) => {
            return nameColumns
                .filter((col) => col.field)
                .map((col) => {
                    let value: any = getNestedValue(row, col.field);

                    if (DATE_FIELDS.includes(col.field)) {
                        value = formatDateBR(value) || "";
                    } else if (CURRENCY_FIELDS.includes(col.field)) {
                        const num = Number(value) || 0;
                        value = num.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });
                    }

                    return `"${value ?? ""}"`;
                })
                .join(";");
        });

        const BOM = "﻿";
        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([BOM + csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "listagem-nfse.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    onClick={handleExportCSV}
                >
                    Exportar CSV
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
