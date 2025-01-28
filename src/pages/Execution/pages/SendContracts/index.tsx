import React from "react";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CircularProgress from "@mui/material/CircularProgress";
import CustomButton from "../../../../components/CustomButton";
import { SButtonContainer, SContainer, SContent, SStepper } from "./styles";
import { FormDataSendContract, StepType } from "./types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserPermissions } from "../../../../hooks";
import { StepInformContract } from "./components/StepInformContract";
import { StepSendContract } from "./components/StepSendContract";

export const SendContracts: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [formData, setFormData] = React.useState<FormDataSendContract>({
    number_contract: "",
    list_email_seller: [],
    list_email_buyer: [],
    list_email_ocult_copy: [],
    sended_contract: false,
  });

  const { canConsult } = useUserPermissions();

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

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Se for o último step, cria o contrato

      setIsLoading(true);
      try {
        toast.success(
          <div>
            Contrato de Número:
            <strong>{response?.data?.number_contract}</strong>
            criado com sucesso!
          </div>
        );

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

  const steps: StepType[] = [
    {
      label: "Informe o contrato",
      elements: [
        <StepInformContract
          id="step1"
          formData={formData}
          handleChange={handleChange}
          updateFormData={updateFormData}
        />,
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

        {isLoading ? (
          <CircularProgress size={24} />
        ) : activeStep === steps.length - 1 ? (
          <CustomButton
            onClick={handleNext}
            $variant={"success"}
            disabled={canConsult}
          >
            Salvar
          </CustomButton>
        ) : (
          <CustomButton onClick={handleNext} $variant={"success"}>
            Avançar
          </CustomButton>
        )}
      </SButtonContainer>
    </SContainer>
  );
};
