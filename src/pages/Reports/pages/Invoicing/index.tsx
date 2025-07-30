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

interface IContractExtended extends IContractData {
    type_commission_seller: string;
    type_commission_buyer: string;
    type_commission: string;
    resp_commission: string;
    commission_value: number;
}

export function Invoicing() {
    const contractContext = ContractContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [listcontracts, setListContracts] = useState<IContractExtended[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [orderBy, setOrderBy] = useState<string>("mesAnoSort");

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await contractContext.listContracts();

            // const formatted = response.data.map((contract: IContractData) => ({
            //     ...contract,
            //     quantity: Number(contract.quantity),
            // }));
            // setListContracts(formatted);

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
                    // 02/01/2025 - Carlos - Farelo e Óleo não divide por 60
                    // Só iremos remover essa regra das siglas, caso o cliente aceite a sugestão da reunião do dia 09/04/2025
                    const validProducts = ["O", "F", "OC", "OA", "SB", "EP"];
                    const quantityTon = validProducts.includes(contract.product)
                        ? Number(contract.quantity) / 1
                        : Number(contract.quantity) / 1000;

                    const total = Number(
                        contract.total_contract_value.replace(/[,]/g, ".")
                    );

                    const commission = Number(
                        contract.commission_seller == 0
                            ? contract.commission_buyer.replace(",", ".")
                            : contract.commission_seller.replace(",", ".")
                    );

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

                    // const formattedCommission = commissionValue.toLocaleString(
                    //     "pt-BR",
                    //     {
                    //         style: "currency",
                    //         currency: "BRL",
                    //     }
                    // );

                    return {
                        ...contract,
                        quantity: quantityTon,
                        type_commission: type_commission,
                        resp_commission: resp_commission,
                        commission: commission,
                        commission_value: commissionValue,
                    };
                }
            );

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

    const { filteredData, handleSearch } = useTableSearch({
        data: listcontracts,
        searchTerm,
        searchableFields: ["product"],
    });

    useEffect(() => {
        handleSearch();
    }, [searchTerm, handleSearch]);

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

        const filteredContracts = filteredData.filter(
            (contract) => contract.product === "S" || contract.product === "CN"
        );

        const brokerMap = new Map<string, string>(); // field -> header
        const dataMap = new Map<string, any>();

        filteredContracts.forEach((contract) => {
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
                "0"
            )}`;

            const broker = contract.number_broker ?? "0";
            //const quantity = Number(contract.quantity) / 1000;
            const brokerField = `S_CN_${broker}`;
            const brokerHeader = `S.${broker} / CN.${broker}`;

            brokerMap.set(brokerField, brokerHeader);

            if (!dataMap.has(mesAnoSort)) {
                dataMap.set(mesAnoSort, {
                    mesAno: mesAnoExtenso,
                    mesAnoSort,
                    TOTALCALC: 0,
                });
            }

            const row = dataMap.get(mesAnoSort);
            row[brokerField] =
                (row[brokerField] ?? 0) + contract.commission_value;
            row.TOTALCALC += contract.commission_value;
        });

        // Agora pegamos os valores e ordenamos por mesAnoSort (não visível)
        const rows = Array.from(dataMap.values()).sort((a, b) =>
            a.mesAnoSort.localeCompare(b.mesAnoSort)
        );

        const brokerKeys = Array.from(brokerMap.entries());

        return { rows, brokerKeys };
    }, [filteredData]);

    const nameColumns: IColumn[] = useMemo(() => {
        const base = [
            {
                field: "mesAno", // usa o campo legível, ex: "Janeiro/2025"
                header: "MÊS/ANO",
                width: "150px",
            },
        ];

        const brokerCols = pivotData.brokerKeys.map(([field, header]) => ({
            field,
            header,
            width: "120px",
        }));

        const totalCol = {
            field: "TOTALCALC",
            header: "TOTAL",
            width: "150px",
        };

        return [...base, ...brokerCols, totalCol];
    }, [pivotData.brokerKeys]);

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageSize = 20;

        printWindow.document.write(`
        <html>
            <head>
                <title>Faturamento Grãos</title>
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
                <h4>Faturamento Grãos</h4>
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
        link.setAttribute("download", "faturamento-graos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <STitle>Faturamento Grãos</STitle>
            <SContainerSearchAndButton>
                <CustomSearch
                    width="450px"
                    placeholder="Filtre por Sigla"
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
                order={order}
                orderBy={orderBy}
                setOrder={setOrder}
                setOrderBy={setOrderBy}
            />
        </>
    );
}
