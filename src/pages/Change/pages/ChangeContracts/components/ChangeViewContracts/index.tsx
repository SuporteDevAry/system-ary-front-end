import { useEffect, useState } from "react";
import {
    SBox,
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
import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { CustomStatusIndicator } from "../../../../../../components/CustomStatusIndicator";
import CustomTable from "../../../../../../components/CustomTable";
import { ModalCreateNewReceipt } from "../modalNewReceipt";

export function ChangeViewContract(): JSX.Element {
    const location = useLocation();
    //const { dataUserInfo } = useInfo();
    const [dataClient, setDataClient] = useState<IContractData | null>(null);
    //const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isNewReceiptModalOpen, setNewReceiptModalOpen] =
        useState<boolean>(false);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("data");

    useEffect(() => {
        const contractForView: IContractData = location.state?.contractForView;
        setDataClient(contractForView);
    }, [location]);

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

    const renderActionButtons = (row: any) => (
        <CustomButton
            $variant="secondary"
            width="75px"
            onClick={() => handleEditReceipt(row)}
        >
            Editar
        </CustomButton>
    );
    const formatValor = (value: number | bigint) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
        }).format(value);
    };
    const recebtos = [
        {
            dataRecebto: "01/08/2025",
            rps: "0001001",
            dataNF: "01/08/2025",
            nf: "0005450",
            valor_bruto: 1500.0,
            valor_ir: 200.0,
            valor_liq: 1300.0,
        },
        {
            dataRecebto: "01/08/2025",
            rps: "0001002",
            dataNF: "01/08/2025",
            nf: "0005451",
            valor_bruto: 1000.0,
            valor_ir: 100.0,
            valor_liq: 900.0,
        },
        {
            dataRecebto: "03/08/2025",
            rps: "0001005",
            dataNF: "03/08/2025",
            nf: "0005455",
            valor_bruto: 21500.0,
            valor_ir: 500.0,
            valor_liq: 21000.0,
        },
    ];
    const nameColRecebto = [
        {
            field: "dataRecebto",
            header: "DATA",
            width: "100px",
        },
        {
            field: "dataNF",
            header: "DATA NF",
            width: "100px",
            sortable: true,
        },
        {
            field: "nf",
            header: "NOTA FISCAL",
            width: "100px",
        },
        {
            field: "valor_bruto",
            header: "VALOR BRUTO",
            width: "100px",
        },
        {
            field: "valor_ir",
            header: "I.R.",
            width: "100px",
        },
        {
            field: "valor_liq",
            header: "VALOR LIQ.",
            width: "100px",
            value: formatValor(recebtos[0].valor_liq),
        },
    ];

    const contractFieldsCol1 = [
        { label: "Produto", value: dataClient?.name_product },
        { label: "Vendedor", value: dataClient?.seller.name?.split(" ")[0] },
        {
            label: "Quantidade",
            value: dataClient?.quantity,
        },
        {
            label: "Valor Comissão",
            value: formatCurrency(
                dataClient?.vlr_comissao ?? "0",
                dataClient?.vlr_comissao ?? "Real"
            ),
        },
        {
            label: "Total Recebido",
            value: formatCurrency(
                dataClient?.tot_recebido?.toString() ?? "0",
                dataClient?.tot_recebido ?? "Real"
            ),
        },
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
            value: dataClient?.liquidado,
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

                                    //onClick={handleViewPDF}
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
                    width="100px"
                    onClick={handleCreateNewReceipt}
                >
                    Novo
                </CustomButton>
                <CustomTable
                    //isLoading={isLoading}
                    data={recebtos}
                    columns={nameColRecebto}
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
            <ModalCreateNewReceipt
                open={isNewReceiptModalOpen}
                onClose={handleCloseNewReceipt}
            />
        </>
    );
}
