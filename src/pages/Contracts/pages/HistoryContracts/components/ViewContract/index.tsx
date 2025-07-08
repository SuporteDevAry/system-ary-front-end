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
import { Modal } from "../../../../../../components/Modal";
import { CustomStatusIndicator } from "../../../../../../components/CustomStatusIndicator";
import { CustomSelect } from "../../../../../../components/CustomSelect";
import { formatQuantity } from "../../../CreateNewContract/components/Step3/hooks";

export function ViewContract(): JSX.Element {
    const { deleteContract, updateContract } = ContractContext();
    const location = useLocation();
    const navigate = useNavigate();
    const { dataUserInfo } = useInfo();
    const { canConsult, canChangeStatus } = useUserPermissions();
    const [dataClient, setDataClient] = useState<IContractData | null>(null);
    const [modalContent, setModalContent] = useState<string>("");
    const [isDeleteModal, setDeleteModal] = useState<boolean>(false);
    const [isChangeStatusModal, setChangeStatusModal] =
        useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] = useState(
        dataClient?.status.status_current || ""
    );

    const forDisabled = dataClient?.status.status_current === "DELETADO";

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
            status: "DELETADO",
            owner_change: {
                name: dataUserInfo?.name || "",
                email: dataUserInfo?.email || "",
            },
        };

        const updatedStatus = {
            status_current: "DELETADO",
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

    const handleOpenChangeStatusModal = () => {
        setChangeStatusModal(true);
    };
    const handleCloseChangeStatusModal = () => {
        setChangeStatusModal(false);
    };

    const handleChangeStatus = async () => {
        if (!dataClient || !dataClient.id) {
            toast.error("Id do Contrato não encontrado.");
            return;
        }

        if (!selectedStatus) {
            toast.error("Por favor, selecione um status.");
            return;
        }

        const newDate = formattedDate();
        const newTime = formattedTime();

        const newStatusEntry = {
            date: newDate,
            time: newTime,
            status: selectedStatus,
            owner_change: {
                name: dataUserInfo?.name || "",
                email: dataUserInfo?.email || "",
            },
        };

        const updatedStatus = {
            status_current: selectedStatus,
            history: [...dataClient.status.history, newStatusEntry],
        };

        const updatedContract = {
            ...dataClient,
            status: updatedStatus,
        };

        try {
            await updateContract(dataClient?.id, updatedContract);
            toast.success(
                `Status do contrato atualizado para ${selectedStatus}`
            );
            setChangeStatusModal(false);
            navigate("/contratos/historico");
        } catch (error) {
            toast.error(`Erro ao atualizar status: ${error}`);
        }
    };

    // Função para formatar a quantidade
    const typeQuantity = dataClient?.type_quantity;

    const formattedValue = formatQuantity(
        Number(dataClient?.quantity || 0).toString()
    );
    const quantityValue =
        typeQuantity === "toneladas métricas"
            ? Number(dataClient?.quantity)
            : formattedValue;

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
            value: `${quantityValue} ${typeQuantity}`,
        },
        {
            label: "Total do Contrato",
            value: formatCurrency(
                dataClient?.total_contract_value?.toString() ?? "0",
                dataClient?.type_currency ?? "Real"
            ),
        },
    ];

    const contractComunication = [
        {
            label: "Comunicado Interno",
            value: dataClient?.internal_communication,
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
                        <BoxContainer>
                            {canChangeStatus && (
                                <CustomButton
                                    $variant="success"
                                    width="120px"
                                    onClick={handleOpenChangeStatusModal}
                                    disabled={!canChangeStatus}
                                >
                                    Mudar Status
                                </CustomButton>
                            )}

                            <CustomButton
                                $variant="secondary"
                                width="100px"
                                onClick={handleViewPDF}
                            >
                                Visualizar
                            </CustomButton>
                            <CustomButton
                                $variant={"primary"}
                                width="100px"
                                onClick={handleEdit}
                                disabled={forDisabled}
                            >
                                Editar
                            </CustomButton>
                            <CustomButton
                                $variant="danger"
                                width="100px"
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
                <SCardInfo>
                    {contractComunication.map((field, index) => (
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
            <Modal
                titleText={`Selecione um novo status para o contrato ${dataClient?.number_contract}`}
                open={isChangeStatusModal}
                confirmButton="Alterar"
                cancelButton="Fechar"
                onClose={handleCloseChangeStatusModal}
                onHandleConfirm={handleChangeStatus}
                variantCancel={"primary"}
                variantConfirm={"success"}
            >
                <CustomSelect
                    name="changeStatus"
                    label="Novo Status: "
                    $labelPosition="top"
                    selectOptions={[
                        { label: "A Conferir", value: "A CONFERIR" },
                        { label: "Validado", value: "VALIDADO" },
                        { label: "Enviado", value: "ENVIADO" },
                        { label: "Editado", value: "EDITADO" },
                        { label: "Em Pausa", value: "EM PAUSA" },
                        { label: "Cancelado", value: "CANCELADO" },
                        { label: "Deletado", value: "DELETADO" },
                        { label: "Cobrança", value: "COBRANCA" },
                    ]}
                    onSelectChange={(value) => setSelectedStatus(value)}
                    value={selectedStatus}
                />
            </Modal>
        </>
    );
}
