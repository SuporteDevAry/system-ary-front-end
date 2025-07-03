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

            const updatedContracts = response.data.map(
                (contract: {
                    total_contract_value: any;
                    commission_seller: any;
                    type_commission_seller: any;
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

                    const total = validProducts.includes(contract.product)
                        ? Number(
                              contract.total_contract_value.replace(
                                  /[.]/g,
                                  ""
                              ) / 1
                          )
                        : Number(
                              contract.total_contract_value.replace(
                                  /[.]/g,
                                  ""
                              ) / 1000
                          );

                    const commission =
                        contract.type_commission_seller == "Percentual"
                            ? contract.commission_seller.replace(",", ".") / 100
                            : Number(
                                  contract.commission_seller.replace(",", ".")
                              );
                    const commissionValue =
                        contract.type_commission_seller == "Percentual"
                            ? total * commission
                            : commission;

                    const formattedCommission = commissionValue.toLocaleString(
                        "pt-BR",
                        {
                            style: "currency",
                            currency: "BRL",
                        }
                    );

                    return {
                        ...contract,
                        commission: formattedCommission,
                        quantity: quantityTon,
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
        searchableFields: [
            "contract_emission_date",
            "number_contract",
            "product",
            "seller.name",
            "buyer.name",
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
                sortable: true,
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
                sortable: true,
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
                sortable: true,
            },
            {
                field: "price",
                header: "PREÇO",
                width: "150px",
            },
            {
                field: "type_commission_seller",
                header: "T",
                width: "20px",
            },
            {
                field: "commission_seller",
                header: "COMISSÃO (%)",
                width: "100px",
            },
            {
                field: "commission",
                header: "COMISSÃO EM R$",
                width: "130px",
            },
        ],
        []
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

    // const sortedData = [...filteredData].sort((a, b) => {
    //     const qA = Number(a.quantity) || 0;
    //     const qB = Number(b.quantity) || 0;
    //     return qA - qB;
    // });

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageSize = 25;

        // const sortedPrint = [...filteredData].sort((a, b) => {
        //     const qA = Number(a.quantity) || 0;
        //     const qB = Number(b.quantity) || 0;
        //     return qA - qB;
        // });

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

        for (let i = 0; i < sortedData.length; i += pageSize) {
            const pageRows = sortedData.slice(i, i + pageSize);

            printWindow.document.write(`<table><thead><tr>`);
            nameColumns.forEach((col) => {
                printWindow.document.write(
                    `<th style="width: ${col.width}px;">${col.header}</th>`
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

            if (i + pageSize < sortedData.length) {
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
                        col.field === "total_contract_value" ||
                        col.field === "commission"
                    ) {
                        value =
                            typeof value === "number"
                                ? value.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                  })
                                : value;
                    }
                    if (col.field === "type_commission_seller") {
                        value = value == "Valor" ? "V" : "P";
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
        link.setAttribute("download", "graos-volume-produto.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <STitle>Grãos Volume - Produto</STitle>
            <SContainerSearchAndButton>
                <CustomSearch
                    width="450px"
                    placeholder="Filtre por Data,Sigla,Contrato,Comprador ou Vendedor"
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
                data={sortedData}
                columns={nameColumns}
                hasPagination={true}
                //maxChars={15}
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
