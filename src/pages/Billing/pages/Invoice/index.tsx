import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useTableSearch from "../../../../hooks/useTableSearch";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomButton from "../../../../components/CustomButton";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import {
    BoxContainer,
    SButtonContainer,
    SCardInfo,
    SContainer,
    SContainerSearchAndButton,
    STitle,
} from "./styles";
import { ContractContext } from "../../../../contexts/ContractContext";
import { IContractData } from "../../../../contexts/ContractContext/types";
import dayjs from "dayjs";
import { InvoiceContext } from "../../../../contexts/InvoiceContext";
import { IInvoices } from "../../../../contexts/InvoiceContext/types";
import CardContent from "@mui/material/CardContent";
//import { IBillings } from "../../../../contexts/BillingContext/types";
//import { BillingContext } from "../../../../contexts/BillingContext";

export function Invoice() {
    const contractContext = ContractContext();
    const invoiceContext = InvoiceContext();
    //const billingContext = BillingContext();
    const [listInvoices, setListInvoices] = useState<IInvoices[]>([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [listcontracts, setListContracts] = useState<IContractData[]>([]);
    const [selectedContract, setSelectedContract] = useState<IContractData[]>();
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(5);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("payment_date");
    const currentDate = dayjs().format("YYYYMMDD");

    // const [modalContent, setModalContent] = useState<string>("");
    // const [selectedBilling, setSelectedBilling] = useState<IBillings | null>(
    //     null
    // );
    // const [isUpdateModalBilling, setUpdateModalBilling] =
    //     useState<boolean>(false);
    // const [isDeleteModalBilling, setDeleteModalBilling] =
    //     useState<boolean>(false);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await contractContext.listContracts();

            const filteredContracts = response.data.filter(
                (contract: { status: { status_current: string } }) =>
                    contract.status.status_current === "COBRANCA"
            );

            setListContracts(filteredContracts);

            const responseInvoice = await invoiceContext.listInvoices();

            const invoices = responseInvoice.data.filter(
                (invoice: { nfs_number: string }) => invoice.nfs_number == ""
            );
            setListInvoices(invoices);
        } catch (error) {
            toast.error(
                `Erro ao tentar ler contratos, contacte o administrador do sistema: ${error}`
            );
        } finally {
            setIsLoading(false);
        }
    }, [contractContext, invoiceContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const { filteredData, handleSearch } = useTableSearch({
        data: listcontracts,
        searchTerm,
        searchableFields: ["number_contract", "seller.name"],
    });

    useEffect(() => {
        handleSearch();
    }, [searchTerm, handleSearch]);

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "status.status_current",
                header: "Status",
                width: "50px",
                sortable: true,
            },
            {
                field: "number_contract",
                header: "Nº Contrato",
                width: "100px",
                sortable: true,
            },
            {
                field: "contract_emission_date",
                header: "Dt.Emissão",
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
                field: "payment_date",
                header: "Dt.Pagto",
                width: "100px",
                sortable: true,
            },
            // {
            //     field: "rpsGerada",
            //     header: "Nr.RPS",
            //     width: "100px",
            //     sortable: true,
            // },
        ],
        []
    );

    interface EmissorData {
        inscricaoMunicipal: string;
        dataInicial: string;
        dataFinal: string;
    }

    const dataEmissor: EmissorData[] = [
        {
            inscricaoMunicipal: "12345678",
            dataInicial: currentDate,
            dataFinal: currentDate,
        },
    ];

    const padRight = (value: string, length: number) =>
        (value || "").padEnd(length, " ").substring(0, length);

    const padLeft = (value: string, length: number) =>
        (value || "").padStart(length, "0").substring(0, length);

    const formatDate = (date: string): string => {
        const [day, month, year] = date.split("/");
        return `${year}${month}${day}`;
    };

    // Registro tipo 1 - emissor
    const gerarRegistroTipo1 = (emissor: EmissorData): string => {
        return (
            "1" +
            padRight(emissor.inscricaoMunicipal, 14) +
            padRight(emissor.dataInicial, 8) +
            padRight(emissor.dataFinal, 8)
        );
    };

    // Registro tipo 2 - RPS do tomador
    const gerarRegistroTipo2 = (data: IInvoices): string => {
        return (
            "2" + // identificador
            padRight("RPS", 5) +
            padRight("A", 5) +
            padLeft(data.rps_number, 12) +
            formatDate(data.rps_emission_date) +
            padRight("T", 1) +
            padLeft(data.service_value.toString().replace(".", ""), 15) +
            padLeft(data.deduction_value.toString().replace(".", ""), 15) +
            padLeft("06009", 5) +
            padLeft("0500", 4) +
            padRight("2", 1) +
            padRight("2", 1) +
            padRight(data.cpf_cnpj, 14) +
            padRight("00000000", 8) +
            padRight("000000000000", 12) +
            padRight(data.name.toUpperCase(), 75) +
            padRight(data.address.toUpperCase(), 53) +
            padRight(data.number, 10) +
            padRight(data.complement || "", 30) +
            padRight(data.district.toUpperCase(), 30) +
            padRight(data.city.toUpperCase(), 50) +
            padRight(data.state.toUpperCase(), 2) +
            padRight(data.zip_code.replace("-", ""), 8) +
            padRight(data.email, 75) +
            padRight(data.service_discrim.replace(/(\r\n|\n|\r)/g, "|"), 1000)
        );
    };

    // Registro tipo 9 - trailer
    const gerarRegistroTipo9 = (
        qtd: number,
        totalServicos: number,
        totalDeducoes: number
    ): string => {
        return (
            "9" +
            padLeft(qtd.toString(), 7) +
            padLeft(totalServicos.toFixed(2).replace(".", ""), 15) +
            padLeft(totalDeducoes.toFixed(2).replace(".", ""), 15)
        );
    };

    const handleGeraRPS = () => {
        if (!selectedContract) {
            toast.error("Nenhum contrato selecionado");
            return;
        }

        navigate("/cobranca/dados-nf", {
            state: { selectedContract: selectedContract },
        });
    };

    // Geração do arquivo
    const handleGeraNF = () => {
        const linhas: string[] = [];
        let totalServicos = 0;
        let totalDeducoes = 0;

        linhas.push(gerarRegistroTipo1(dataEmissor[0])); // registro tipo 1
        listInvoices.forEach((rps) => {
            linhas.push(gerarRegistroTipo2(rps));
            totalServicos += parseFloat(rps.service_value.toString() || "0");
            totalDeducoes += parseFloat(rps.deduction_value.toString() || "0");
        });
        linhas.push(
            gerarRegistroTipo9(
                listInvoices.length,
                totalServicos,
                totalDeducoes
            )
        );

        const conteudo = linhas.join("\r\n");

        const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;

        const data1 = dataEmissor[0].dataInicial;
        const data2 = dataEmissor[0].dataFinal;

        // Nome dinâmico
        const nomeArquivo = `rps_gerada_${data1}_a_${data2}.txt`;

        link.download = nomeArquivo;
        link.click();

        URL.revokeObjectURL(url);
    };

    // const handleUpdateBillingModal = (billing: IBillings) => {
    //     setUpdateModalBilling(true);
    //     setSelectedBilling(billing);
    // };

    // const handleCloseBillingModal = () => {
    //     setUpdateModalBilling(false);
    //     fetchData();
    // };

    // const handleDeleteBilling = async () => {
    //     if (!selectedBilling) return;
    //     try {
    //         await billingContext.deleteBilling(selectedBilling.id);

    //         toast.success(
    //             `RPS ${selectedBilling.rps_number}, foi deletada com sucesso!`
    //         );
    //         fetchData();
    //     } catch (error) {
    //         toast.error(
    //             `Erro ao tentar excluir RPS, contacte o administrador do sistema ${error}`
    //         );
    //     } finally {
    //         setDeleteModalBilling(false);
    //         setSelectedBilling(null);
    //     }
    // };

    // const handleOpenDeleteModal = (billings: IBillings) => {
    //     setModalContent(
    //         `Tem certeza que deseja deletar a RPS: ${billings.rps_number}?`
    //     );
    //     setSelectedBilling(billings);
    //     setDeleteModalBilling(true);
    // };

    // const handleCloseDeleteModal = () => {
    //     setDeleteModalBilling(false);
    //     setSelectedBilling(null);
    //     fetchData();
    // };

    const nameColumnsFromRPS = useMemo(
        () => [
            { field: "rps_number", header: "RPS", sortable: true },
            { field: "nfs_number", header: "NF", sortable: true },
            { field: "number_contract", header: "CONTRATO", sortable: true },
        ],
        []
    );

    const renderActionButtons = useCallback(
        //(row: any) => (
        () => (
            <SButtonContainer>
                <CustomButton
                    $variant={"primary"}
                    width="80px"
                    // onClick={() => handleUpdateBillingModal(row)}
                >
                    Editar
                </CustomButton>
                <CustomButton
                    $variant={"danger"}
                    width="80px"
                    // onClick={() => handleOpenDeleteModal(row)}
                >
                    Deletar
                </CustomButton>
            </SButtonContainer>
        ),
        //  [handleUpdateBillingModal, handleCloseDeleteModal]
        []
    );

    return (
        <SContainer>
            <STitle>Emissão de RPS</STitle>

            <SContainerSearchAndButton>
                <CustomSearch
                    width="400px"
                    placeholder="Digite Nº Contrato ou Vendedor"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <CustomButton
                    $variant="success"
                    width="180px"
                    onClick={handleGeraRPS}
                >
                    Gravar RPS
                </CustomButton>
                <CustomButton
                    $variant="success"
                    width="180px"
                    onClick={handleGeraNF}
                >
                    Gerar Arquivo RPS
                </CustomButton>
            </SContainerSearchAndButton>
            <CustomTable
                isLoading={isLoading}
                data={filteredData}
                columns={nameColumns}
                hasPagination
                hasCheckbox
                dateFields={["created_at"]}
                maxChars={15}
                page={page}
                setPage={setPage}
                order={order}
                orderBy={orderBy}
                setOrder={setOrder}
                setOrderBy={setOrderBy}
                onRowClick={(rowData) => setSelectedContract(rowData)}
            />

            <SCardInfo>
                <STitle>RPS Geradas</STitle>
                <BoxContainer>
                    <CustomSearch
                        width="400px"
                        placeholder="Digite o Nome ou E-mail"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </BoxContainer>
                <CardContent>
                    <CustomTable
                        data={listInvoices}
                        columns={nameColumnsFromRPS}
                        isLoading={isLoading}
                        hasPagination={true}
                        actionButtons={renderActionButtons}
                        page={page}
                        setPage={setPage}
                        order={order}
                        orderBy={orderBy}
                        setOrder={setOrder}
                        setOrderBy={setOrderBy}
                    />
                </CardContent>
            </SCardInfo>
        </SContainer>
    );
}
