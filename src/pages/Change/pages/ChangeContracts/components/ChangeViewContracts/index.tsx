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

export function ChangeViewContract(): JSX.Element {
    const location = useLocation();
    //const { dataUserInfo } = useInfo();
    const [dataClient, setDataClient] = useState<IContractData | null>(null);
    //const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("contract_emission_date");

    useEffect(() => {
        const contractForView: IContractData = location.state?.contractForView;
        setDataClient(contractForView);
    }, [location]);

    const handleNew = () => {};
    //setIsLoading(false);

    const formatValor = (value: number | bigint) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
        }).format(value);
    };
    const recebtos = [
        {
            data: "01/06/2025",
            data_nf: "01/06/2025",
            nf: "0001001",
            valor_bruto: 1500.0,
            valor_ir: 200.0,
            valor_liq: 1300.0,
        },
        {
            data: "01/06/2025",
            data_nf: "01/06/2025",
            nf: "0001002",
            valor_bruto: 2000.0,
            valor_ir: 300.0,
            valor_liq: 1700.0,
        },
        {
            data: "01/06/2025",
            data_nf: "01/06/2025",
            nf: "0001003",
            valor_bruto: 1800.0,
            valor_ir: 250.0,
            valor_liq: 1550.0,
        },
        {
            data: "01/06/2025",
            data_nf: "01/06/2025",
            nf: "0001004",
            valor_bruto: 2200.0,
            valor_ir: 350.0,
            valor_liq: 1850.0,
        },
        {
            data: "01/06/2025",
            data_nf: "01/06/2025",
            nf: "0001005",
            valor_bruto: 2500.0,
            valor_ir: 400.0,
            valor_liq: 2100.0,
        },
    ];
    const nameColRecebto = [
        {
            field: "data",
            header: "DATA COBRANÇA",
            width: "100px",
        },
        {
            field: "data_nf",
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

    const contractFields = [
        { label: "Produto", value: dataClient?.name_product },
        { label: "Vendedor", value: dataClient?.seller.name },
        { label: "Comprador", value: dataClient?.buyer.name },
        {
            label: "Preço",
            value: formatCurrency(
                dataClient?.price?.toString() ?? "0",
                dataClient?.type_currency ?? "Real"
            ),
        },
        {
            label: "Quantidade",
            value: dataClient?.quantity,
        },
        {
            label: "Total do Contrato",
            value: formatCurrency(
                dataClient?.total_contract_value?.toString() ?? "0",
                dataClient?.type_currency ?? "Real"
            ),
        },
    ];

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
                            </SkeyName>
                        </SKeyContainer>
                        <CustomButton
                            $variant="secondary"
                            width="100px"
                            //onClick={handleViewPDF}
                        >
                            Visualizar
                        </CustomButton>
                    </SCardInfoActions>
                </SBox>

                <SCardInfo>
                    {contractFields.map((field, index) => (
                        <SKeyContainer key={index}>
                            <SkeyName>
                                {field.label}:
                                <SKeyValue>{field.value}</SKeyValue>
                            </SkeyName>
                        </SKeyContainer>
                    ))}
                </SCardInfo>
                <CustomButton
                    $variant="success"
                    width="150px"
                    onClick={handleNew}
                >
                    Novo
                </CustomButton>
                <CustomTable
                    //isLoading={isLoading}
                    data={recebtos}
                    columns={nameColRecebto}
                    hasPagination
                    maxChars={15}
                    page={page}
                    setPage={setPage}
                    order={order}
                    orderBy={orderBy}
                    setOrder={setOrder}
                    setOrderBy={setOrderBy}
                />
            </SContainer>
        </>
    );
}
