import { useCallback, useEffect, useMemo, useState } from "react";
import CustomTable from "../../../../components/CustomTable";
import { CustomSearch } from "../../../../components/CustomSearch";
//import useTableSearch from "../../../../hooks/useTableSearch";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { SContainerSearchAndButton, SFormContainer, STitle } from "./styles";
import CustomButton from "../../../../components/CustomButton";
import { TbFilter, TbFilterOff } from "react-icons/tb";
import IconButton from "@mui/material/IconButton";
import { TextField, Tooltip } from "@mui/material";
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

    type SelectState = {
        selectedFields: string[];
        SelectDateStart: string;
        SelectDateEnd: string;
        SelectSeller?: string;
    };

    const getInitialSelectData = (): SelectState => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const fmt = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(d.getDate()).padStart(2, "0")}`;

        return {
            selectedFields: [
                "SelectDateStart",
                "SelectDateEnd",
                "SelectSeller",
            ],
            SelectDateStart: fmt(firstDay),
            SelectDateEnd: fmt(today),
            SelectSeller: "",
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

    const processedContracts = useMemo(() => {
        let processedData = [...listcontracts];

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            processedData = processedData.filter((contract) => {
                return (
                    contract.contract_emission_date.includes(lowerSearchTerm) ||
                    contract.number_contract?.includes(lowerSearchTerm) ||
                    contract.seller?.name
                        ?.toLowerCase()
                        .includes(lowerSearchTerm) ||
                    contract.buyer?.name
                        ?.toLowerCase()
                        .includes(lowerSearchTerm) ||
                    contract.charge_date?.includes(lowerSearchTerm)
                );
            });
        }

        processedData.sort((a, b) => {
            const convertToISO = (dateString: string | undefined) => {
                if (!dateString) return ""; // evita erro se estiver undefined
                const [day, month, year] = dateString.split("/");
                return `${year}-${month.padStart(2, "0")}-${day.padStart(
                    2,
                    "0"
                )}`;
            };

            const aDate = new Date(convertToISO(a.charge_date)).getTime();
            const bDate = new Date(convertToISO(b.charge_date)).getTime();

            return order === "asc" ? aDate - bDate : bDate - aDate;
        });

        return processedData;
    }, [listcontracts, searchTerm, order]);

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
                (contract: { seller: any; charge_date: string }) => {
                    if (
                        typeof contract.seller.name !== "string" ||
                        !contract.seller.name.trim()
                    )
                        return false;

                    const sellerMatch = contract.seller.name
                        .toLowerCase()
                        .includes(searchSeller);

                    if (!contract.charge_date) return false;

                    const [day, month, year] = contract.charge_date
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
            setSelectionModal(false);
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
                header: "Data",
                width: "100px",
            },
            {
                field: "number_contract",
                header: "Contrato",
                width: "180px",
                sortable: true,
            },
            {
                field: "seller.name",
                header: "Vendedor",
                width: "200px",
            },
            {
                field: "buyer.name",
                header: "Comprador",
                width: "200px",
            },
            {
                field: "payment_date",
                header: "Dt.Vencto.",
                width: "130px",
            },
            {
                field: "charge_date",
                header: "Dt.Cobrança",
                width: "130px",
            },
            {
                field: "expected_receipt_date",
                header: "Dt.Prev.Recbto.",
                width: "130px",
            },
        ],
        []
    );

    const handleClearFilterModal = () => {
        setSelectData(getInitialSelectData());
        fetchData();
        setSelectionModal(false);
    };

    const isInitialFilter = useMemo(() => {
        const initial = getInitialSelectData();
        return (
            selectData.SelectDateStart === initial.SelectDateStart &&
            selectData.SelectDateEnd === initial.SelectDateEnd &&
            (selectData.SelectSeller?.trim() ?? "") === ""
        );
    }, [selectData]);

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
                    titleText={`Seleção`}
                    open={isSelectionModal}
                    confirmButton="OK"
                    cancelButton="Fechar"
                    onClose={handleCloseModal}
                    onHandleConfirm={fetchSelectData}
                    variantCancel={"primary"}
                    variantConfirm={"success"}
                >
                    <SFormContainer>
                        <TextField
                            label="Data Cobrança Inicial"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            size="small"
                            name="SelectDateStart"
                            value={selectData.SelectDateStart}
                            onChange={handleChangeSelect}
                        />
                        <TextField
                            label="Data Cobrança Final"
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
                    onClick={() =>
                        toast.success("Imprimir ainda não implementado")
                    }
                >
                    Imprimir
                </CustomButton>

                <CustomButton
                    $variant="success"
                    width="150px"
                    onClick={() =>
                        toast.success("Exportar CSV ainda não implementado")
                    }
                >
                    Exportar CSV
                </CustomButton>
            </SContainerSearchAndButton>

            <CustomTable
                isLoading={isLoading}
                data={processedContracts}
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
