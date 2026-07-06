import { useCallback, useEffect, useMemo, useState } from "react";
import IconButton from "@mui/material/IconButton";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import { toast } from "react-toastify";
import CustomButton from "../../../../components/CustomButton";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import CustomTooltipLabel from "../../../../components/CustomTooltipLabel";
import { CustomSearch } from "../../../../components/CustomSearch";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import useTableSearch from "../../../../hooks/useTableSearch";
import { ContractContext } from "../../../../contexts/ContractContext";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { TableProductContext } from "../../../../contexts/TablesProducts";
import { ITableProductsData } from "../../../../contexts/TablesProducts/types";
import { SContainerSearchAndButton, STitle } from "./styles";
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

const currentYearFilters = (): SelectState => {
    const today = new Date();

    return {
        seller: "",
        buyer: "",
        year: today.getFullYear(),
        product_types: "",
        product: "",
        name_product: "",
    };
};

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

const isDynamicFinancialField = (field: string) =>
    field === "TOTALCALC" ||
    field.startsWith("S_CN") ||
    /^[A-Z0-9]+_\d+$/.test(field);

interface IContractExtended extends IContractData {
    type_commission_seller: string;
    type_commission_buyer: string;
    type_commission: string;
    resp_commission: string;
    commission_value: number;
}

type Mesa = ITableProductsData;

export function Invoicing() {
    const contractContext = ContractContext();
    const tableProductContext = TableProductContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [contractsLoaded, setContractsLoaded] = useState(false);
    const [mesasLoaded, setMesasLoaded] = useState(false);
    const [allContracts, setAllContracts] = useState<IContractExtended[]>([]);
    const [listcontracts, setListContracts] = useState<IContractExtended[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [orderBy, setOrderBy] = useState<string>("mesAnoSort");
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

            const updatedContracts = response.data.map(
                (contract: {
                    total_contract_value: any;
                    commission_seller: any;
                    commission_buyer: any;
                    type_commission_seller: any;
                    type_commission_buyer: any;
                    type_commission: any;
                    resp_commission: any;
                    commission: any;
                    quantity: any;
                    product: any;
                }) => {
                    const validProducts = ["O", "F", "OC", "OA", "SB", "EP"];
                    const quantityTon = validProducts.includes(contract.product)
                        ? Number(contract.quantity) / 1
                        : Number(contract.quantity) / 1000;

                    const total = parseLocaleNumber(
                        contract.total_contract_value,
                    );
                    const sellerCommission = parseLocaleNumber(
                        contract.commission_seller,
                    );
                    const buyerCommission = parseLocaleNumber(
                        contract.commission_buyer,
                    );
                    const commission =
                        sellerCommission === 0
                            ? buyerCommission
                            : sellerCommission;

                    const type_commission =
                        contract.commission_seller != 0
                            ? contract.type_commission_seller == "Percentual"
                                ? "P"
                                : "V"
                            : contract.type_commission_buyer != 0
                              ? contract.type_commission_buyer == "Percentual"
                                  ? "P"
                                  : "V"
                              : "?";

                    const commissionValue =
                        type_commission == "P"
                            ? (total * commission) / 100
                            : commission;

                    const resp_commission =
                        contract.commission_seller == 0 ? "C" : "V";

                    return {
                        ...contract,
                        quantity: quantityTon,
                        type_commission,
                        resp_commission,
                        commission,
                        commission_value: commissionValue,
                    };
                },
            );

            setAllContracts(updatedContracts);
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
            const tables = response.data ?? [];
            setTables(tables);

            const defaultMesa =
                tables.find(
                    (mesa: Mesa) =>
                        normalizeText(mesa.name) === normalizeText("Grãos"),
                ) ?? tables[0];

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

                    const [, monthStr, yearStr] = contractDate.split("/");
                    const month = Number(monthStr);
                    const year = Number(yearStr);
                    if (!month || !year) return false;

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

    const isInitialFilter = useMemo(() => {
        return (
            Number(selectData.year ?? 0) === Number(defaultFilters.year ?? 0) &&
            sameProductTypes(
                selectData.product_types,
                defaultFilters.product_types,
            )
        );
    }, [defaultFilters.product_types, defaultFilters.year, selectData]);

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
        searchableFields: ["mesAno", "product_types", "broker"],
    });

    const pivotData = useMemo(() => {
        const meses = [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
        ];

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

        const comboMap = new Map<string, string>();
        const comboSet = new Set<string>();
        const dataMap = new Map<string, any>();
        const brokerOrderByProduct = new Map<string, Set<string>>();

        filteredData.forEach((contract) => {
            const rawDate = contract.contract_emission_date;
            if (!rawDate) return;

            const dateParts = rawDate.trim().split("/");
            if (dateParts.length !== 3) return;

            const [_dayStr, monthStr, yearStr] = dateParts;
            const monthIndex = Number(monthStr) - 1;
            if (monthIndex < 0 || monthIndex > 11) return;

            const mesAnoExtenso = `${meses[monthIndex]}/${yearStr}`;
            const mesAnoSort = `${yearStr.padStart(4, "0")}-${monthStr.padStart(
                2,
                "0",
            )}`;

            const product = normalizeText(contract.product);
            const broker = String(contract.number_broker ?? "").trim();
            if (!product || !broker) return;

            const field = `${product}_${broker}`;
            const header = `${product}.${broker}`;
            comboMap.set(field, header);
            comboSet.add(field);

            if (!brokerOrderByProduct.has(product)) {
                brokerOrderByProduct.set(product, new Set<string>());
            }
            brokerOrderByProduct.get(product)?.add(broker);

            if (!dataMap.has(mesAnoSort)) {
                dataMap.set(mesAnoSort, {
                    mesAno: mesAnoExtenso,
                    mesAnoSort,
                    TOTALCALC: 0,
                });
            }

            const row = dataMap.get(mesAnoSort);
            row[field] = (row[field] ?? 0) + contract.commission_value;
            row.TOTALCALC += contract.commission_value;
        });

        const rows = Array.from(dataMap.values()).sort((a, b) =>
            a.mesAnoSort.localeCompare(b.mesAnoSort),
        );

        const comboKeys: Array<[string, string]> = [];
        productOrder.forEach((product) => {
            const brokers = Array.from(
                brokerOrderByProduct.get(product) ?? [],
            ).sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));

            brokers.forEach((broker) => {
                const field = `${product}_${broker}`;
                if (comboSet.has(field)) {
                    comboKeys.push([
                        field,
                        comboMap.get(field) ?? `${product}.${broker}`,
                    ]);
                }
            });
        });

        return { rows, comboKeys };
    }, [filteredData, selectData.product_types]);

    const nameColumns: IColumn[] = useMemo(() => {
        const base = [
            {
                field: "mesAno",
                header: "MÊS/ANO",
                width: "150px",
            },
        ];

        const comboCols = pivotData.comboKeys.map(([field, header]) => ({
            field,
            header,
            width: "120px",
        }));

        const totalCol = {
            field: "TOTALCALC",
            header: "TOTAL",
            width: "150px",
        };

        return [...base, ...comboCols, totalCol];
    }, [pivotData.comboKeys]);

    const buildReportTitle = () => {
        const yearValue = Number(selectData.year ?? new Date().getFullYear());
        return `Faturamento ${selectedMesaName} ${yearValue}`;
    };

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageSize = 20;
        const reportTitle = buildReportTitle();

        printWindow.document.write(`
        <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    th, td { border: 1px solid black; padding: 5px; font-size: 10px; text-align: right; }
                    th:first-child, td:first-child { text-align: left; }
                    .page-break { page-break-after: always; }
                    h3 { text-align: left; }
                    h4 { text-align: center; margin-top: 0; }
                </style>
            </head>
            <body>
                <h3>Ary Oleofar</h3>
                <h4>${reportTitle}</h4>
    `);

        const rows = pivotData.rows;
        const columns = nameColumns;

        for (let i = 0; i < rows.length; i += pageSize) {
            const pageRows = rows.slice(i, i + pageSize);

            printWindow.document.write(`<table><thead><tr>`);
            columns.forEach((col) => {
                printWindow.document.write(
                    `<th style="width: ${col.width};">${col.header}</th>`,
                );
            });
            printWindow.document.write(`</tr></thead><tbody>`);

            pageRows.forEach((row) => {
                printWindow.document.write(`<tr>`);
                columns.forEach((col) => {
                    const value = row[col.field];
                    const formatted =
                        typeof value === "number"
                            ? isDynamicFinancialField(col.field)
                                ? value.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                      minimumFractionDigits: 2,
                                  })
                                : value.toLocaleString("pt-BR", {
                                      minimumFractionDigits: 0,
                                  })
                            : (value ?? "");
                    printWindow.document.write(`<td>${formatted}</td>`);
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
                ...pivotData.rows.map((row) =>
                    nameColumns.map((col) => {
                        const value = row[col.field];

                        if (typeof value === "number") {
                            return value;
                        }

                        return value ?? "";
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

            const moneyStyle = {
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
                applyStyle(
                    XLSX.utils.encode_cell({ r: 2, c: col }),
                    headerStyle,
                );
            }

            for (let row = 3; row < exportRows.length; row += 1) {
                for (let col = 0; col < columnCount; col += 1) {
                    const field = nameColumns[col].field;
                    const style =
                        col === 0 || field === "mesAno" ? textStyle : moneyStyle;
                    applyStyle(
                        XLSX.utils.encode_cell({ r: row, c: col }),
                        style,
                    );
                }
            }

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Faturamento");
            XLSX.writeFile(workbook, `${buildReportTitle()}.xlsx`, {
                bookType: "xlsx",
            });
        } catch (error) {
            toast.error(`Erro ao exportar Excel: ${error}`);
        }
    };

    return (
        <>
            <STitle>{buildReportTitle()}</STitle>
            <SContainerSearchAndButton>
                <CustomSearch
                    width="450px"
                    placeholder=""
                    disabled
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
                    titleText={buildReportTitle()}
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
                data={pivotData.rows}
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
