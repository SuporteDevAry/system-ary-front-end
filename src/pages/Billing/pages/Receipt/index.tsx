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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

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
                    contract.status.status_current === "COBRANCA"
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
        navigate("/cobranca/visualizar-contrato", {
            state: { contractForView: contract },
        });
    };

    const nameColumns: IColumn[] = useMemo(
        () => [
            // {
            //     field: "status.status_current",
            //     header: "Status",
            //     width: "90px",
            //     sortable: true,
            // },
            {
                field: "contract_emission_date",
                header: "DATA",
                width: "100px",
                sortable: true,
            },
            {
                field: "number_contract",
                header: "Nº CONTRATO",
                width: "100px",
                sortable: true,
            },
            {
                field: "seller.name",
                header: "VENDEDOR",
                width: "160px",
                sortable: true,
            },
            {
                field: "buyer.name",
                header: "COMPRADOR",
                width: "160px",
                sortable: true,
            },
            {
                field: "payment_date",
                header: "DT.PAGTO.",
                width: "150px",
                sortable: true,
            },
            {
                field: "expected_receipt_date",
                header: "PREV.PAGTO",
                width: "150px",
            },
            {
                field: "charge_date",
                header: "DT.COBRANÇA",
                width: "150px",
            },
            // {
            //     field: "rpsGerada",
            //     header: "Nr.RPS",
            //     width: "100px",
            //     sortable: true,
            // },
            // {
            //     field: "notaFiscal",
            //     header: "NF",
            //     width: "100px",
            //     sortable: true,
            // },
            // {
            //     field: "recibo",
            //     header: "Recibo",
            //     width: "100px",
            //     sortable: true,
            // },
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
                <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label="Somente Pagamento no mês corrente"
                />
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
