import { useCallback, useEffect, useMemo, useState } from "react";
import IconButton from "@mui/material/IconButton";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import CustomButton from "../../../../components/CustomButton";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import { sortTableData } from "../../../../components/CustomTable/helpers";
import CustomTooltipLabel from "../../../../components/CustomTooltipLabel";
import { CustomSearch } from "../../../../components/CustomSearch";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import useTableSearch from "../../../../hooks/useTableSearch";
import { ContractContext } from "../../../../contexts/ContractContext";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { TableProductContext } from "../../../../contexts/TablesProducts";
import { ITableProductsData } from "../../../../contexts/TablesProducts/types";
import { toast } from "react-toastify";
import * as XLSX from "xlsx-js-style";
import { SContainerSearchAndButton, STitle } from "./styles";

const normalizeText = (value?: string) =>
    (value || "")
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

const arrayToNormalizedList = (value?: string | string[]) => {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeText(item)).filter(Boolean);
    }

    if (typeof value === "string" && value !== "") {
        return [normalizeText(value)];
    }

    return [];
};

const sameProductTypes = (
    left?: string | string[],
    right?: string | string[],
) => {
    const leftList = arrayToNormalizedList(left);
    const rightList = arrayToNormalizedList(right);

    if (leftList.length !== rightList.length) return false;

    const leftSorted = [...leftList].sort();
    const rightSorted = [...rightList].sort();
    return leftSorted.every((value, index) => value === rightSorted[index]);
};

const currentYearFilters = (): SelectState => ({
    seller: "",
    buyer: "",
    year: new Date().getFullYear(),
    product_types: "",
    product: "",
    name_product: "",
});

interface IContractExtended extends IContractData {
    quantity: number;
}

type Mesa = ITableProductsData;

export function GrainsBigger() {
    const contractContext = ContractContext();
    const tableProductContext = TableProductContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [contractsLoaded, setContractsLoaded] = useState(false);
    const [mesasLoaded, setMesasLoaded] = useState(false);
    const [listcontracts, setListContracts] = useState<IContractExtended[]>([]);
    const [allContracts, setAllContracts] = useState<IContractExtended[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("TOTAL");
    const [isSelectionModal, setSelectionModal] = useState<boolean>(false);
    const [useInfiniteScroll, setUseInfiniteScroll] = useState<boolean>(false);
    const [selectData, setSelectData] =
        useState<SelectState>(currentYearFilters());
    const [defaultMesaTypes, setDefaultMesaTypes] = useState<string[]>([]);
    const [tables, setTables] = useState<Mesa[]>([]);
    const [selectedMesaName, setSelectedMesaName] = useState("Grãos");
    const [hasAppliedInitialFilters, setHasAppliedInitialFilters] =
        useState(false);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await contractContext.listContracts();

            const formatted = response.data.map((contract: IContractData) => ({
                ...contract,
                quantity: Number(contract.quantity),
            }));

            setAllContracts(formatted);
            setContractsLoaded(true);
        } catch (error) {
            toast.error(`Erro ao tentar ler contratos: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [contractContext]);

    const fetchTables = useCallback(async () => {
        try {
            const response = await tableProductContext.listTableProducts();
            const loadedTables = response.data ?? [];
            setTables(loadedTables);

            const defaultMesa =
                loadedTables.find(
                    (mesa: Mesa) =>
                        normalizeText(mesa.name) === normalizeText("Grãos"),
                ) ?? loadedTables[0];

            setDefaultMesaTypes(defaultMesa?.product_types ?? []);
            setSelectedMesaName(defaultMesa?.name ?? "Grãos");
        } catch (error) {
            toast.error(`Erro ao tentar ler mesas: ${error}`);
            setDefaultMesaTypes([]);
            setSelectedMesaName("Grãos");
        } finally {
            setMesasLoaded(true);
        }
    }, [tableProductContext]);

    useEffect(() => {
        fetchData();
        fetchTables();
    }, [fetchData, fetchTables]);

    const defaultFilters = useMemo(
        () => ({
            ...currentYearFilters(),
            product_types: defaultMesaTypes,
        }),
        [defaultMesaTypes],
    );

    const applyFilters = useCallback(
        (filters: SelectState, showToast = true) => {
            try {
                setIsLoading(true);

                const yearFilter =
                    filters.year !== undefined && filters.year !== ""
                        ? Number(filters.year)
                        : undefined;

                const selectedProductTypes = arrayToNormalizedList(
                    filters.product_types,
                );
                const effectiveProductTypes =
                    selectedProductTypes.length > 0
                        ? selectedProductTypes
                        : defaultMesaTypes
                              .map((item) => normalizeText(item))
                              .filter(Boolean);

                const filtered = allContracts.filter((contract) => {
                    const contractDate =
                        contract.contract_emission_date?.trim();
                    if (!contractDate) return false;

                    const [, , yearStr] = contractDate.split("/");
                    const year = Number(yearStr);
                    if (!year) return false;

                    const product = normalizeText(contract.product);

                    const matchProductTypes =
                        effectiveProductTypes.length === 0 ||
                        effectiveProductTypes.includes(product);
                    const matchYear = yearFilter ? year === yearFilter : true;

                    return matchProductTypes && matchYear;
                });

                setSelectData({
                    ...filters,
                    product_types:
                        selectedProductTypes.length > 0
                            ? filters.product_types
                            : defaultMesaTypes,
                });
                setListContracts(filtered);

                const currentMesa =
                    tables.find((mesa) =>
                        sameProductTypes(
                            mesa.product_types,
                            selectedProductTypes,
                        ),
                    ) ??
                    tables.find((mesa) =>
                        sameProductTypes(
                            mesa.product_types,
                            defaultMesaTypes.map((item) => normalizeText(item)),
                        ),
                    );
                setSelectedMesaName(currentMesa?.name ?? "Grãos");

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
        [allContracts, defaultMesaTypes, tables],
    );

    useEffect(() => {
        if (contractsLoaded && mesasLoaded && !hasAppliedInitialFilters) {
            applyFilters(defaultFilters, false);
            setHasAppliedInitialFilters(true);
        }
    }, [
        applyFilters,
        contractsLoaded,
        defaultFilters,
        hasAppliedInitialFilters,
        mesasLoaded,
    ]);

    const handleSelectionModal = () => setSelectionModal((prev) => !prev);
    const handleCloseModal = () => setSelectionModal(false);

    const isInitialFilter = useMemo(
        () =>
            Number(selectData.year ?? 0) === Number(defaultFilters.year ?? 0) &&
            sameProductTypes(
                selectData.product_types,
                defaultFilters.product_types,
            ),
        [defaultFilters.product_types, defaultFilters.year, selectData],
    );

    const handleClearFilterModal = () => {
        setSelectData(defaultFilters);
        applyFilters(defaultFilters);
        setSelectionModal(false);
    };

    const handleConfirmFilters = (filters: SelectState) => {
        const nextFilters = {
            ...filters,
            product_types:
                arrayToNormalizedList(filters.product_types).length > 0
                    ? filters.product_types
                    : defaultMesaTypes,
        };
        applyFilters(nextFilters);
    };

    const { filteredData } = useTableSearch({
        data: listcontracts,
        searchTerm,
        searchableFields: ["seller.name", "product", "number_broker"],
    });

    const pivotData = useMemo(() => {
        const selectedProductsFromFilter = arrayToNormalizedList(
            selectData.product_types,
        );
        const selectedProducts = selectedProductsFromFilter.filter((product) =>
            filteredData.some(
                (contract) => normalizeText(contract.product) === product,
            ),
        );

        const productOrder =
            selectedProducts.length > 0
                ? selectedProducts
                : Array.from(
                      new Set(
                          filteredData
                              .map((contract) =>
                                  normalizeText(contract.product),
                              )
                              .filter(Boolean),
                      ),
                  ).sort();

        type PivotRow = {
            seller: string;
            TOTAL: number;
            [product: string]: string | number;
        };

        const sellerMap = new Map<string, PivotRow>();

        filteredData.forEach((item) => {
            const sellerName =
                item.seller?.name?.toUpperCase() ?? "DESCONHECIDO";
            const product = normalizeText(item.product);
            if (!product) return;

            const quantity = Number(item.quantity) / 1000 || 0;

            if (
                selectedProducts.length > 0 &&
                !selectedProducts.includes(product)
            ) {
                return;
            }

            if (!sellerMap.has(sellerName)) {
                sellerMap.set(sellerName, { seller: sellerName, TOTAL: 0 });
            }

            const sellerEntry = sellerMap.get(sellerName)!;
            sellerEntry[product] = Number(sellerEntry[product] || 0) + quantity;
            sellerEntry.TOTAL += quantity;
        });

        const rows = Array.from(sellerMap.values()).sort(
            (a, b) => b.TOTAL - a.TOTAL,
        );

        return { rows, products: productOrder };
    }, [filteredData, selectData.product_types]);

    const displayedData = useMemo(
        () => sortTableData(pivotData.rows, orderBy, order),
        [order, orderBy, pivotData.rows],
    );

    const nameColumns: IColumn[] = useMemo(() => {
        const base = [
            {
                field: "seller",
                header: "VENDEDOR",
                width: "350px",
            },
        ];

        const productCols = pivotData.products.map((product) => ({
            field: product,
            header: product,
            width: "120px",
        }));

        const totalCol = {
            field: "TOTAL",
            header: "TOTAL",
            width: "150px",
        };

        return [...base, ...productCols, totalCol];
    }, [pivotData.products]);

    const formatNumber = (value: unknown) => {
        if (value === null || value === undefined || value === "") {
            return "";
        }

        const numericValue =
            typeof value === "number"
                ? value
                : Number(
                      String(value ?? "")
                          .replace(/\./g, "")
                          .replace(",", ".")
                          .replace(/[^\d.-]/g, ""),
                  );

        return Number.isFinite(numericValue) ? numericValue : "";
    };

    const buildFileName = () => {
        const yearValue = Number(selectData.year ?? new Date().getFullYear());
        const safeMesaName = (selectedMesaName || "Ranking")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[\\/:*?"<>|]/g, "-")
            .trim();

        return `Ranking ${safeMesaName} ${yearValue}.xlsx`;
    };

    const buildReportTitle = () => {
        const yearValue = Number(selectData.year ?? new Date().getFullYear());
        return `Ranking ${selectedMesaName} ${yearValue}`;
    };

    const isNumericColumn = (field: string) => field !== "seller";

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageSize = 40;
        const reportTitle = buildReportTitle();
        const printColumnWidths = nameColumns.map((col) => {
            if (col.field === "seller") return "180px";
            if (col.field === "TOTAL") return "78px";
            return "62px";
        });

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
                    h4 { text-align: center; margin-bottom: 8px; font-size: 10px; }
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
                    td.num { text-align: right; }
                    td.text { text-align: left; }
                    tr.total-row td {
                        background: #e2f0d9;
                        font-weight: bold;
                    }
                    .page-break { page-break-after: always; }
                    .print-header {
                        margin-bottom: 6px;
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h3>Ary Oleofar</h3>
                    <h4>${reportTitle}</h4>
                </div>
    `);

        const rows = displayedData;
        const columns = nameColumns;

        for (let i = 0; i < rows.length; i += pageSize) {
            const pageRows = rows.slice(i, i + pageSize);

            printWindow.document.write(`<table><thead><tr>`);
            columns.forEach((col, index) => {
                printWindow.document.write(
                    `<th style="width: ${printColumnWidths[index]};">${col.header}</th>`,
                );
            });
            printWindow.document.write(`</tr></thead><tbody>`);

            pageRows.forEach((row) => {
                printWindow.document.write(`<tr>`);
                columns.forEach((col) => {
                    const value = row[col.field];
                    const formatted = isNumericColumn(col.field)
                        ? formatNumber(value).toLocaleString("pt-BR", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                          })
                        : (value ?? "");
                    printWindow.document.write(
                        `<td class="${isNumericColumn(col.field) ? "num" : "text"}">${formatted}</td>`,
                    );
                });
                printWindow.document.write(`</tr>`);
            });

            printWindow.document.write(`</tbody></table>`);

            if (i + pageSize < rows.length) {
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
            const exportRows = [
                [buildReportTitle()],
                [],
                nameColumns.map((col) => col.header),
                ...displayedData.map((row) =>
                    nameColumns.map((col) => {
                        const value = row[col.field];
                        return isNumericColumn(col.field)
                            ? formatNumber(value)
                            : (value ?? "");
                    }),
                ),
            ];

            const worksheet = XLSX.utils.aoa_to_sheet(exportRows);
            const columnCount = nameColumns.length;

            worksheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } },
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
                    XLSX.utils.encode_cell({ r: 2, c: col }),
                    headerStyle,
                );
            }

            for (let row = 3; row < exportRows.length; row += 1) {
                for (let col = 0; col < columnCount; col += 1) {
                    const style = col === 0 ? textStyle : numberStyle;
                    applyStyle(
                        XLSX.utils.encode_cell({ r: row, c: col }),
                        style,
                    );
                }
            }

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Ranking");
            XLSX.writeFile(workbook, buildFileName(), {
                bookType: "xlsx",
            });
        } catch (error) {
            toast.error(`Erro ao exportar Excel: ${error}`);
        }
    };

    return (
        <>
            <STitle>Ranking - {selectedMesaName}</STitle>
            <SContainerSearchAndButton>
                <CustomSearch
                    width="450px"
                    placeholder="Filtre por Vendedor"
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
                    titleText={`Ranking - ${selectedMesaName}`}
                    open={isSelectionModal}
                    initialFilters={selectData}
                    onClose={handleCloseModal}
                    onChange={(filters) => setSelectData(filters)}
                    onConfirm={handleConfirmFilters}
                    visibleFields={["year", "product_types"]}
                    defaultMesaName="Grãos"
                    allowEmptyMesa={false}
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
        </>
    );
}
