import React, { useState } from "react";
import { FormDataContract, StepType } from "./types";
import { Step1 } from "./components/Step1";
import { Step2 } from "./components/Step2";
import { Step3 } from "./components/Step3";
import { Step4 } from "./components/Step4";
import { Review } from "./components/Review";

import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CircularProgress from "@mui/material/CircularProgress";
import { SButtonContainer, SContainer, SContent, SStepper } from "./styles";
import CustomButton from "../../../../components/CustomButton";
import { ContractContext } from "../../../../contexts/ContractContext";
import { FormDataToIContractDataDTO } from "../../../../helpers/DTO/FormDataToIcontractDataDTO";

export const CreateNewContract: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [formData, setFormData] = React.useState<FormDataContract>({
    numberBroker: "",
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
    },
    listEmailSeller: [],
    listEmailBuyer: [],
    product: "",
    nameProduct: "",
    crop: "",
    quality: "",
    quantity: "",
    typeCurrency: "",
    price: "",
    typeICMS: "",
    icms: "",
    payment: "",
    commissionSeller: "",
    commissionBuyer: "",
    typePickup: "",
    pickup: "",
    pickupLocation: "",
    inspection: "",
    observation: "",
    owner_contract: "",
    total_contract_value: 0,
    quantity_bag: 0,
    quantity_kg: 0,
  });

  const { createContract } = ContractContext();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const updateFormData = (data: Partial<FormDataContract>) => {
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
        const contractData = FormDataToIContractDataDTO(formData);
        const response = await createContract(contractData);
        console.log("Contrato criado com sucesso", response, contractData);
      } catch (error) {
        console.error("Erro ao criar o contrato:", error);
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
      label: "Identificação",
      elements: [
        <Step1
          id="step1"
          formData={formData}
          handleChange={handleChange}
          updateFormData={updateFormData}
        />,
      ],
    },
    {
      label: "Produto",
      elements: [
        <Step2
          id="step2"
          formData={formData}
          handleChange={handleChange}
          updateFormData={updateFormData}
        />,
      ],
    },
    {
      label: "Info. de Venda",
      elements: [
        <Step3
          id="step3"
          formData={formData}
          handleChange={handleChange}
          updateFormData={updateFormData}
        />,
      ],
    },
    {
      label: "Observação",
      elements: [
        <Step4 id="step4" formData={formData} handleChange={handleChange} />,
      ],
    },
    {
      label: "Review",
      elements: [<Review id="review" formData={formData}  updateFormData={updateFormData} />],
    },
  ];

  const currentStep = steps[activeStep];

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
        <CustomButton onClick={handleNext} $variant={"success"}>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : activeStep === steps.length - 1 ? (
            "Salvar"
          ) : (
            "Avançar"
          )}
        </CustomButton>
      </SButtonContainer>
    </SContainer>
  );
};
