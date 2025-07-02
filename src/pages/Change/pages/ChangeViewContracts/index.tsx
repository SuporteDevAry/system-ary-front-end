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

import { IContractData } from "../../../../contexts/ContractContext/types";
import CustomButton from "../../../../components/CustomButton";
import { formatCurrency } from "../../../../helpers/currencyFormat";
import { CustomStatusIndicator } from "../../../../components/CustomStatusIndicator";

export function ChangeViewContract(): JSX.Element {
    const location = useLocation();
    //const { dataUserInfo } = useInfo();
    const [dataClient, setDataClient] = useState<IContractData | null>(null);

    useEffect(() => {
        const contractForView: IContractData = location.state?.contractForView;
        setDataClient(contractForView);
    }, [location]);

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
                <STitle>Dados do Contrato</STitle>
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
            </SContainer>
        </>
    );
}
