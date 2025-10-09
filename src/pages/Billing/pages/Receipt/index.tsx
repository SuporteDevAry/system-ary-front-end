import { useCallback, useEffect, useMemo, useState } from "react";
import CustomButton from "../../../../components/CustomButton";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { useNavigate } from "react-router-dom";
import useTableSearch from "../../../../hooks/useTableSearch";
import { CustomTimeline } from "../../../Contracts/pages/HistoryContracts/components/CustomTimeline";
// import Checkbox from "@mui/material/Checkbox";
// import FormControlLabel from "@mui/material/FormControlLabel";

export function Receipt() {
    const contractContext = ContractContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [listcontracts, setListContracts] = useState<IContractData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("payment_date");

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await contractContext.listContracts();

            const filteredContracts = response.data.filter(
                (contract: { status: { status_current: string } }) =>
                    contract.status.status_current === "COBRANÇA"
            );

            setListContracts(filteredContracts);
        } catch (error) {
            toast.error(
                `Erro ao tentar ler contratos, contacte o administrador do sistema: ${error}`
            );
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
            "number_contract",
            "buyer.name",
            "seller.name",
            "payment_date",
        ],
    });

    useEffect(() => {
        handleSearch();
    }, [searchTerm, handleSearch]);

    const handleViewContract = (contract: IContractData) => {
        navigate("/cobranca/visualizar-recebimento", {
            state: { contractForView: contract },
        });
    };

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "contract_emission_date",
                header: "Data",
                width: "100px",
            },
            {
                field: "number_contract",
                header: "Nº Contrato",
                width: "100px",
            },
            {
                field: "seller.name",
                header: "Vendedor",
                width: "160px",
            },
            {
                field: "buyer.name",
                header: "Comprador",
                width: "160px",
            },
            {
                field: "payment_date",
                header: "DT.PAGTO.",
                width: "150px",
            },
            {
                field: "expected_receipt_date",
                header: "PREV.PAGTO",
                width: "150px",
            },
        ],
        []
    );

    const renderActionButtons = (row: any) => (
        <CustomButton
            $variant="secondary"
            width="75px"
            onClick={() => handleViewContract(row)}
        >
            Receber
        </CustomButton>
    );

    return (
        <SContainer>
            <STitle>Recebimento</STitle>

            <SContainerSearchAndButton>
                <CustomSearch
                    width="450px"
                    placeholder="Digite Nº Contrato,Vendedor,Comprador ou Dt.Pagto"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label="Somente Pagamento no mês corrente"
                /> */}
            </SContainerSearchAndButton>
            <CustomTable
                isLoading={isLoading}
                data={filteredData}
                columns={nameColumns}
                hasPagination
                dateFields={["created_at"]}
                actionButtons={renderActionButtons}
                collapsible
                renderChildren={(row) => (
                    <CustomTimeline events={row.status.history || []} />
                )}
                maxChars={15}
                page={page}
                setPage={setPage}
                order={order}
                orderBy={orderBy}
                setOrder={setOrder}
                setOrderBy={setOrderBy}
            />
        </SContainer>
    );
}
