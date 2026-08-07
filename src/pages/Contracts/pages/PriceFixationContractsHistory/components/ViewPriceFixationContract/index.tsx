import { useCallback, useEffect, useState } from "react";
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
import { IPriceFixationContractData } from "../../../../../../contexts/PriceFixationContractContext/types";
import CustomButton from "../../../../../../components/CustomButton";
import { formatCurrency } from "../../../../../../helpers/currencyFormat";
import { useInfo, useUserPermissions } from "../../../../../../hooks";
import { PriceFixationContractContext } from "../../../../../../contexts/PriceFixationContractContext";
import { formattedDate, formattedTime } from "../../../../../../helpers/dateFormat";
import { ModalDelete } from "../../../../../../components/ModalDelete";
import PdfGenerator from "../../../../../../helpers/PDFGenerator";
import ContratoPriceFixationTemplate from "../../../../../../templates/contratoPriceFixation";
import { createRoot } from "react-dom/client";
import { Modal } from "../../../../../../components/Modal";
import { CustomStatusIndicator } from "../../../../../../components/CustomStatusIndicator";
import { CustomSelect } from "../../../../../../components/CustomSelect";
import { numberToQuantityString } from "../../../../../../helpers/quantityFormat";
import { AddFixationModal } from "./components/AddFixationModal";
import { FixationHistoryPanel } from "./components/FixationHistoryPanel";

export function ViewPriceFixationContract(): JSX.Element {
  const { deleteFixationContract, updateFixationContract, listFixationItems } =
    PriceFixationContractContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { dataUserInfo } = useInfo();
  const { canConsult, canChangeStatus } = useUserPermissions();
  const [dataClient, setDataClient] =
    useState<IPriceFixationContractData | null>(null);
  const [modalContent, setModalContent] = useState<string>("");
  const [isDeleteModal, setDeleteModal] = useState<boolean>(false);
  const [isChangeStatusModal, setChangeStatusModal] = useState<boolean>(false);
  const [isAddFixationModal, setAddFixationModal] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState(
    dataClient?.status.status_current || "",
  );

  const forDisabled =
    dataClient?.status.status_current === "DELETADO" ||
    dataClient?.status.status_current === "LIQUIDADO";

  const isFullyFixed = dataClient?.fixation_status === "Fixado";

  useEffect(() => {
    const contractForView: IPriceFixationContractData =
      location.state?.contractForView;

    setDataClient(contractForView);
  }, [location]);

  const reloadFixationItems = useCallback(async () => {
    if (!dataClient?.id) return;
    try {
      const response = await listFixationItems(dataClient.id);
      setDataClient((prev) =>
        prev ? { ...prev, fixation_items: response.data } : prev,
      );
    } catch (error) {
      toast.error(`Erro ao carregar fixações: ${error}`);
    }
  }, [dataClient?.id, listFixationItems]);

  useEffect(() => {
    reloadFixationItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataClient?.id]);

  const handleDuplicate = () => {
    if (!dataClient) return;

    const duplicatedContract = {
      ...dataClient,
      id: "",
      number_contract: "",
      contract_emission_date: formattedDate(),
      owner_contract: dataUserInfo?.email || "",
      status: {
        status_current: "A CONFERIR",
        history: [],
      },
      final_quantity: "",
      status_received: "",
      total_received: 0,
      charge_date: "",
      commission_receipt_date: "",
      expected_receipt_date: "",
      internal_communication: "",
      number_external_contract_buyer: "",
      number_external_contract_seller: "",
      fixation_status: "Pendente",
      fixed_quantity: 0,
      average_fixed_price: undefined,
      fixation_items: [],
      price: undefined,
      total_contract_value: undefined,
    };

    navigate("/contratos/novo-contrato-a-fixar", {
      state: { contractData: duplicatedContract, isDuplicateMode: true },
    });
  };

  const handleEdit = () => {
    navigate("/contratos/editar-contrato-a-fixar", {
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

    const root = createRoot(container);
    root.render(
      <ContratoPriceFixationTemplate formData={dataToPdf} nomeArquivo={nomePDF} />,
    );

    setTimeout(() => {
      PdfGenerator(document, "contrato", nomePDF, "window");
      document.body.removeChild(container);
    }, 1000);
  };

  const handleOpenDeleteModal = () => {
    setModalContent(
      `Tem certeza que deseja deletar o contrato a fixar: ${dataClient?.number_contract}?`,
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
      await deleteFixationContract(dataClient?.id, updatedContract);
      toast.success(
        <div>
          Contrato a Fixar de Número:
          <strong>{dataClient.number_contract}</strong> deletado com sucesso!
        </div>,
      );
      navigate("/contratos/historico-a-fixar");
    } catch (error) {
      toast.error(
        `Erro ao tentar deletar contrato a fixar: ${dataClient.number_contract}, contacte o administrador do sistema ${error}`,
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
      await updateFixationContract(dataClient?.id, updatedContract);
      toast.success(`Status do contrato atualizado para ${selectedStatus}`);
      setChangeStatusModal(false);
      navigate("/contratos/historico-a-fixar");
    } catch (error) {
      toast.error(`Erro ao atualizar status: ${error}`);
    }
  };

  const handleOpenAddFixationModal = () => setAddFixationModal(true);
  const handleCloseAddFixationModal = () => setAddFixationModal(false);

  const handleFixationRegistered = async (
    updatedContract: IPriceFixationContractData,
  ) => {
    setDataClient((prev) =>
      prev ? { ...prev, ...updatedContract } : updatedContract,
    );
    setAddFixationModal(false);
    await reloadFixationItems();
  };

  const typeQuantity = dataClient?.type_quantity;
  const unityMeasure = typeQuantity === "toneladas métricas" ? "Tm" : "Kg";

  const quantityValue = Number(dataClient?.quantity || 0);
  const finalQuantityValue = Number(dataClient?.final_quantity || 0);
  const fixedQuantityValue = Number(dataClient?.fixed_quantity || 0);

  const contractSellerAndBuyer = [
    { label: "Vendedor", value: dataClient?.seller.name },
    { label: "Comprador", value: dataClient?.buyer.name },
  ];

  const commissionType =
    dataClient?.type_commission_seller ||
    dataClient?.type_commission_buyer ||
    "";
  const commissionValue =
    dataClient?.commission_seller ?? dataClient?.commission_buyer ?? "";
  const commissionCurrency = dataClient?.type_commission_seller
    ? dataClient?.type_commission_seller_currency
    : dataClient?.type_commission_buyer_currency;
  const commissionExchangeRate = dataClient?.type_commission_seller
    ? dataClient?.commission_seller_exchange_rate
    : dataClient?.commission_buyer_exchange_rate;

  const commission = (() => {
    const normalizedType = commissionType.toLocaleLowerCase();

    if (
      commissionValue === "" ||
      commissionValue === null ||
      commissionValue === undefined
    )
      return "";

    if (normalizedType === "percentual") {
      return `${commissionValue}%`;
    }

    const currencyType = commissionCurrency === "Dólar" ? "Dólar" : "Real";
    let formattedCommission = formatCurrency(
      String(commissionValue),
      currencyType,
      true,
    );

    if (currencyType === "Dólar") {
      formattedCommission = formattedCommission.replace("$", "US$ ");
    }

    if (normalizedType === "por saca") {
      return `${formattedCommission} por saca`;
    }

    return formattedCommission;
  })();

  const commissionTypeLabel = commissionType || "-";

  const contractFields = [
    {
      label: "Status Fixação:",
      value: dataClient?.fixation_status || "Pendente",
    },
    { label: "", value: "" },
    {
      label: dataClient?.average_fixed_price
        ? "Preço Médio Fixado:"
        : dataClient?.price
          ? "Preço de Referência:"
          : "Preço Médio Fixado:",
      value: dataClient?.average_fixed_price
        ? formatCurrency(String(dataClient.average_fixed_price), "Real")
        : dataClient?.price
          ? formatCurrency(String(dataClient.price), dataClient.type_currency || "Real")
          : "A FIXAR",
    },
    { label: "", value: "" },
    { label: "Produto:", value: dataClient?.name_product },
    { label: "", value: "" },
    {
      label: "Total do Contrato:",
      value: dataClient?.total_contract_value
        ? formatCurrency(String(dataClient.total_contract_value), "Real")
        : "A FIXAR",
    },
    { label: "", value: "" },
    {
      label: "Quantidade:",
      value: `${numberToQuantityString(quantityValue)} ${unityMeasure}`,
    },
    {
      label: "Quantidade Final:",
      value: `${numberToQuantityString(finalQuantityValue)} ${unityMeasure}`,
    },
    {
      label: "Quantidade Fixada:",
      value: `${numberToQuantityString(fixedQuantityValue)} ${unityMeasure}`,
    },
    {
      label: "Tipo Comissão:",
      value: commissionTypeLabel,
    },
    {
      label: "Comissão:",
      value: commission,
    },
    ...(commissionCurrency === "Dólar"
      ? [
          {
            label: "Câmbio Comissão:",
            value: commissionExchangeRate || "-",
          },
        ]
      : []),
    {
      label: "Data do Pagamento:",
      value: dataClient?.payment_date,
    },
  ];

  return (
    <>
      <SContainer>
        <STitle>Dados do Contrato a Fixar</STitle>
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
                $variant="success"
                width="130px"
                onClick={handleOpenAddFixationModal}
                disabled={forDisabled || canConsult || isFullyFixed}
              >
                Fixar Preço
              </CustomButton>

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

        {dataClient && <FixationHistoryPanel contract={dataClient} />}

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

      <AddFixationModal
        open={isAddFixationModal}
        contract={dataClient}
        onClose={handleCloseAddFixationModal}
        onRegistered={handleFixationRegistered}
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
