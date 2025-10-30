import { useCallback, useEffect, useState } from "react";
import {
    BoxContainer,
    SBox,
    SButtonContainer,
    SCardInfo,
    SCardInfoActions,
    SCardInfoAdjust,
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
import { CustomStatusIndicator } from "../../../../../../components/CustomStatusIndicator";
import CustomTable from "../../../../../../components/CustomTable";
import { createRoot } from "react-dom/client";
import ContratoTemplate from "../../../../../../templates/contrato";
import PdfGenerator from "../../../../../../helpers/PDFGenerator";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ModalBilling } from "../ModalBilling";
import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { ModalDelete } from "../../../../../../components/ModalDelete";
import { BillingContext } from "../../../../../../contexts/BillingContext";
import { ContractContext } from "../../../../../../contexts/ContractContext";
import useInfo from "../../../../../../hooks/userInfo";
import {
    formattedDate,
    formattedTime,
} from "../../../../../../helpers/dateFormat";
import {
    numberToQuantityString,
    parseQuantityToNumber,
} from "../../../../../../helpers/quantityFormat";
import { ModalEditQuantity } from "../../../../../Contracts/pages/HistoryContracts/components/ViewContract/components/ModalEditQuantity";

export function ViewBilling(): JSX.Element {
    const { updateContract, updateContractAdjustments } = ContractContext();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("data");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [listBillings, setListBillings] = useState<any[]>([]);
    const [billingToEdit, setBillingToEdit] = useState<any | null>(null);
    const [modalContent, setModalContent] = useState<string>("");
    const navigate = useNavigate();
    const { dataUserInfo } = useInfo();
    const [billingIdForDelete, setBillingIdForDelete] = useState<
        string | undefined
    >();
    const [contractId, setContractId] = useState<any>();
    const [isModelDeleteOpen, setIsModalDelete] = useState<boolean>(false);
    const [isEditQuantityModal, setEditQuantityModal] =
        useState<boolean>(false);
    const [contractForModal, setContractForModal] =
        useState<IContractData | null>(null);
    const billingContext = BillingContext();

    const dataClient = location.state.contractForView as IContractData;
    const [formData, setFormData] = useState(() => ({
        receipt_date: billingToEdit?.receipt_date || "",
        rps_number: billingToEdit?.rps_number || "",
        nfs_number: billingToEdit?.nfs_number || "",
        internal_receipt_number: billingToEdit?.internal_receipt_number || "",
        total_service_value: billingToEdit?.total_service_value || 0,
        irrf_value: billingToEdit?.irrf_value || 0,
        adjustment_value: billingToEdit?.adjustment_value || 0,
        liquid_value: billingToEdit?.liquid_value || 0,
        liquid_contract: billingToEdit?.liquid_contract || "",
        liquid_contract_date: billingToEdit?.liquid_contract_date || "",
        number_contract: billingToEdit?.number_contract || "",
        product_name: billingToEdit?.product_name || "",
        number_broker: billingToEdit?.number_broker || "",
        year: billingToEdit?.year || "",
        expected_receipt_date: billingToEdit?.expected_receipt_date || "",
        owner_record: billingToEdit?.owner_record || "",
    }));

    const fetchData = useCallback(async () => {
        try {
            if (!dataClient?.number_contract) return;

            setContractId(dataClient.id);

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
        fetchData();
    }, [dataClient]);

    const handleOpenModal = (billing?: any) => {
        setBillingToEdit(billing || null);
        setIsModalOpen(true);
    };

    const handleConfirmBilling = async () => {
        // TODO: VERIFICAR QUAIS CAMPOS DEVERAO SER VALIDADOS.
        // if (
        //     !formData.receipt_date ||
        //     !formData.total_service_value ||
        //     !formData.liquid_value
        // ) {
        //     toast.error(
        //         "Por favor, preencha Data, Valor Total e Valor Líquido."
        //     );
        //     return;
        // }
        try {
            if (billingToEdit?.id) {
                const res = await billingContext.updateBilling(
                    billingToEdit?.id,
                    {
                        ...formData,
                        owner_record: dataUserInfo?.email || "",
                        liquid_contract_date:
                            formData?.liquid_contract == "Sim"
                                ? formData?.receipt_date.toString()
                                : "",
                    }
                );

                if (res.status === 200) {
                    const req_number_contract =
                        dataClient?.number_contract || "";

                    const resTotalContract =
                        await billingContext.getBillingByNumberContract(
                            req_number_contract
                        );

                    const totReceivedContract = resTotalContract.data.reduce(
                        (acc: number, item: { liquid_value: any }) =>
                            acc +
                            parseFloat(
                                (item.liquid_value || "0").replace(",", ".")
                            ),
                        0
                    );

                    const totalReceived = totReceivedContract.toFixed(2);
                    const newContractForToUpdate: Partial<IContractData> = {
                        day_exchange_rate: undefined,
                        final_quantity: undefined,
                        total_received: totalReceived,
                        status_received: formData.liquid_contract,
                    };

                    const resContract = await updateContractAdjustments(
                        contractId,
                        newContractForToUpdate
                    );
                    // Grava contrato como Liquidado
                    if (
                        formData.liquid_contract == "Sim" &&
                        resContract.status !== "LIQUIDADO"
                    ) {
                        const newDate = formattedDate();
                        const newTime = formattedTime();

                        const newStatusEntry = {
                            date: newDate,
                            time: newTime,
                            status: "LIQUIDADO",
                            owner_change: {
                                name: dataUserInfo?.name || "",
                                email: dataUserInfo?.email || "",
                            },
                        };

                        const updatedStatus = {
                            status_current: "LIQUIDADO",
                            history: [
                                ...resContract.data.status.history,
                                newStatusEntry,
                            ],
                        };
                        const contractForToUpdate = {
                            ...(resContract.data as IContractData),
                            status: updatedStatus,
                        };

                        await updateContract(contractId, contractForToUpdate);

                        navigate("/cobranca/visualizar-recebimento", {
                            state: { contractForView: resContract.data },
                        });
                    }

                    // Retornar contrato para Cobranca caso volte de Liquidado
                    if (
                        formData.liquid_contract == "Não" &&
                        resContract.status === "LIQUIDADO"
                    ) {
                        const newDate = formattedDate();
                        const newTime = formattedTime();

                        const newStatusEntry = {
                            date: newDate,
                            time: newTime,
                            status: "COBRANCA",
                            owner_change: {
                                name: dataUserInfo?.name || "",
                                email: dataUserInfo?.email || "",
                            },
                        };
                        const updatedStatus = {
                            status_current: "COBRANCA",
                            history: [
                                ...resContract.data.status.history,
                                newStatusEntry,
                            ],
                        };
                        const contractToUpdate = {
                            ...(resContract.data as IContractData),
                            status: updatedStatus,
                        };
                        await updateContract(contractId, contractToUpdate);

                        navigate("/cobranca/visualizar-recebimento", {
                            state: { contractForView: resContract.data },
                        });
                    }

                    navigate("/cobranca/visualizar-recebimento", {
                        state: { contractForView: resContract.data },
                    });
                }
                toast.success(
                    `Recebimento ${formData.rps_number} foi atualizado com sucesso!`
                );
            } else {
                const res = await billingContext.createBilling({
                    ...formData,
                    owner_record: dataUserInfo?.email || "",
                    liquid_contract_date:
                        formData.liquid_contract == "Sim"
                            ? formData.receipt_date
                            : "",
                });
                if (res.status === 201) {
                    const totalReceived =
                        Number(dataClient?.total_received) +
                        Number(formData.liquid_value);
                    const updatedContract: Partial<IContractData> = {
                        day_exchange_rate: undefined,
                        final_quantity: undefined,
                        total_received: totalReceived,
                        status_received: formData.liquid_contract,
                    };
                    const resContract = await updateContractAdjustments(
                        contractId,
                        updatedContract
                    );

                    // Grava contrato como Liquidado
                    if (
                        formData.liquid_contract == "Sim" &&
                        resContract.data.status !== "LIQUIDADO"
                    ) {
                        const newDate = formattedDate();
                        const newTime = formattedTime();

                        const newStatusEntry = {
                            date: newDate,
                            time: newTime,
                            status: "LIQUIDADO",
                            owner_change: {
                                name: dataUserInfo?.name || "",
                                email: dataUserInfo?.email || "",
                            },
                        };
                        const updatedStatus = {
                            status_current: "LIQUIDADO",
                            history: [
                                ...resContract.data.status.history,
                                newStatusEntry,
                            ],
                        };
                        const contractToUpdate = {
                            ...(resContract.data as IContractData),
                            status: updatedStatus,
                        };
                        await updateContract(contractId, contractToUpdate);

                        navigate("/cobranca/visualizar-recebimento", {
                            state: { contractForView: resContract.data },
                        });
                    }
                    // Retornar contrato para Cobranca caso volte de Liquidado
                    if (
                        formData.liquid_contract == "Não" &&
                        resContract.status === "LIQUIDADO"
                    ) {
                        const newDate = formattedDate();
                        const newTime = formattedTime();

                        const newStatusEntry = {
                            date: newDate,
                            time: newTime,
                            status: "COBRANCA",
                            owner_change: {
                                name: dataUserInfo?.name || "",
                                email: dataUserInfo?.email || "",
                            },
                        };
                        const updatedStatus = {
                            status_current: "COBRANCA",
                            history: [
                                ...resContract.data.status.history,
                                newStatusEntry,
                            ],
                        };
                        const contractToUpdate = {
                            ...(resContract.data as IContractData),
                            status: updatedStatus,
                        };
                        await updateContract(contractId, contractToUpdate);

                        navigate("/cobranca/visualizar-recebimento", {
                            state: { contractForView: resContract.data },
                        });
                    }

                    navigate("/cobranca/visualizar-recebimento", {
                        state: { contractForView: resContract.data },
                    });
                }
                toast.success(
                    `Recebimento ${formData.rps_number} foi criado com sucesso!`
                );
            }
        } catch (error) {
            toast.error(
                `Erro ao tentar ${
                    billingToEdit?.id ? "editar" : "criar"
                } o recebimento: ${error}`
            );
        }
        setIsModalOpen(false);
    };

    const handleCloseNewBilling = () => setIsModalOpen(false);

    const handleOpenDeleteBillingModal = (billing: any) => {
        setIsModalDelete(true);
        setModalContent(
            `Deletar o recebimento selecionado: ${billing?.rps_number} ?`
        );
        setBillingIdForDelete(billing.id);
    };

    const handleCloseDeleteModal = () => {
        setIsModalDelete(false);
    };

    const handleDeleteBilling = async () => {
        try {
            if (!billingIdForDelete) return;

            await billingContext.deleteBilling(billingIdForDelete);

            const req_number_contract = dataClient?.number_contract || "";

            const resTotalContract =
                await billingContext.getBillingByNumberContract(
                    req_number_contract
                );

            const totReceivedContract = resTotalContract.data.reduce(
                (acc: number, item: { liquid_value: any }) =>
                    acc +
                    parseFloat((item.liquid_value || "0").replace(",", ".")),
                0
            );

            const totalReceived = totReceivedContract.toFixed(2);
            const newContractForToUpdate: Partial<IContractData> = {
                day_exchange_rate: undefined,
                final_quantity: undefined,
                total_received: totalReceived,
                status_received: totalReceived === 0 ? "Não" : "Sim",
            };
            const resContract = await updateContractAdjustments(
                contractId,
                newContractForToUpdate
            );

            navigate("/cobranca/visualizar-recebimento", {
                state: { contractForView: resContract.data },
            });

            toast.success("Recebimento deletado com sucesso!");
            fetchData();
        } catch (error) {
            toast.error(
                `Erro ao tentar deletar recebimento ID: ${billingIdForDelete}, contacte o administrador do sistema ${error}`
            );
        } finally {
            setIsModalDelete(false);
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

        const dataToPdf = {
            ...dataClient,
            quantity: numberToQuantityString(dataClient?.quantity ?? 0),
        };

        // Renderiza o ContratoTemplate dentro do container usando createRoot
        const root = createRoot(container);
        root.render(
            <ContratoTemplate formData={dataToPdf} nomeArquivo={nomePDF} />
        );

        // Aguarda a renderização e, então, gera o PDF
        setTimeout(() => {
            PdfGenerator(document, "contrato", nomePDF, "window");

            // Remove o container temporário após a geração do PDF
            document.body.removeChild(container);
        }, 1000);
    };

    const nameCols = [
        {
            field: "receipt_date",
            header: "Data",
            width: "100px",
        },
        {
            field: "rps_number",
            header: "Nº RPS",
            width: "100px",
        },
        {
            field: "nfs_number",
            header: "Nº NF",
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

    //

    const handleChange = (
        e:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | { target: { name: string; value: any } }
    ) => {
        const { name, value } = e.target as { name: string; value: any };
        setContractForModal((prev) =>
            prev ? ({ ...prev, [name]: value } as IContractData) : prev
        );
    };

    const handleOpenEditQuantityModal = () => {
        // initialize a mutable copy of the contract for the modal
        setContractForModal({
            ...dataClient,
            final_quantity: dataClient?.final_quantity || 0,
        } as IContractData);
        setEditQuantityModal(true);
    };
    const handleCloseEditQuantityModal = () => {
        setEditQuantityModal(false);
        setContractForModal(null);
    };

    const handleEditQuantity = async () => {
        if (!contractForModal || !contractForModal.id) {
            toast.error("Id do Contrato não encontrado.");
            return;
        }

        // Monta um objeto apenas com os ajustes válidos (a partir do contrato do modal)
        const adjustments: Partial<IContractData> = {};

        if (
            contractForModal.final_quantity !== undefined &&
            contractForModal.final_quantity !== null
        ) {
            const quantityValue =
                typeof contractForModal.final_quantity === "string"
                    ? parseQuantityToNumber(contractForModal.final_quantity)
                    : contractForModal.final_quantity;
            adjustments.final_quantity = quantityValue;
        }

        if (contractForModal.payment_date)
            adjustments.payment_date = contractForModal.payment_date;

        if (contractForModal.charge_date)
            adjustments.charge_date = contractForModal.charge_date;

        if (contractForModal.expected_receipt_date)
            adjustments.expected_receipt_date =
                contractForModal.expected_receipt_date;

        if (
            contractForModal.status_received !== undefined &&
            contractForModal.status_received !== null &&
            contractForModal.status_received !== ""
        )
            adjustments.status_received = contractForModal.status_received;

        if (
            contractForModal.internal_communication !== undefined &&
            contractForModal.internal_communication !== null &&
            contractForModal.internal_communication !== ""
        )
            adjustments.internal_communication =
                contractForModal.internal_communication;

        if (
            contractForModal.day_exchange_rate !== undefined &&
            contractForModal.day_exchange_rate !== null &&
            contractForModal.day_exchange_rate !== ""
        )
            adjustments.day_exchange_rate = contractForModal.day_exchange_rate;

        if (
            contractForModal.number_external_contract_buyer !== undefined &&
            contractForModal.number_external_contract_buyer !== null &&
            contractForModal.number_external_contract_buyer !== ""
        )
            adjustments.number_external_contract_buyer =
                contractForModal.number_external_contract_buyer;

        // Se nenhum campo foi alterado
        if (Object.keys(adjustments).length === 0) {
            toast.warn("Nenhum ajuste foi informado.");
            return;
        }

        try {
            if (!dataClient?.id) {
                toast.error("ID do contrato não encontrado");
                return;
            }
            await updateContractAdjustments(dataClient.id, adjustments);
            toast.success(`Contrato atualizado com sucesso`);
            setEditQuantityModal(false);
            navigate("/cobranca/recebimento");
        } catch (error) {
            toast.error(`Erro ao atualizar status: ${error}`);
        }
    };

    const typeQuantity = dataClient?.type_quantity;
    const unityMeasure = typeQuantity === "toneladas métricas" ? "Tm" : "Kg";

    const quantityValue = Number(dataClient?.quantity || 0);
    const finalQuantityValue = Number(dataClient?.final_quantity || 0);

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
            label: "Total do Contrato:",
            value: formatCurrency(
                dataClient?.total_contract_value?.toString() ?? "0",
                "Real"
            ),
        },
        { label: "", value: "" }, //[x]: Não remover!!!
        {
            label: "Quantidade:",
            value: `${numberToQuantityString(quantityValue)} ${unityMeasure}`,
        },
        {
            label: "Quantidade Final:",
            value: `${numberToQuantityString(
                finalQuantityValue
            )} ${unityMeasure}`,
        },

        {
            label: "Comissão:",
            value: commission,
        },
        {
            label: "Valor Comissão:",
            value: formatCurrency(
                dataClient?.commission_contract?.toString() ?? "0",
                "Real"
            ),
        },

        {
            label: "Total Recebido:",
            value: formatCurrency(
                dataClient?.total_received?.toString() ?? "0",
                "Real"
            ),
        },
        {
            label: "Data do Pagamento:",
            value: dataClient?.payment_date,
        },
        {
            label: "Data da Cobrança:",
            value: dataClient?.charge_date || "-",
        },
        {
            label: "Data Prevista Recebimento:",
            value: dataClient?.expected_receipt_date || "-",
        },

        {
            label: "Liquidado:",
            value: dataClient?.status_received?.toString() || "",
        },

        ...(dataClient?.type_currency === "Dólar"
            ? [
                  {
                      label: "Cotação Negociada:",
                      value: dataClient?.day_exchange_rate || "-",
                  },
              ]
            : []),
    ];

    const renderActionButtons = (row: any) => (
        <SButtonContainer>
            <CustomButton
                $variant="secondary"
                width="75px"
                onClick={() => handleOpenModal(row)}
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
                            <SkeyName>
                                Emissão:
                                <SKeyValue>
                                    {dataClient?.contract_emission_date}
                                </SKeyValue>
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
                                width="180px"
                                // onClick={handleCreateNewBilling}
                                onClick={() => handleOpenModal()}
                            >
                                Novo Recebimento
                            </CustomButton>
                            <CustomButton
                                $variant={"primary"}
                                width="100px"
                                onClick={handleOpenEditQuantityModal}
                            >
                                Alterar
                            </CustomButton>
                        </BoxContainer>
                    </SCardInfoActions>
                </SBox>
                <SCardInfo>
                    {contractSellerAndBuyer.map((field, index) => (
                        <SKeyContainer key={index}>
                            <SkeyName>
                                {field.label}:
                                <SKeyValue>{field.value}</SKeyValue>
                            </SkeyName>
                        </SKeyContainer>
                    ))}
                </SCardInfo>

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
            </SContainer>
            {isModalOpen && (
                <ModalBilling
                    open={isModalOpen}
                    billingToEdit={billingToEdit}
                    onClose={handleCloseNewBilling}
                    onConfirm={handleConfirmBilling}
                    contractRead={dataClient}
                    formData={formData}
                    setFormData={setFormData}
                />
            )}
            {isModelDeleteOpen && (
                <ModalDelete
                    open={isModelDeleteOpen}
                    onClose={handleCloseDeleteModal}
                    content={modalContent}
                    onConfirm={handleDeleteBilling}
                />
            )}
            {isEditQuantityModal && (
                <ModalEditQuantity
                    open={isEditQuantityModal}
                    dataContract={contractForModal ?? dataClient}
                    onClose={handleCloseEditQuantityModal}
                    onConfirm={handleEditQuantity}
                    onHandleChange={handleChange}
                />
            )}
        </>
    );
}
