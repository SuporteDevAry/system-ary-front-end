import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import useTableSearch from "../../../../hooks/useTableSearch";
import { SContainerSearchAndButton, STitle } from "./styles";
import { Button } from "@mui/material";

export function GrainsVol() {
    const contractContext = ContractContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [listcontracts, setListContracts] = useState<IContractData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState("quantity");

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await contractContext.listContracts();
            setListContracts(response.data);
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
        searchableFields: [
            "contract_emission_date",
            "number_contract",
            "product",
        ],
    });

    useEffect(() => {
        handleSearch();
    }, [searchTerm, handleSearch]);

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "contract_emission_date",
                header: "DATA",
                width: "100px",
            },
            {
                field: "product",
                header: "SIGLA",
                width: "80px",
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
                header: "QUANTIDADE",
                width: "150px",
            },
            {
                field: "price",
                header: "PREÇO",
                width: "150px",
            },
            {
                field: "type_commission_seller",
                header: "TIPO COMISSÃO",
                width: "100px",
            },
            {
                field: "commission_seller",
                header: "COMISSÃO",
                width: "100px",
            },
            // {
            //     field: "commission",
            //     header: "COMISSÃO EM R$",
            //     width: "100px",
            // },
        ],
        []
    );

    const getNestedValue = (obj: any, path: string): any => {
        return path.split(".").reduce((acc, part) => acc?.[part], obj);
    };

    const sortedData = useMemo(() => {
        const sorted = [...filteredData].sort((a, b) => {
            const aNum = getNestedValue(a, orderBy);
            const bNum = getNestedValue(b, orderBy);

            return order === "asc" ? aNum - bNum : bNum - aNum;
        });
        return sorted;
    }, [filteredData, order, orderBy]);

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageSize = 26;

        const sortedPrint = [...filteredData].sort((a, b) => {
            const qA = Number(a.quantity) || 0;
            const qB = Number(b.quantity) || 0;
            return qA - qB;
        });

        printWindow.document.write(`
        <html>
            <head>
                <title>Grãos Volume - Produto</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 80%; border-collapse: collapse; margin-bottom: 10px; }
                    th, td { border: 1px solid black; padding: 5px; font-size: 8px; }
                    .page-break { page-break-after: always; }
                    h3 { text-align: left; }
                    h2 { text-align: center; }
                </style>
            </head>
            <body>
                <h3>Ary Oleofar</h3>
                <h4>Grãos Volume - Produto</h4>
        `);

        for (let i = 0; i < sortedPrint.length; i += pageSize) {
            const pageRows = sortedPrint.slice(i, i + pageSize);

            printWindow.document.write(`<table><thead><tr>`);
            nameColumns.forEach((col) => {
                printWindow.document.write(
                    `<th style="width: ${col.width}px || '100px'};">${col.header}</th>`
                );
            });
            printWindow.document.write(`</tr></thead><tbody>`);

            pageRows.forEach((row) => {
                printWindow.document.write(`<tr>`);
                nameColumns.forEach((col) => {
                    if (col.field === "seller.name") {
                        printWindow.document.write(
                            `<td>${row.seller.name}</td>`
                        );
                    } else if (col.field === "buyer.name") {
                        printWindow.document.write(
                            `<td>${row.buyer.name}</td>`
                        );
                    } else {
                        printWindow.document.write(
                            `<td>${row[col.field]}</td>`
                        );
                    }
                });
                printWindow.document.write(`</tr>`);
            });

            printWindow.document.write(`</tbody></table>`);

            if (i + pageSize < sortedPrint.length) {
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

        const rows = sortedData.map((row) => {
            return nameColumns
                .filter((col) => col.field)
                .map((col) => {
                    const fields = col.field!.split(".");
                    let value: any = row;

                    for (const f of fields) {
                        value = value?.[f];
                    }
                    if (
                        col.field === "price" ||
                        col.field === "total_contract_value"
                    ) {
                        value = value.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 2,
                        });
                    }
                    if (col.field === "quantity") {
                        value = parseFloat(value.replace(",", ".")) || 0;
                    }
                    return `"${value ?? ""}"`;
                })
                .join(";");
        });

        const BOM = "\uFEFF"; // UTF-8 BOM
        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([BOM + csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "graos-volume-produto.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // const renderAction = (row: any) =>
    //     let commission = row.quantity * row.price * (row.commission_seller / 100);

    return (
        <>
            <STitle>Grãos Volume - Produto</STitle>
            <SContainerSearchAndButton>
                <CustomSearch
                    width="200px"
                    placeholder="Digite o Nº Contrato"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePrint}
                >
                    Imprimir
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleExportCSV}
                >
                    Exportar CSV
                </Button>
            </SContainerSearchAndButton>
            <CustomTable
                isLoading={isLoading}
                data={filteredData}
                columns={nameColumns}
                //actionButtons={renderAction}
                dateFields={["commission"]}
                hasPagination
                maxChars={15}
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
