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

export function ChangeInvoice() {
    const contractContext = ContractContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [listcontracts, setListContracts] = useState<IContractData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("contract_emission_date");

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
            "status.status_current",
            "buyer.name",
            "seller.name",
        ],
    });

    useEffect(() => {
        handleSearch();
    }, [searchTerm, handleSearch]);

    const handleViewContract = (contract: IContractData) => {
        navigate("/cobranca/dados-nf", {
            state: { contractForView: contract },
        });
    };

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "status.status_current",
                header: "Status",
                width: "90px",
                sortable: true,
            },
            {
                field: "number_contract",
                header: "Nº Contrato",
                width: "160px",
                sortable: true,
            },
            {
                field: "contract_emission_date",
                header: "Data",
                width: "50px",
                sortable: true,
            },
            {
                field: "seller.name",
                header: "Vendedor",
                width: "160px",
                sortable: true,
            },
            {
                field: "buyer.name",
                header: "Comprador",
                width: "150px",
                sortable: true,
            },
            {
                field: "payment_date",
                header: "Dt.Pagto.",
                width: "150px",
                sortable: true,
            },
            // {
            //     field: "price",
            //     header: "PREÇO",
            //     width: "150px",
            // },
            // {
            //     field: "type_commission_seller",
            //     header: "T",
            //     width: "20px",
            // },
            // {
            //     field: "commission_seller",
            //     header: "COMISSÃO",
            //     width: "100px",
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
            Emitir NF{" "}
        </CustomButton>
    );

    return (
        <SContainer>
            <STitle>Emissão de Nota Fiscal</STitle>

            <SContainerSearchAndButton>
                <CustomSearch
                    width="400px"
                    placeholder="Digite Nº Contrato, Vendedor, Comprador, Status"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </SContainerSearchAndButton>
            <CustomTable
                isLoading={isLoading}
                data={filteredData}
                columns={nameColumns}
                hasPagination
                dateFields={["created_at"]}
                actionButtons={renderActionButtons}
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
