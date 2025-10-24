import { useEffect, useState } from "react";
import {
  BoxContainer,
  SBox,
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
import {
  parseQuantityToNumber,
  numberToQuantityString,
} from "../../../../../../helpers/quantityFormat";
import { ModalEditQuantity } from "./components/ModalEditQuantity";

export function ViewContract(): JSX.Element {
  const { deleteContract, updateContract, updateContractAdjustments } =
    ContractContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { dataUserInfo } = useInfo();
  const { canConsult, canChangeStatus } = useUserPermissions();
  const [dataClient, setDataClient] = useState<IContractData | null>(null);
  const [modalContent, setModalContent] = useState<string>("");
  const [isDeleteModal, setDeleteModal] = useState<boolean>(false);
  const [isEditQuantityModal, setEditQuantityModal] = useState<boolean>(false);
  const [isChangeStatusModal, setChangeStatusModal] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState(
    dataClient?.status.status_current || ""
  );

  const forDisabled =
    dataClient?.status.status_current === "DELETADO" ||
    dataClient?.status.status_current === "LIQUIDADO";

  useEffect(() => {
    const contractForView: IContractData = location.state?.contractForView;

    setDataClient(contractForView);
  }, [location]);

  const handleDuplicate = () => {
    if (!dataClient) return;

    // [x]:Para Duplicar um contrato, reseta campos específicos que devem ser novos no contrato duplicado.
    const duplicatedContract = {
      ...dataClient,
      id: "",
      number_contract: "",
      contract_emission_date: formattedDate(),
      status: {
        status_current: "A CONFERIR",
        history: [],
      },
      final_quantity: "",
      status_received: "",
      total_received: 0,
      charge_date: "",
      expected_receipt_date: "",
      internal_communication: "",
      number_external_contract_buyer: "",
      number_external_contract_seller: "",
      day_exchange_rate: "",
    };

    navigate("/contratos/novo-contrato", {
      state: { contractData: duplicatedContract, isDuplicateMode: true },
    });
  };

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

  // handleChange genérico
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
            [name]: value,
          }
        : prev
    );
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
          <strong>{dataClient.number_contract}</strong> deletado com sucesso!
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
      toast.success(`Status do contrato atualizado para ${selectedStatus}`);
      setChangeStatusModal(false);
      navigate("/contratos/historico");
    } catch (error) {
      toast.error(`Erro ao atualizar status: ${error}`);
    }
  };

  const handleOpenEditQuantityModal = () => {
    setEditQuantityModal(true);
  };
  const handleCloseEditQuantityModal = () => {
    setEditQuantityModal(false);
  };

  const handleEditQuantity = async () => {
    if (!dataClient || !dataClient.id) {
      toast.error("Id do Contrato não encontrado.");
      return;
    }

    // Monta um objeto apenas com os ajustes válidos
    const adjustments: Partial<IContractData> = {};

    if (
      dataClient.final_quantity !== undefined &&
      dataClient.final_quantity !== null
    ) {
      const quantityValue =
        typeof dataClient.final_quantity === "string"
          ? parseQuantityToNumber(dataClient.final_quantity)
          : dataClient.final_quantity;
      adjustments.final_quantity = quantityValue;
    }

    if (dataClient.payment_date)
      adjustments.payment_date = dataClient.payment_date;

    if (dataClient.charge_date)
      adjustments.charge_date = dataClient.charge_date;

    if (dataClient.expected_receipt_date)
      adjustments.expected_receipt_date = dataClient.expected_receipt_date;

    if (
      dataClient.status_received !== undefined &&
      dataClient.status_received !== null &&
      dataClient.status_received !== ""
    )
      adjustments.status_received = dataClient.status_received;

    if (
      dataClient.internal_communication !== undefined &&
      dataClient.internal_communication !== null &&
      dataClient.internal_communication !== ""
    )
      adjustments.internal_communication = dataClient.internal_communication;

    if (
      dataClient.day_exchange_rate !== undefined &&
      dataClient.day_exchange_rate !== null &&
      dataClient.day_exchange_rate !== ""
    )
      adjustments.day_exchange_rate = dataClient.day_exchange_rate;

    if (
      dataClient.number_external_contract_buyer !== undefined &&
      dataClient.number_external_contract_buyer !== null &&
      dataClient.number_external_contract_buyer !== ""
    )
      adjustments.number_external_contract_buyer =
        dataClient.number_external_contract_buyer;

    // Se nenhum campo foi alterado
    if (Object.keys(adjustments).length === 0) {
      toast.warn("Nenhum ajuste foi informado.");
      return;
    }

    try {
      await updateContractAdjustments(dataClient?.id, adjustments);
      toast.success(`Contrato atualizado com sucesso`);
      setEditQuantityModal(false);
      navigate("/contratos/historico");
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
      dataClient?.type_commission_seller || dataClient?.type_commission_buyer
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
      value: `${numberToQuantityString(finalQuantityValue)} ${unityMeasure}`,
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

  return (
    <>
      <SContainer>
        <STitle>Dados do Contrato</STitle>
        <SBox>
          <SCardInfoNumber>
            <SKeyContainer>
              <SkeyName>
                Nº Contrato:
                <SNumberContract>{dataClient?.number_contract}</SNumberContract>
              </SkeyName>
              <SkeyName>
                Emissão:
                <SKeyValue>{dataClient?.contract_emission_date}</SKeyValue>
              </SkeyName>
            </SKeyContainer>
          </SCardInfoNumber>
          <SCardInfoActions>
            <SKeyContainer>
              <SkeyName>
                Status:
                <SKeyValue>
                  <CustomStatusIndicator
                    status={dataClient?.status.status_current || ""}
                    text={dataClient?.status.status_current || ""}
                  />
                </SKeyValue>
              </SkeyName>
            </SKeyContainer>
            <BoxContainer>
              {canChangeStatus && (
                <CustomButton
                  $variant="success"
                  width="140px"
                  onClick={handleOpenChangeStatusModal}
                  disabled={!canChangeStatus}
                >
                  Mudar Status
                </CustomButton>
              )}

              <CustomButton
                $variant="secondary"
                width="120px"
                onClick={handleViewPDF}
              >
                Visualizar
              </CustomButton>

              <CustomButton
                $variant="secondary"
                backgroundColor="#FF5C00"
                width="120px"
                onClick={handleDuplicate}
              >
                Duplicar
              </CustomButton>

              {dataClient?.status.status_current === "ENVIADO" ||
              dataClient?.status.status_current === "COBRANÇA" ? (
                <CustomButton
                  $variant={"primary"}
                  width="100px"
                  onClick={handleOpenEditQuantityModal}
                  disabled={forDisabled}
                >
                  Alterar
                </CustomButton>
              ) : (
                <CustomButton
                  $variant={"primary"}
                  width="100px"
                  onClick={handleEdit}
                  disabled={forDisabled}
                >
                  Editar
                </CustomButton>
              )}

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
          {contractSellerAndBuyer.map((field, index) => (
            <SKeyContainer key={index}>
              <SkeyName>
                {field.label}:<SKeyValue>{field.value}</SKeyValue>
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
              <SKeyValue>{dataClient?.internal_communication}</SKeyValue>
            </SkeyName>
          </SKeyContainer>
        </SCardInfo>
      </SContainer>
      <ModalDelete
        open={isDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleContractDelete}
        content={modalContent}
      />
      <ModalEditQuantity
        open={isEditQuantityModal}
        dataContract={dataClient}
        onClose={handleCloseEditQuantityModal}
        onConfirm={handleEditQuantity}
        onHandleChange={handleChange}
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
            { label: "Cobrança", value: "COBRANÇA" },
            { label: "Em Pausa", value: "EM PAUSA" },
            { label: "Cancelado", value: "CANCELADO" },
            { label: "Deletado", value: "DELETADO" },
          ]}
          onSelectChange={(value) => setSelectedStatus(value)}
          value={selectedStatus}
        />
      </Modal>
    </>
  );
}
