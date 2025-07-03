import { useCallback, useEffect, useMemo, useState } from "react";
import CustomTable from "../../../../components/CustomTable";
import { CustomSearch } from "../../../../components/CustomSearch";
import useTableSearch from "../../../../hooks/useTableSearch";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { SContainerSearchAndButton, STitle } from "./styles";
import CustomButton from "../../../../components/CustomButton";

export function GrainsBigger() {
    const contractContext = ContractContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [listcontracts, setListContracts] = useState<IContractData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await contractContext.listContracts();

            const formatted = response.data.map((contract: IContractData) => ({
                ...contract,
                quantity: Number(contract.quantity),
            }));

            setListContracts(formatted);
        } catch (error) {
            toast.error(`Erro ao tentar ler contratos: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [contractContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const { filteredData, handleSearch } = useTableSearch({
        data: listcontracts,
        searchTerm,
        searchableFields: ["name_product", "buyer.name"],
    });

    useEffect(() => {
        handleSearch();
    }, [searchTerm, handleSearch]);

    const pivotData = useMemo(() => {
        const productSet = new Set<string>();
        type PivotRow = {
            buyer: string;
            TOTAL: number;
            [product: string]: string | number;
        };

        const buyerMap = new Map<string, PivotRow>();

        filteredData.forEach((item) => {
            const buyerName = item.buyer?.name ?? "DESCONHECIDO";
            const product = item.product ?? "N/A";
            const quantity = Number(item.quantity / 1000) || 0;

            productSet.add(product);

            if (!buyerMap.has(buyerName)) {
                buyerMap.set(buyerName, { buyer: buyerName, TOTAL: 0 });
            }

            const buyerEntry = buyerMap.get(buyerName)!;
            buyerEntry[product] = Number(buyerEntry[product] || 0) + quantity;
            buyerEntry.TOTAL += quantity;
        });

        const products = Array.from(productSet).sort();

        // Ordena compradores pelo maior total
        const rows = Array.from(buyerMap.values()).sort(
            (a, b) => b.TOTAL - a.TOTAL
        );

        return { rows, products };
    }, [filteredData]);

    const nameColumns: IColumn[] = useMemo(() => {
        const base = [
            {
                field: "buyer",
                header: "COMPRADOR",
                width: "250px",
            },
        ];

        const productCols = pivotData.products.map((product) => ({
            field: product,
            header: product,
            width: "120px",
            render: (value: number) =>
                typeof value === "number"
                    ? value.toLocaleString("pt-BR", {
                          maximumFractionDigits: 0,
                      })
                    : "",
        }));

        const totalCol = {
            field: "TOTAL",
            header: "TOTAL",
            width: "150px",
            render: (value: number) =>
                typeof value === "number"
                    ? value.toLocaleString("pt-BR", {
                          maximumFractionDigits: 0,
                      })
                    : "",
        };

        return [...base, ...productCols, totalCol];
    }, [pivotData.products]);

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageSize = 20;

        printWindow.document.write(`
        <html>
            <head>
                <title>Grãos Maiores</title>
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
                <h4>Grãos Maiores</h4>
    `);

        const rows = pivotData.rows;
        const columns = nameColumns;

        for (let i = 0; i < rows.length; i += pageSize) {
            const pageRows = rows.slice(i, i + pageSize);

            printWindow.document.write(`<table><thead><tr>`);
            columns.forEach((col) => {
                printWindow.document.write(
                    `<th style="width: ${col.width};">${col.header}</th>`
                );
            });
            printWindow.document.write(`</tr></thead><tbody>`);

            pageRows.forEach((row) => {
                printWindow.document.write(`<tr>`);
                columns.forEach((col) => {
                    const value = row[col.field];
                    const formatted =
                        typeof value === "number"
                            ? value.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 0,
                              })
                            : value ?? "";
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

    const handleExportCSV = () => {
        const headers = nameColumns.map((col) => `"${col.header}"`).join(";");

        const rows = pivotData.rows.map((row) => {
            return nameColumns
                .map((col) => {
                    const value = row[col.field];

                    if (typeof value === "number") {
                        return `"${value.toLocaleString("pt-BR", {
                            minimumFractionDigits: 0,
                        })}"`;
                    }

                    return `"${value ?? ""}"`;
                })
                .join(";");
        });

        const BOM = "\uFEFF";
        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([BOM + csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "graos-maiores.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <STitle>Grãos Maiores</STitle>
            <SContainerSearchAndButton>
                <CustomSearch
                    width="450px"
                    placeholder="Filtre por Sigla ou Comprador"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
            </SContainerSearchAndButton>
            <CustomTable
                isLoading={isLoading}
                data={pivotData.rows}
                columns={nameColumns}
                hasPagination={true}
                page={page}
                setPage={setPage}
                order="desc"
                orderBy="TOTAL"
                setOrder={() => {}}
                setOrderBy={() => {}}
            />
        </>
    );
}
