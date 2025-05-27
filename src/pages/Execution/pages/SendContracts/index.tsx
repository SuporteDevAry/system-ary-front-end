import React, { useEffect } from "react";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CircularProgress from "@mui/material/CircularProgress";
import CustomButton from "../../../../components/CustomButton";
import { SButtonContainer, SContainer, SContent, SStepper } from "./styles";
import { FormDataSendContract, StepType } from "./types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useInfo, useUserPermissions } from "../../../../hooks";
import { StepInformContract } from "./components/StepInformContract";
import { StepSendContract } from "./components/StepSendContract";

import { Modal } from "../../../../components/Modal";
import { SendEmailContext } from "../../../../contexts/SendEmailContext";
import { ITemplates } from "../../../../templates";
import { formattedDate, formattedTime } from "../../../../helpers/dateFormat";
import { ContractContext } from "../../../../contexts/ContractContext";

export const SendContracts: React.FC = () => {
  const navigate = useNavigate();
  const { updateContract } = ContractContext();
  const sendEmailContext = SendEmailContext();
  const { dataUserInfo } = useInfo();
  const { canConsult } = useUserPermissions();
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [templateName, setTemplateName] =
    useState<ITemplates["template"]>("contrato");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [formData, setFormData] = React.useState<FormDataSendContract>({
    id: "",
    contract_emission_date: "",
    number_contract: "",
    number_broker: "",
    seller: {
      address: "",
      city: "",
      cnpj_cpf: "",
      district: "",
      ins_est: "",
      name: "",
      number: "",
      state: "",
      complement: "",
      account: [],
    },
    buyer: {
      address: "",
      city: "",
      cnpj_cpf: "",
      district: "",
      ins_est: "",
      name: "",
      number: "",
      state: "",
      complement: "",
      account: [],
    },
    list_email_seller: [],
    list_email_buyer: [],
    product: "",
    name_product: "",
    crop: "",
    quality: "",
    quantity: 0,
    type_currency: "",
    price: 0,
    type_icms: "",
    icms: "",
    payment_date: "",
    payment: "",
    type_commission_seller: "",
    commission_seller: "",
    type_commission_buyer: "",
    commission_buyer: "",
    type_pickup: "",
    pickup: "",
    pickup_location: "",
    inspection: "",
    observation: "",
    owner_contract: "",
    total_contract_value: 0,
    quantity_bag: 0,
    quantity_kg: 0,
    status: {
      status_current: "",
      history: [],
    },
    destination: "",
    complement_destination: "",
    number_external_contract_seller: "",
    number_external_contract_buyer: "",
    day_exchange_rate: "",
    farm_direct: "",
    initial_pickup_date: "",
    final_pickup_date: "",
    internal_communication: "",
    type_quantity: "",
  });

  const [modalContent, setModalContent] = useState<string>("");
  const [isDeleteModal, setDeleteModal] = useState<boolean>(false);

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (dataUserInfo?.email) {
      setUserEmail(dataUserInfo.email);
    }
  }, [dataUserInfo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const updateFormData = (data: Partial<FormDataSendContract>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ...data,
    }));
  };

  const handleUpdateContract = async () => {
    if (!formData || !formData.id) {
      toast.error("Id do Contrato não encontrado.");
      return;
    }

    const newDate = formattedDate();
    const newTime = formattedTime();

    const newStatusEntry = {
      date: newDate,
      time: newTime,
      status: "ENVIADO",
      owner_change: {
        name: dataUserInfo?.name || "",
        email: dataUserInfo?.email || "",
      },
    };

    const updatedStatus = {
      status_current: "ENVIADO",
      history: [...formData.status.history, newStatusEntry],
    };

    const updatedContract = {
      ...formData,
      status: updatedStatus,
    };

    try {
      await updateContract(formData?.id, updatedContract);
      toast.success(
        <div>
          Contrato de Número:
          <strong>{formData.number_contract}</strong> enviado com sucesso!
        </div>
      );
      navigate("/contratos/historico");
    } catch (error) {
      toast.error(
        `Erro ao tentar deletar contrato: ${formData.number_contract}, contacte o administrador do sistema ${error}`
      );
    } finally {
      setDeleteModal(false);
    }
  };

  // Depois que tiver mais de um template, mudar para um select e verificar pela sigla contida no number_contract
  //   const handleChangeTemplate = (templateName: ITemplates["template"]) => {
  //     setTemplateName(templateName);
  //   };
  const handleSendEmails = async () => {
    setTemplateName("contrato");
    setIsEmailSending(true);
    try {
      const response = await sendEmailContext.sendEmail({
        contractData: formData,
        templateName,
        sender: userEmail,
        number_contract: formData.number_contract || "",
      });

      if (response) {
        await handleUpdateContract();

        setDeleteModal(false);
      }
    } catch (error) {
      console.error("Erro ao enviar e-mails:", error);
      toast.error("Erro ao enviar os e-mails.");
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Se for o último step, cria o contrato

      setIsLoading(true);
      try {
        await handleSendEmails();

        navigate("/contratos/historico");
      } catch (error) {
        toast.error(
          `Erro ao tentar enviar contrato, contacte o administrador do sistema ${error}`
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Se não for o último step, avança para o próximo
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleOpenModalSendContract = () => {
    setModalContent(
      `Tem certeza que deseja enviar o contrato: ${formData.number_contract}?`
    );

    setDeleteModal(true);
  };

  const handleCloseModalSendContract = () => {
    setDeleteModal(false);
  };

  const steps: StepType[] = [
    {
      label: "Informe o contrato",
      elements: [
        <StepInformContract id="step1" updateFormData={updateFormData} />,
      ],
    },
    {
      label: "Enviar Contrato",
      elements: [
        <StepSendContract
          id="step2"
          formData={formData}
          handleChange={handleChange}
        />,
      ],
    },
  ];

  const currentStep = steps[activeStep] || { elements: [] };

  return (
    <>
      <SContainer>
        <SStepper activeStep={activeStep}>
          {steps.map((item, index) => (
            <Step key={`${index}-${item.label}`}>
              <StepLabel>{item.label}</StepLabel>
            </Step>
          ))}
        </SStepper>

        <SContent key={currentStep.label}>{currentStep.elements}</SContent>

        <SButtonContainer>
          {activeStep !== 0 && (
            <CustomButton onClick={handleBack} $variant={"primary"}>
              Voltar
            </CustomButton>
          )}

          {isLoading || isEmailSending ? (
            <CircularProgress size={24} />
          ) : activeStep === steps.length - 1 ? (
            <CustomButton
              onClick={handleOpenModalSendContract}
              $variant={"success"}
              disabled={canConsult}
            >
              Enviar
            </CustomButton>
          ) : (
            <CustomButton onClick={handleNext} $variant={"success"}>
              Avançar
            </CustomButton>
          )}
        </SButtonContainer>
      </SContainer>

      <Modal
        titleText={"Atenção!"}
        open={isDeleteModal}
        confirmButton="Enviar"
        cancelButton="Fechar"
        onClose={handleCloseModalSendContract}
        onHandleConfirm={handleNext}
        variantCancel={"primary"}
        variantConfirm={"success"}
        disabledConfirm={isLoading || isEmailSending}
      >
        {modalContent}
      </Modal>
    </>
  );
};
