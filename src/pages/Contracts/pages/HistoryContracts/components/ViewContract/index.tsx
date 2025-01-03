import { useEffect, useState } from "react";
import {
    BoxContainer,
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

import { useLocation, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import { IContractData } from "../../../../../../contexts/ContractContext/types";
import CustomButton from "../../../../../../components/CustomButton";
import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { useInfo, useUserPermissions } from "../../../../../../hooks";
import { ContractContext } from "../../../../../../contexts/ContractContext";
import {
    formattedDate,
    formattedTime,
} from "../../../../../../helpers/dateFormat";
import { ModalDelete } from "../../../../../../components/ModalDelete";
import PdfGenerator from "../../../../../../helpers/PDFGenerator";
import ContratoTemplate from "../../../../../../templates/contrato";
import { createRoot } from "react-dom/client";

export function ViewContract(): JSX.Element {
    const { deleteContract } = ContractContext();
    const location = useLocation();
    const navigate = useNavigate();
    const { dataUserInfo } = useInfo();
    const { canConsult } = useUserPermissions();
    const [dataClient, setDataClient] = useState<IContractData | null>(null);
    const [modalContent, setModalContent] = useState<string>("");
    const [isDeleteModal, setDeleteModal] = useState<boolean>(false);

    const forDisabled = dataClient?.status.status_current === "Deletado";

    useEffect(() => {
        const contractForView: IContractData = location.state?.contractForView;
        setDataClient(contractForView);
    }, [location]);

    const handleEdit = () => {
        navigate("/contratos/editar-contrato", {
            state: { contractData: dataClient, isEditMode: true },
        });
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

    const handleOpenDeleteModal = () => {
        setModalContent(
            `Tem certeza que deseja deletar o contrato: ${dataClient?.number_contract}?`
        );

        setDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModal(false);
    };

    const handleContractDelete = async () => {
        if (!dataClient || !dataClient.id) {
            toast.error("Id do Contrato não encontrado.");
            return;
        }

        const newDate = formattedDate();
        const newTime = formattedTime();

        const newStatusEntry = {
            date: newDate,
            time: newTime,
            status: "Deletado",
            owner_change: {
                name: dataUserInfo?.name || "",
                email: dataUserInfo?.email || "",
            },
        };

        const updatedStatus = {
            status_current: "Deletado",
            history: [...dataClient.status.history, newStatusEntry],
        };

        const updatedContract = {
            ...dataClient,
            status: updatedStatus,
        };

        try {
            await deleteContract(dataClient?.id, updatedContract);
            toast.success(
                <div>
                    Contrato de Número:
                    <strong>{dataClient.number_contract}</strong> deletado com
                    sucesso!
                </div>
            );
            navigate("/contratos/historico");
        } catch (error) {
            toast.error(
                `Erro ao tentar deletar contrato: ${dataClient.number_contract}, contacte o administrador do sistema ${error}`
            );
        } finally {
            setDeleteModal(false);
        }
    };

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
            label:
                dataClient?.product === "O" || dataClient?.product === "F"
                    ? "Quantidade Tonelada Métrica"
                    : "Quantidade de saca",
            value:
                dataClient?.quantity_bag && dataClient?.type_currency
                    ? Number(dataClient.quantity_bag).toFixed(2)
                    : "0,00",
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
                                    {dataClient?.status.status_current}
                                </SKeyValue>
                            </SkeyName>
                        </SKeyContainer>
                        <BoxContainer>
                            <CustomButton
                                $variant="secondary"
                                width="90px"
                                onClick={handleViewPDF}
                            >
                                Visualizar
                            </CustomButton>
                            <CustomButton
                                $variant={"primary"}
                                width="70px"
                                onClick={handleEdit}
                                disabled={forDisabled}
                            >
                                Editar
                            </CustomButton>
                            <CustomButton
                                $variant="danger"
                                width="70px"
                                onClick={handleOpenDeleteModal}
                                disabled={forDisabled || canConsult}
                            >
                                Deletar
                            </CustomButton>
                        </BoxContainer>
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
            <ModalDelete
                open={isDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleContractDelete}
                content={modalContent}
            />
        </>
    );
}
