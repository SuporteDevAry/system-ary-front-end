import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CustomButton from "../../../../components/CustomButton";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
//import { useNavigate } from "react-router-dom";
import useTableSearch from "../../../../hooks/useTableSearch";

export function NotaFiscal() {
    const contractContext = ContractContext();
    //const navigate = useNavigate();
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
        searchableFields: ["rpsGerada", "nf", "seller.name"],
    });

    useEffect(() => {
        handleSearch();
    }, [searchTerm, handleSearch]);

    // const handleViewContract = (contract: IContractData) => {
    //     navigate("/cobranca/visualizar-contrato", {
    //         state: { contractForView: contract },
    //     });
    // };

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "rpsGerada",
                header: "NR.RPS",
                width: "150px",
                sortable: true,
            },
            {
                field: "nf",
                header: "NOTA FISCAL",
                width: "150px",
                sortable: true,
            },
            {
                field: "payment_date",
                header: "Data",
                width: "50px",
                sortable: true,
            },
            {
                field: "seller.name",
                header: "VENDEDOR",
                width: "160px",
                sortable: true,
            },
            {
                field: "price",
                header: "VALOR NFS",
                width: "160px",
                sortable: true,
            },
        ],
        []
    );

    // const renderActionButtons = (row: any) => (
    //     <CustomButton
    //         $variant="secondary"
    //         width="75px"
    //         onClick={() => handleViewContract(row)}
    //     >
    //         Receber
    //     </CustomButton>
    // );

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    ("");

    const handleButtonClick = () => {
        fileInputRef.current?.click(); // dispara o clique no input escondido
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // TODO: Montar lógica para leitura do arquivo e gravação das NFS
            //console.log("Arquivo selecionado:", file.name);
            // aqui você pode fazer upload ou qualquer outra lógica
        }
    };

    return (
        <SContainer>
            <STitle>Atualiza RPS p/ Nota Fiscal</STitle>

            <SContainerSearchAndButton>
                <CustomSearch
                    width="400px"
                    placeholder="Digite Nº RPS, NF ou Vendedor"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <CustomButton
                    $variant="success"
                    width="180px"
                    onClick={handleButtonClick}
                >
                    Importar Arquivo NFS
                </CustomButton>
            </SContainerSearchAndButton>
            <CustomTable
                isLoading={isLoading}
                data={filteredData}
                columns={nameColumns}
                hasPagination
                dateFields={["created_at"]}
                // actionButtons={renderActionButtons}
                maxChars={15}
                page={page}
                setPage={setPage}
                order={order}
                orderBy={orderBy}
                setOrder={setOrder}
                setOrderBy={setOrderBy}
            />
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </SContainer>
    );
}
