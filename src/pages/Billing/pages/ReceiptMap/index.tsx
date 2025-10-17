import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useTableSearch from "../../../../hooks/useTableSearch";
import { CustomSearch } from "../../../../components/CustomSearch";
import {
    SContainerSearchAndButton,
    SCustomTableWrapper,
    SFormContainer,
    STitle,
} from "./styles";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import CustomButton from "../../../../components/CustomButton";
import { BillingContext } from "../../../../contexts/BillingContext";
import { IBillingData } from "../../../../contexts/BillingContext/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { Modal } from "../../../../components/Modal";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { TbFilter, TbFilterOff } from "react-icons/tb";

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

    type SelectState = {
        SelectDateStart: string;
        SelectDateEnd: string;
        SelectContract?: string;
    };

    const getInitialSelectData = (): SelectState => {
        const today = new Date();
        // mês atual (sem +1)
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

        const fmt = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(d.getDate()).padStart(2, "0")}`;

        console.log(fmt(firstDay), fmt(today));

        return {
            SelectDateStart: fmt(firstDay),
            SelectDateEnd: fmt(today),
            SelectContract: "",
        };
    };

    const [selectData, setSelectData] = useState<SelectState>(
        getInitialSelectData()
    );

    const handleSelectionModal = () => setSelectionModal((prev) => !prev);
    const handleCloseModal = () => setSelectionModal(false);

    const handleChangeSelect = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setSelectData((prev) => ({ ...prev, [name]: value }));
    };

    const fetchSelectData = useCallback(() => {
        try {
            setIsLoading(true);

            // Parse das datas da seleção de forma segura (sem usar new Date(isoString))
            const parseYMD = (iso?: string) => {
                if (!iso) return null;
                const [y, m, d] = iso.split("-").map(Number);
                return new Date(y, m - 1, d); // criação local, sem timezone-shift
            };

            const startDate = parseYMD(selectData.SelectDateStart);
            const endDate = parseYMD(selectData.SelectDateEnd);

            // Função que normaliza a data para comparações sem horário (00:00 local)
            const onlyDate = (d: Date) =>
                new Date(d.getFullYear(), d.getMonth(), d.getDate());

            const sDate = startDate ? onlyDate(startDate) : null;
            const eDate = endDate ? onlyDate(endDate) : null;

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

                return matchStart && matchEnd;
            });

            setListBillings(filtered);
            setSelectionModal(false);
        } catch (error) {
            toast.error(`Erro ao aplicar filtros: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [allBillings, selectData]);

    const handleClearFilterModal = () => {
        setSelectData(getInitialSelectData());
        setListBillings(allBillings);
        setSelectionModal(false);
    };

    const isInitialFilter = useMemo(() => {
        const initial = getInitialSelectData();
        return (
            selectData.SelectDateStart === initial.SelectDateStart &&
            selectData.SelectDateEnd === initial.SelectDateEnd
            //&& (selectData.SelectContract?.trim() ?? "") === ""
        );
    }, [selectData]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);

            const responseContract = await contractContext.listContracts();
            const response = await billingContext.listBillings();

            const filteredData = response.data.filter(
                (billing: {
                    receipt_date: any;
                    contract_emission_date: any;
                    number_contract: any;
                    seller_name: any;
                    product_name: any;
                    total_service_value: number;
                    liquid_value: number;
                    adjustment_value: number;
                    irrf_value: number;
                    iss: number;
                    pis_cofins: number;
                    value_base: number;
                }) =>
                    (billing.product_name &&
                        billing.product_name.toUpperCase() ===
                            "SOJA EM GRÃOS") ||
                    billing.product_name.toUpperCase() === "MILHO EM GRÃOS" ||
                    billing.product_name.toUpperCase() === "TRIGO" ||
                    billing.product_name.toUpperCase() === "SORGO"
            );

            const contractList =
                responseContract?.data || responseContract || [];

            const updatedBilling = filteredData.map((billing: any) => {
                const contract = contractList.find(
                    (c: any) => c.number_contract === billing.number_contract
                );

                const total_service = Number(billing.total_service_value) || 0;
                const liquid = Number(billing.liquid_value) || 0;
                const adjustment = Number(billing.adjustment_value) || 0;
                const irrf = Number(billing.irrf_value) || 0;

                const ISS_PERCENT = 0.05; // 5%
                const PIS_COFINS_PERCENT = 0.0465; // 4,65%

                const iss = total_service * ISS_PERCENT;
                const piscofins = total_service * PIS_COFINS_PERCENT;
                const tot_base = total_service - irrf - iss - piscofins;
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
                    value_base: formatValue(tot_base),
                    contract_emission_date:
                        contract?.contract_emission_date || "",
                    seller_name: contract?.seller.name || "",
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
    useEffect(() => {
        if (allBillings.length > 0 && isInitialFilter) {
            fetchSelectData();
        }
    }, [allBillings, isInitialFilter, fetchSelectData]);

    const { filteredData } = useTableSearch({
        data: listBillings,
        searchTerm,
        searchableFields: ["receipt_date"],
    });

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "receipt_date",
                header: "Dt.Recebto.",
                width: "100px",
            },
            {
                field: "contract_emission_date",
                header: "Dt.Contrato",
                width: "100px",
            },
            {
                field: "number_contract",
                header: "Contrato",
                width: "180px",
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
                width: "150px",
                align: "right",
            },
            {
                field: "iss",
                header: "ISS",
                width: "150px",
                align: "right",
            },
            {
                field: "pis_cofins",
                header: "PIS+COFINS",
                width: "150px",
                align: "right",
            },
            {
                field: "value_base",
                header: "Valor Base",
                width: "150px",
                align: "right",
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

        const formatIsoYMDToBR = (iso?: string) => {
            if (!iso) return "";
            const [y, m, d] = iso.split("-").map(Number);
            if (!y || !m || !d) return "";
            const dd = String(d).padStart(2, "0");
            const mm = String(m).padStart(2, "0");
            return `${dd}/${mm}/${y}`;
        };

        const startDateFormatted = formatIsoYMDToBR(selectData.SelectDateStart);
        const endDateFormatted = formatIsoYMDToBR(selectData.SelectDateEnd);

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

    const formatIsoYMDToBR = (iso?: string) => {
        if (!iso) return "";
        const [y, m, d] = iso.split("-").map(Number);
        if (!y || !m || !d) return "";
        const dd = String(d).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        return `${dd}/${mm}/${y}`;
    };

    const handleExportCSV = () => {
        const startDateFormatted = formatIsoYMDToBR(selectData.SelectDateStart);
        const endDateFormatted = formatIsoYMDToBR(selectData.SelectDateEnd);

        // Cabeçalho do relatório
        const headerTitle = "MAPA DE RECEBIMENTOS";
        const headerDate = `DE: ${startDateFormatted} ATÉ ${endDateFormatted}`;

        // Cabeçalho das colunas
        const headers = nameColumns
            .filter((col) => col.field)
            .map((col) => `"${col.header}"`)
            .join(";");

        // Linhas de dados
        const rows = sortedData.map((row) => {
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
                        ].includes(col.field!)
                    ) {
                        const number = parseFloat(
                            String(value).replace(",", ".")
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
                    placeholder="Filtre por Data"
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

                <Modal
                    titleText="Seleção"
                    open={isSelectionModal}
                    confirmButton="OK"
                    cancelButton="Fechar"
                    onClose={handleCloseModal}
                    onHandleConfirm={fetchSelectData}
                    variantCancel="primary"
                    variantConfirm="success"
                >
                    <SFormContainer>
                        <TextField
                            label="Data Recbto. Inicial"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            name="SelectDateStart"
                            value={selectData.SelectDateStart}
                            onChange={handleChangeSelect}
                        />
                        <TextField
                            label="Data Recbto. Final"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            name="SelectDateEnd"
                            value={selectData.SelectDateEnd}
                            onChange={handleChangeSelect}
                        />
                    </SFormContainer>
                </Modal>

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
            <SCustomTableWrapper>
                <CustomTable
                    isLoading={isLoading}
                    data={sortedData}
                    columns={nameColumns}
                    hasPagination={true}
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
