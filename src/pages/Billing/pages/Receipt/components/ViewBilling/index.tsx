import { useCallback, useEffect, useState } from "react";
import {
    SBox,
    SButtonContainer,
    SCardInfo,
    SCardInfoActions,
    SCardInfoNumber,
    SContainer,
    SKeyContainer,
    SkeyName,
    SKeyValue,
    SNumberContract,
    STitle,
} from "./styles";

import { useLocation } from "react-router-dom";
import { IContractData } from "../../../../../../contexts/ContractContext/types";
import CustomButton from "../../../../../../components/CustomButton";
//import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { CustomStatusIndicator } from "../../../../../../components/CustomStatusIndicator";
import CustomTable from "../../../../../../components/CustomTable";

import { createRoot } from "react-dom/client";
import ContratoTemplate from "../../../../../../templates/contrato";
import PdfGenerator from "../../../../../../helpers/PDFGenerator";
import { BillingContext } from "../../../../../../contexts/BillingContext";
import { IBillings } from "../../../../../../contexts/BillingContext/types";
import { toast } from "react-toastify";
import { ModalCreateNewBilling } from "../ModalCreateNewBilling";

export function ViewBilling(): JSX.Element {
    const location = useLocation();
    const [dataClient, setDataClient] = useState<IContractData | null>(null);
    const [isNewReceiptModalOpen, setNewReceiptModalOpen] =
        useState<boolean>(false);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("data");
    const billingContext = BillingContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [listBillings, setListBillings] = useState<IBillings[]>([]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await billingContext.listBillings();

            setListBillings(response.data);
        } catch (error) {
            toast.error(`Erro ao tentar ler Recebimentos: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [listBillings]);

    useEffect(() => {
        const contractForView: IContractData = location.state?.contractForView;
        setDataClient(contractForView);

        fetchData();
    }, [location]);

    const handleChange = (
        e:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | { target: { name: string; value: any } }
    ) => {
        const { name, value } = e.target;
        setDataClient((prev) =>
            prev
                ? {
                      ...prev,
                      [name]: name === "final_quantity" ? Number(value) : value,
                  }
                : prev
        );
    };

    const handleEditBilling = async () => {};

    const handleCreateNewReceipt = async () => {
        setNewReceiptModalOpen(true);
    };

    const handleCloseNewReceipt = () => {
        setNewReceiptModalOpen(false);
        //fetchData();
    };

    const handleEditReceipt = (row: any) => {
        const dadosEdit = row;
        console.log(dadosEdit);
        setNewReceiptModalOpen(true);
    };

    const handleViewPDF = () => {
        let nomePDF =
            dataClient?.number_contract === undefined
                ? ""
                : dataClient.number_contract;

        // Cria um container temporário invisível
        const container = document.createElement("div");
        container.style.display = "none";
        document.body.appendChild(container);

        // Renderiza o ContratoTemplate dentro do container usando createRoot
        const root = createRoot(container);
        root.render(
            <ContratoTemplate formData={dataClient} nomeArquivo={nomePDF} />
        );

        // Aguarda a renderização e, então, gera o PDF
        setTimeout(() => {
            PdfGenerator(document, "contrato", nomePDF, "window");

            // Remove o container temporário após a geração do PDF
            document.body.removeChild(container);
        }, 1000);
    };

    const renderActionButtons = (row: any) => (
        <SButtonContainer>
            <CustomButton
                $variant="secondary"
                width="75px"
                onClick={() => handleEditReceipt(row)}
            >
                Editar
            </CustomButton>
        </SButtonContainer>
    );

    // const formatValor = (value: number | bigint) => {
    //     return new Intl.NumberFormat("pt-BR", {
    //         style: "currency",
    //         currency: "BRL",
    //         minimumFractionDigits: 2,
    //     }).format(value);
    // };

    const nameCols = [
        {
            field: "receipt_date",
            header: "DATA",
            width: "100px",
        },
        {
            field: "nfs_number",
            header: "NRO.NF",
            width: "100px",
            sortable: true,
        },
        {
            field: "total_service_value",
            header: "VALOR TOTAL",
            width: "100px",
        },
        {
            field: "irrf_value",
            header: "I.R.",
            width: "100px",
        },
        // {
        //     field: "liquid_value",
        //     header: "VALOR LIQ.",
        //     width: "100px",
        //     value: formatValor(recebtos[0].valor_liq),
        // },
    ];

    const contractFieldsCol1 = [
        { label: "Produto", value: dataClient?.name_product },
        { label: "Vendedor", value: dataClient?.seller.name?.split(" ")[0] },
        {
            label: "Quantidade",
            value: dataClient?.quantity,
        },
        // {
        //     label: "Valor Comissão",
        //     value: formatCurrency(
        //         dataClient?.commission_contract ?? "0",
        //         dataClient?.commission_contract ?? "Real"
        //     ),
        // },
        // {
        //     label: "Total Recebido",
        //     value: formatCurrency(
        //         dataClient?.total_received?.toString() ?? "0",
        //         dataClient?.total_received ?? "Real"
        //     ),
        // },
    ];

    const contractFieldsCol2 = [
        {
            label: "Data Pagamento",
            value: dataClient?.payment_date,
        },
        { label: "Comprador", value: dataClient?.buyer.name?.split(" ")[0] },
        {
            label: "Quantidade Final",
            value: dataClient?.quantity.toString() ?? "0",
        },
        {
            label: "Liquidado",
            value: "", //dataClient?.status_received,
        },
    ];

    const column1 = contractFieldsCol1;
    const column2 = contractFieldsCol2;

    return (
        <>
            <SContainer>
                <STitle>Recebimento - Dados do Contrato</STitle>
                <SBox>
                    <SCardInfoNumber>
                        <SKeyContainer>
                            <SkeyName>
                                Nº Contrato:
                                <SNumberContract>
                                    {dataClient?.number_contract}
                                </SNumberContract>
                            </SkeyName>
                        </SKeyContainer>
                    </SCardInfoNumber>
                    <SCardInfoActions>
                        <SKeyContainer>
                            <SkeyName>
                                Status:
                                <SKeyValue>
                                    <CustomStatusIndicator
                                        status={
                                            dataClient?.status.status_current ||
                                            ""
                                        }
                                        text={
                                            dataClient?.status.status_current ||
                                            ""
                                        }
                                    />
                                </SKeyValue>
                                <br></br>
                                <CustomButton
                                    $variant="secondary"
                                    width="100px"
                                    onClick={handleViewPDF}
                                >
                                    Visualizar
                                </CustomButton>
                            </SkeyName>
                        </SKeyContainer>
                    </SCardInfoActions>
                </SBox>
                <SBox>
                    <SCardInfo>
                        <div
                            style={{
                                gap: "10px",
                                width: "50%",
                            }}
                        >
                            {column1.map((field, index) => (
                                <SKeyContainer key={index}>
                                    <SkeyName>
                                        {field.label}:
                                        <SKeyValue>{field.value}</SKeyValue>
                                    </SkeyName>
                                </SKeyContainer>
                            ))}
                        </div>
                        <div
                            style={{
                                gap: "10px",
                                width: "50%",
                            }}
                        >
                            {column2.map((field, index) => (
                                <SKeyContainer key={index}>
                                    <SkeyName>
                                        {field.label}:
                                        <SKeyValue>{field.value}</SKeyValue>
                                    </SkeyName>
                                </SKeyContainer>
                            ))}
                        </div>
                    </SCardInfo>
                </SBox>

                <CustomButton
                    $variant={"success"}
                    width="200px"
                    onClick={handleCreateNewReceipt}
                >
                    Novo Recebimento
                </CustomButton>
                <CustomTable
                    isLoading={isLoading}
                    data={listBillings}
                    columns={nameCols}
                    hasPagination
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
            <ModalCreateNewBilling
                open={isNewReceiptModalOpen}
                dataBillings={[]}
                onClose={handleCloseNewReceipt}
                onConfirm={handleEditBilling}
                onHandleChange={handleChange}
            />
        </>
    );
}
