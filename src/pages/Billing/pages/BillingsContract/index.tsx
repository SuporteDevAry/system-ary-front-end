import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import {
    SContainer,
    SContainerSearchAndButton,
    SCustomTableWrapper,
    STitle,
} from "./styles";
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

            const filteredContracts = response.data.map((item: any) => ({
                ...item,
                total_service_value: item.total_service_value
                    ? Number(item.total_service_value).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                      })
                    : "",
                irrf_value: item.irrf_value
                    ? Number(item.irrf_value).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                      })
                    : "",
                adjustment_value: item.adjustment_value
                    ? Number(item.adjustment_value).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                      })
                    : "",
                liquid_value: item.liquid_value
                    ? Number(item.liquid_value).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                      })
                    : "",
            }));

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
                header: "Nr.Contrato",
                width: "150px",
            },
            {
                field: "receipt_date",
                header: "Dt.Recbto.",
                width: "150px",
            },
            {
                field: "rps_number",
                header: "Nr.RPS",
                width: "150px",
            },
            {
                field: "nfs_number",
                header: "Nr.NF",
                width: "150px",
            },
            {
                field: "total_service_value",
                header: "Vlr. Total",
                width: "50px",
                align: "right",
                render: (value: string | null) =>
                    value != null && value !== ""
                        ? Number(value).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                          })
                        : "",
            },
            {
                field: "irrf_value",
                header: "Vlr.IR",
                width: "160px",
                align: "right",
                render: (value: string | null) =>
                    value != null && value !== ""
                        ? Number(value).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                          })
                        : "",
            },
            {
                field: "adjustment_value",
                header: "Valor Ajuste",
                width: "160px",
                align: "right",
                render: (value: string | null) =>
                    value != null && value !== ""
                        ? Number(value).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                          })
                        : "",
            },
            {
                field: "liquid_value",
                header: "Valor Líquido",
                width: "160px",
                align: "right",
                render: (value: string | null) =>
                    value != null && value !== ""
                        ? Number(value).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                          })
                        : "",
            },
            {
                field: "status_received",
                header: "Liquidado",
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
            <SCustomTableWrapper>
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
            </SCustomTableWrapper>
        </SContainer>
    );
}
