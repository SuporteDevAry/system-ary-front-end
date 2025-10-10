import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import { IColumn } from "../../../../components/CustomTable/types";
import { toast } from "react-toastify";
import useTableSearch from "../../../../hooks/useTableSearch";
import { BillingContext } from "../../../../contexts/BillingContext";
import { IBillingData } from "../../../../contexts/BillingContext/types";

export function BillingsContract() {
    const billingContext = BillingContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [listbillings, setListBillings] = useState<IBillingData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("payment_date");

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);

            const response = await billingContext.listBillings();

            const filteredContracts = response.data;

            // const filteredContracts = response.data
            //     .filter
            //     // (contract: { status: { status_current: string } }) =>
            //     //     contract.status.status_current === "COBRANCA"
            //     ();

            setListBillings(filteredContracts);
        } catch (error) {
            toast.error(
                `Erro ao tentar ler recebimentos, contacte o administrador do sistema: ${error}`
            );
        } finally {
            setIsLoading(false);
        }
    }, [listbillings]);

    useEffect(() => {
        fetchData();
    }, []);

    const { filteredData, handleSearch } = useTableSearch({
        data: listbillings,
        searchTerm,
        searchableFields: ["number_contract", "receipt_date"],
    });

    useEffect(() => {
        handleSearch();
    }, [searchTerm, handleSearch]);

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "number_contract",
                header: "NR.CONTRATO",
                width: "150px",
            },
            {
                field: "receipt_date",
                header: "DATA RECBTO.",
                width: "150px",
            },
            {
                field: "rps_number",
                header: "NR.RPS",
                width: "150px",
            },
            {
                field: "nfs_number",
                header: "NOTA FISCAL",
                width: "150px",
            },
            {
                field: "total_service_value",
                header: "VALOR TOTAL",
                width: "50px",
            },
            {
                field: "irrf_value",
                header: "VLR.IR",
                width: "160px",
            },
            {
                field: "adjustment_value",
                header: "VALOR AJUSTE",
                width: "160px",
            },
            {
                field: "liquid_value",
                header: "VALOR LIQUIDO",
                width: "160px",
            },
            {
                field: "liquid_contract",
                header: "LIQUIDADO",
                width: "160px",
            },
        ],
        []
    );

    return (
        <SContainer>
            <STitle>Recebimentos do Contrato</STitle>

            <SContainerSearchAndButton>
                <CustomSearch
                    width="400px"
                    placeholder="Digite Contrato, Data ou Vendedor"
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
