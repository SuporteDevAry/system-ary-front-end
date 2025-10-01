import { useCallback, useEffect, useMemo, useState } from "react";
import CustomTable from "../../../../components/CustomTable";
import { CustomSearch } from "../../../../components/CustomSearch";
import useTableSearch from "../../../../hooks/useTableSearch";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { SContainerSearchAndButton, SFormContainer, STitle } from "./styles";
import CustomButton from "../../../../components/CustomButton";
//import { FaFilter } from "react-icons/fa";
import { TbFilter } from "react-icons/tb";
import { TbFilterOff } from "react-icons/tb";
import IconButton from "@mui/material/IconButton";
import { TextField } from "@mui/material";
import { Modal } from "../../../../components/Modal";

export function PaymentContract() {
    const contractContext = ContractContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [listcontracts, setListContracts] = useState<IContractData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState("charge_date");

    const [isSelectionModal, setSelectionModal] = useState<boolean>(false);
    const handleSelectionModal = () => {
        if (isSelectionModal) {
            setSelectionModal(false);
        } else {
            setSelectionModal(true);
        }
    };
    const handleCloseModal = () => {
        setSelectionModal(false);
    };
    const handleSelection = () => {
        setSelectionModal(false);
        fetchSelectData();
    };

    type SelectState = {
        selectedFields: string[];
        SelectDateStart: string;
        SelectDateEnd: string;
        SelectSeller?: string;
    };
    const [selectData, setSelectData] = useState<SelectState>({
        selectedFields: ["SelectDateStart", "SelectDateEnd", "SelectSeller"],
        SelectDateStart: "",
        SelectDateEnd: "",
    });

    useEffect(() => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

        const fmt = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(d.getDate()).padStart(2, "0")}`;

        setSelectData((prev) => ({
            ...prev,
            SelectDateStart:
                prev.selectedFields.includes("SelectDateStart") &&
                !prev.SelectDateStart
                    ? fmt(firstDay)
                    : prev.SelectDateStart,
            SelectDateEnd:
                prev.selectedFields.includes("SelectDateEnd") &&
                !prev.SelectDateEnd
                    ? fmt(today)
                    : prev.SelectDateEnd,
        }));
    }, []);

    const handleChangeSelect = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setSelectData((prev) => ({ ...prev, [name]: value }));
    };

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await contractContext.listContracts();

            // const filteredContracts = response.data.filter(
            //     (contract: { name_product: any }) =>
            //         (contract.name_product &&
            //             contract.name_product.toUpperCase() ===
            //                 "SOJA EM GRÃOS") ||
            //         contract.name_product.toUpperCase() === "MILHO EM GRÃOS" ||
            //         contract.name_product.toUpperCase() === "TRIGO" ||
            //         contract.name_product.toUpperCase() === "SORGO"
            // );

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
            "seller.name",
            "buyer.name",
            "charge_date",
        ],
    });

    useEffect(() => {
        handleSearch();
    }, [searchTerm]);

    const fetchSelectData = useCallback(async () => {
        try {
            setIsLoading(true);

            const response = await contractContext.listContracts();

            const searchSeller =
                selectData.SelectSeller?.trim().toLowerCase() || "";
            const startDate = selectData.SelectDateStart
                ? new Date(selectData.SelectDateStart)
                : null;
            const endDate = selectData.SelectDateEnd
                ? new Date(selectData.SelectDateEnd)
                : null;

            const filteredContracts = response.data.filter(
                (contract: { seller: any; contract_emission_date: string }) => {
                    if (
                        typeof contract.seller.name !== "string" ||
                        !contract.seller.name.trim()
                    )
                        return false;
                    const sellerMatch = contract.seller.name
                        .toLowerCase()
                        .includes(searchSeller);

                    if (!contract.contract_emission_date) return false;

                    const [day, month, year] = contract.contract_emission_date
                        .split("/")
                        .map(Number);
                    const emissionDate = new Date(year, month - 1, day);

                    const startMatch = startDate
                        ? emissionDate >= startDate
                        : true;
                    const endMatch = endDate ? emissionDate <= endDate : true;

                    return sellerMatch && startMatch && endMatch;
                }
            );

            setListContracts(filteredContracts);
        } catch (error) {
            toast.error(`Erro ao tentar ler contratos: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [
        selectData.SelectSeller,
        selectData.SelectDateStart,
        selectData.SelectDateEnd,
        contractContext,
    ]);

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "contract_emission_date",
                header: "DATA",
                width: "100px",
                sortable: true,
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
                field: "charge_date",
                header: "VENCIMENTO",
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

    const handlePrint = (): void => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageSize = 25;

        printWindow.document.write(`
        <html>
            <head>
                <title>Contrato por Vencimento</title>
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
                <h4>Contratos por Vencimento</h4>
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
        link.setAttribute("download", "contratos-por-vencimento.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <STitle>Contratos por Vencimento</STitle>
            <SContainerSearchAndButton>
                <CustomSearch
                    width="450px"
                    placeholder="Filtre por qualquer coluna..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IconButton
                    aria-label="filter"
                    onClick={handleSelectionModal}
                    sx={{ color: "#E7B10A" }}
                >
                    <TbFilter />
                </IconButton>
                <IconButton
                    aria-label="clearfilter"
                    onClick={handleSelectionModal}
                    sx={{ color: "#E7B10A" }}
                >
                    <TbFilterOff />
                </IconButton>
                <Modal
                    titleText={`Seleção`}
                    open={isSelectionModal}
                    confirmButton="OK"
                    cancelButton="Fechar"
                    onClose={handleCloseModal}
                    onHandleConfirm={handleSelection}
                    variantCancel={"primary"}
                    variantConfirm={"success"}
                >
                    <SFormContainer>
                        <TextField
                            label="Data Início"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            size="small"
                            name="SelectDateStart"
                            value={selectData.SelectDateStart}
                            onChange={handleChangeSelect}
                        />
                        <TextField
                            label="Data Final"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            size="small"
                            name="SelectDateEnd"
                            value={selectData.SelectDateEnd}
                            onChange={handleChangeSelect}
                        />
                        <TextField
                            label="Vendedor"
                            type="text"
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            size="small"
                            name="SelectSeller"
                            value={selectData.SelectSeller ?? ""}
                            onChange={handleChangeSelect}
                            sx={{ width: "100%" }}
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
