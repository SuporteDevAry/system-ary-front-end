import { useCallback, useEffect, useState } from "react";
import {
    BoxContainer,
    SBox,
    SButtonContainer,
    SCardInfo,
    SCardInfoActions,
    SCardInfoAdjust,
    SCardInfoNumber,
    SCardInfoParts,
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
import { CustomStatusIndicator } from "../../../../../../components/CustomStatusIndicator";
import CustomTable from "../../../../../../components/CustomTable";
import { createRoot } from "react-dom/client";
import ContratoTemplate from "../../../../../../templates/contrato";
import PdfGenerator from "../../../../../../helpers/PDFGenerator";
import { BillingContext } from "../../../../../../contexts/BillingContext";
import { toast } from "react-toastify";
import { ModalBilling } from "../ModalBilling";
import { formatQuantity } from "../../../../../Contracts/pages/CreateNewContract/components/Step3/hooks";
import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { IBillingData } from "../../../../../../contexts/BillingContext/types";
import { ModalDelete } from "../../../../../../components/ModalDelete";

export function ViewBilling(): JSX.Element {
    const location = useLocation();
    const [dataClient, setDataClient] = useState<IContractData | null>(null);
    const [isNewBillingModalOpen, setNewBillingModalOpen] =
        useState<boolean>(false);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("data");
    const billingContext = BillingContext();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [listBillings, setListBillings] = useState<IBillingData[]>([]);
    const [modalContent, setModalContent] = useState<string>("");
    const [billingToEdit, setBillingToEdit] = useState<IBillingData | null>(
        null
    );
    const [billingIdForDelete, setBillingIdForDelete] = useState();
    const [isDeleteBillingModal, setDeleteBillingModal] =
        useState<boolean>(false);

    const fetchData = useCallback(async () => {
        try {
            if (!dataClient?.number_contract) return;

            setIsLoading(true);
            const response = await billingContext.listBillings();
            const filteredBillings = response.data
                .filter(
                    (billings: { number_contract: any }) =>
                        billings.number_contract === dataClient?.number_contract
                )
                .map((bill: any) => ({
                    ...bill,
                    // Tirei formatCurrency, pq o R$ nào permite a ediçào em input number
                    // total_service_value: formatCurrency(
                    //     bill.total_service_value || 0,
                    //     "Real"
                    // ),
                    total_service_value: Number(
                        bill.total_service_value
                    ).toFixed(2),
                    irrf_value: Number(bill.irrf_value).toFixed(2),
                    adjustment_value: Number(bill.adjustment_value).toFixed(2),
                    liquid_value: Number(bill.liquid_value).toFixed(2),
                    number_contract: dataClient.number_contract,
                    product_name: dataClient.name_product,
                    number_broker: dataClient.number_broker,
                    year: dataClient.number_contract?.split("/")[1],
                    contractId: dataClient.id,
                }));
            setListBillings(filteredBillings);
        } catch (error) {
            toast.error(`Erro ao tentar ler Recebimentos: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [dataClient]);

    useEffect(() => {
        const contractForView: IContractData = location.state?.contractForView;
        setDataClient(contractForView);

        fetchData();
    }, [location, dataClient]);

    const handleCreateNewBilling = () => {
        if (!dataClient) return;

        const newBillingData: Partial<IBillingData> = {
            number_contract: dataClient.number_contract,
            product_name: dataClient.name_product,
            number_broker: dataClient.number_broker,
            year: dataClient.number_contract?.split("/")[1],
        };

        setBillingToEdit(newBillingData as IBillingData);
        setNewBillingModalOpen(true);
    };

    const handleEditBilling = (billing: IBillingData) => {
        setBillingToEdit(billing);
        setNewBillingModalOpen(true);
    };

    const handleCloseNewBilling = () => {
        setBillingToEdit(null);
        setNewBillingModalOpen(false);
        fetchData();
    };

    const handleOpenDeleteBillingModal = (billing: any) => {
        setModalContent(
            `Deletar o recebimento selecionado: ${billing?.rps_number} ?`
        );
        setBillingIdForDelete(billing.id);
        setDeleteBillingModal(true);
    };

    const handleCloseDeleteModal = () => {
        setDeleteBillingModal(false);
    };

    const handleDeleteBilling = async () => {
        try {
            if (!billingIdForDelete) return;

            await billingContext.deleteBilling(billingIdForDelete);
            toast.success(<div>Recebimento deletado com sucesso!</div>);
            fetchData();
        } catch (error) {
            toast.error(
                `Erro ao tentar deletar recebimento ID: ${billingIdForDelete}, contacte o administrador do sistema ${error}`
            );
        } finally {
            setDeleteBillingModal(false);
        }
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
                onClick={() => handleEditBilling(row)}
            >
                Editar
            </CustomButton>
            <CustomButton
                $variant={"danger"}
                width="80px"
                onClick={() => handleOpenDeleteBillingModal(row)}
            >
                Deletar
            </CustomButton>
        </SButtonContainer>
    );

    const nameCols = [
        {
            field: "receipt_date",
            header: "Data",
            width: "100px",
        },
        {
            field: "rps_number",
            header: "Nr.RPS",
            width: "100px",
        },
        {
            field: "nfs_number",
            header: "Nr.NF",
            width: "100px",
        },
        {
            field: "total_service_value",
            header: "Valor Total",
            width: "100px",
        },
        {
            field: "irrf_value",
            header: "I.R.",
            width: "100px",
        },
        {
            field: "liquid_value",
            header: "Valor Liquido",
            width: "100px",
        },
        {
            field: "liquid_contract",
            header: "Liquidado",
            width: "100px",
        },
    ];

    const typeQuantity = dataClient?.type_quantity;

    const formattedValue = formatQuantity(
        Number(dataClient?.quantity || 0).toString()
    );

    const formattedValueFinal = formatQuantity(
        Number(dataClient?.final_quantity || 0).toString()
    );
    const quantityValue =
        typeQuantity === "toneladas métricas"
            ? Number(dataClient?.quantity)
            : formattedValue;

    const finalQuantityValue =
        typeQuantity === "toneladas métricas"
            ? Number(dataClient?.final_quantity)
            : formattedValueFinal;

    const contractSellerAndBuyer = [
        { label: "Vendedor", value: dataClient?.seller.name },
        { label: "Comprador", value: dataClient?.buyer.name },
    ];

    const commission =
        (
            dataClient?.type_commission_seller ||
            dataClient?.type_commission_buyer
        )?.toLocaleLowerCase() === "percentual"
            ? `${dataClient?.commission_seller}%`
            : `R$ ${dataClient?.commission_seller}`;

    const contractFields = [
        {
            label: "Preço:",
            value: formatCurrency(
                dataClient?.price?.toString() ?? "0",
                dataClient?.type_currency ?? "Real"
            ),
        },
        { label: "", value: "" }, //[x]: Não remover!!!
        { label: "Produto:", value: dataClient?.name_product },
        { label: "", value: "" }, //[x]: Não remover!!!
        {
            label: "Total do Contrato",
            value: formatCurrency(
                dataClient?.total_contract_value?.toString() ?? "0",
                dataClient?.type_currency ?? "Real"
            ),
        },
        { label: "", value: "" }, //[x]: Não remover!!!
        {
            label: "Quantidade",
            value: `${quantityValue} ${typeQuantity}`,
        },
        {
            label: "Quantidade Final",
            value: `${finalQuantityValue} ${typeQuantity}`,
        },

        {
            label: "Comissão",
            value: commission,
        },
        {
            label: "Valor Comissão",
            value: formatCurrency(
                dataClient?.commission_contract?.toString() ?? "0",
                "Real"
            ),
        },

        {
            label: "Total Recebido",
            value: formatCurrency(
                dataClient?.total_received?.toString() ?? "0",
                "Real"
            ),
        },
        {
            label: "Data do Pagamento",
            value: dataClient?.payment_date,
        },
        {
            label: "Data da Cobrança",
            value: dataClient?.charge_date || "-",
        },
        {
            label: "Data Prevista Recebimento",
            value: dataClient?.expected_receipt_date || "-",
        },

        {
            label: "Liquidado",
            value: dataClient?.status_received?.toString() || "",
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
                        <BoxContainer>
                            <CustomButton
                                $variant="secondary"
                                width="120px"
                                onClick={handleViewPDF}
                            >
                                Visualizar
                            </CustomButton>
                            <CustomButton
                                $variant={"success"}
                                width="200px"
                                onClick={handleCreateNewBilling}
                            >
                                Novo Recebimento
                            </CustomButton>
                        </BoxContainer>
                    </SCardInfoActions>
                </SBox>
                <SCardInfoParts>
                    {contractSellerAndBuyer.map((field, index) => (
                        <SKeyContainer key={index}>
                            <SkeyName>
                                {field.label}:
                                <SKeyValue>{field.value}</SKeyValue>
                            </SkeyName>
                        </SKeyContainer>
                    ))}
                </SCardInfoParts>

                <SCardInfoAdjust>
                    {contractFields.map((field, index) => (
                        <SKeyContainer key={index}>
                            <SkeyName>
                                {field.label}
                                <SKeyValue>{field.value}</SKeyValue>
                            </SkeyName>
                        </SKeyContainer>
                    ))}
                </SCardInfoAdjust>

                <SCardInfo>
                    <SKeyContainer>
                        <SkeyName>
                            Comunicado Interno:
                            <SKeyValue>
                                {dataClient?.internal_communication}
                            </SKeyValue>
                        </SkeyName>
                    </SKeyContainer>
                </SCardInfo>
            </SContainer>
            <SCardInfo>
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
            </SCardInfo>
            <ModalBilling
                open={isNewBillingModalOpen}
                billingToEdit={billingToEdit}
                onClose={handleCloseNewBilling}
                contractRead={dataClient}
            />
            <ModalDelete
                open={isDeleteBillingModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteBilling}
                content={modalContent}
            />
        </>
    );
}
