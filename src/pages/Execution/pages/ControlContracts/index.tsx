import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import useTableSearch from "../../../../hooks/useTableSearch";
import { SCard, SContainer, SContainerSearchAndButton, STitle } from "./styles";
import CustomButton from "../../../../components/CustomButton";

export function ControlContracts() {
    const contractContext = ContractContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [listcontracts, setListContracts] = useState<IContractData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState("contract_emission_date");

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
                    // 02/01/2025 - Carlos - Farelo e Óleo não divide por 60
                    // Só iremos remover essa regra das siglas, caso o cliente aceite a sugestão da reunião do dia 09/04/2025
                    const validProducts = ["O", "F", "OC", "OA", "SB", "EP"];
                    const quantityTon = validProducts.includes(contract.product)
                        ? Number(contract.quantity) / 1
                        : Number(contract.quantity) / 1000;

                    const total = Number(
                        contract.total_contract_value
                            .replace(/[,]/g, ".")
                            .toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            })
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

                    const formattedCommission = commissionValue.toLocaleString(
                        "pt-BR",
                        {
                            style: "currency",
                            currency: "BRL",
                        }
                    );

                    return {
                        ...contract,
                        quantity: quantityTon,
                        type_commission: type_commission,
                        resp_commission: resp_commission,
                        commission: commission,
                        commission_value: formattedCommission,
                    };
                }
            );

            setListContracts(updatedContracts);
            //            setListContracts(response.data);
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
            "product",
            "number_contract",
        ],
    });

    useEffect(() => {
        handleSearch();
    }, [searchTerm, handleSearch]);

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "contract_emission_date",
                header: "Data",
                width: "50px",
                sortable: true,
            },
            {
                field: "product",
                header: "Sigla",
                width: "50px",
            },
            {
                field: "number_contract",
                header: "Nº Contrato",
                width: "120px",
            },
            {
                field: "seller.name",
                header: "Vendedor",
                width: "160px",
            },
            {
                field: "buyer.name",
                header: "Comprador",
                width: "150px",
            },
            {
                field: "number_external_contract_buyer",
                header: "Nro.Comprador",
                width: "100px",
            },
            {
                field: "name_product",
                header: "Produto",
                width: "150px",
            },
            {
                field: "quantity",
                header: "Quantidade",
                width: "150px",
            },
            {
                field: "price",
                header: "Preço",
                width: "150px",
            },
            {
                field: "type_currency",
                header: "Moeda",
                width: "150px",
            },
            {
                field: "total_contract_value",
                header: "Valor Contrato",
                width: "150px",
            },
            {
                field: "pickup",
                header: "Embarque",
                width: "150px",
            },
            {
                field: "payment",
                header: "Pagamento",
                width: "150px",
            },
            {
                field: "payment_date",
                header: "Data Pagamento",
                width: "150px",
            },
            {
                field: "type_commission",
                header: "P/V",
                width: "50px",
            },
            {
                field: "resp_commission",
                header: "C/V",
                width: "20px",
            },
            {
                field: "commission",
                header: "Comissão",
                width: "150px",
            },
            {
                field: "commission_value",
                header: "Vlr. Comissão",
                width: "150px",
            },
            {
                field: "charge_date",
                header: "Data Cobrança",
                width: "150px",
            },
            {
                field: "expected_receipt_date",
                header: "Dt.Prev.Recbto.",
                width: "150px",
            },
            {
                field: "total_received",
                header: "Vlr.Tot.Recebido",
                width: "150px",
            },
            {
                field: "status_received",
                header: "Liquidado",
            },
            {
                field: "internal_communication",
                header: "Comunicação Interna",
                width: "200px",
            },
        ],
        []
    );

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const table = document.querySelector("table");
        if (!table) {
            alert("Tabela não encontrada.");
            return;
        }

        // Clona a tabela para evitar alterações na original
        const tableClone = table.cloneNode(true) as HTMLTableElement;
        const rows = Array.from(tableClone.querySelectorAll("tr"));

        // Cabeçalho da tabela (mantido em todas as páginas)
        const headerRow = rows.find((row) => row.querySelector("th"));
        const dataRows = rows.filter((row) => !row.querySelector("th"));

        // Número de registros por página
        const pageSize = 25;

        // Começa a construir o documento de impressão
        printWindow.document.write(`
        <html>
            <head>
                <title>Controle de Contratos - Execução</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 80%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid black; padding: 5px; font-size: 8px; }
                    th { background-color: #f0f0f0; }
                    .page-break { page-break-after: always; }
                    h3 { text-align: left; }
                    h2 { text-align: center; }
                </style>
            </head>
            <body>
                <h3>Ary Oleofar</h3>
                <h2>Controle de Contratos - Execução</h2>
    `);

        for (let i = 0; i < dataRows.length; i += pageSize) {
            const pageRows = dataRows.slice(i, i + pageSize);

            printWindow.document.write(`<table>`);

            // Adiciona o cabeçalho na nova página
            if (headerRow) {
                printWindow.document.write(headerRow.outerHTML);
            }

            // Adiciona as linhas da página atual
            for (const row of pageRows) {
                printWindow.document.write(row.outerHTML);
            }

            printWindow.document.write(`</table>`);

            // Adiciona quebra de página se ainda houver mais dados
            if (i + pageSize < dataRows.length) {
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

        const rows = filteredData.map((row) => {
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
                        col.field === "quantity" ||
                        col.field === "price" ||
                        col.field === "total_contract_value" ||
                        col.field === "commission" ||
                        col.field === "total_received"
                    ) {
                        const number = parseFloat(
                            String(value).replace(",", ".")
                        );
                        if (!isNaN(number)) {
                            value = number
                                .toFixed(2) // duas casas decimais
                                .replace(".", ","); // troca ponto por vírgula
                        }
                    }

                    if (col.field === "commission_value") {
                        value = String(value)
                            .replace("R$", "")
                            .replace(".", "")
                            .trim();
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
        link.setAttribute("download", "controle-contratos-execucao.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <SContainer>
            <STitle>Controle de Contratos</STitle>

            <SCard>
                <SContainerSearchAndButton>
                    <CustomSearch
                        width="400px"
                        placeholder="Filtre Data, Sigla ou Nº Contrato"
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
                    data={filteredData}
                    columns={nameColumns}
                    hasPagination
                    maxChars={15}
                    page={page}
                    setPage={setPage}
                    order={order}
                    orderBy={orderBy}
                    setOrder={setOrder}
                    setOrderBy={setOrderBy}
                />
            </SCard>
        </SContainer>
    );
}
