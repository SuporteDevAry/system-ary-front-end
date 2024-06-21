import React from "react";
import { FormDataContract, StepType } from "./types";
import { Step1 } from "../../components/Step1";
import { Step2 } from "../../components/Step2";
import { Step3 } from "../../components/Step3";
import { Step4 } from "../../components/Step4";
import { Review } from "../../components/Review";

import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { SButtonContainer, SContainer, SContent, SStepper } from "./styles";
import CustomButton from "../../../../components/CustomButton";

export const NovoContrato: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [formData, setFormData] = React.useState<FormDataContract>({
    seller: "",
    buyer: "",
    product: "",
    crop: "",
    quality: "",
    quantity: "",
    price: "",
    icms: "",
    payment: "",
    pickup: "",
    pickupLocation: "",
    inspection: "",
    observation: "",
  });

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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const steps: StepType[] = [
    {
      label: "Identificação",
      elements: [<Step1 formData={formData} handleChange={handleChange} />],
    },
    {
      label: "Produto",
      elements: [
        <Step2
          formData={formData}
          handleChange={handleChange}
          updateFormData={updateFormData}
        />,
      ],
    },
    {
      label: "Info. de Venda",
      elements: [<Step3 formData={formData} handleChange={handleChange} />],
    },
    {
      label: "Observação",
      elements: [<Step4 formData={formData} handleChange={handleChange} />],
    },
    {
      label: "Review",
      elements: [<Review formData={formData} />],
    },
    {
      label: "Envio",
      elements: [<Step4 formData={formData} handleChange={handleChange} />],
    },
  ];

  const currentStep = steps[activeStep];

  return (
    <SContainer>
      <SStepper activeStep={activeStep}>
        {steps.map((item, index) => (
          <Step key={index}>
            <StepLabel>{item.label}</StepLabel>
          </Step>
        ))}
      </SStepper>

      <SContent>{currentStep.elements}</SContent>

      <SButtonContainer>
        {activeStep !== 0 && (
          <CustomButton onClick={handleBack} variant={"primary"}>
            Voltar
          </CustomButton>
        )}
        <CustomButton onClick={handleNext} variant={"success"}>
          {activeStep === steps.length - 1 ? "Enviar" : "Avançar"}
        </CustomButton>
      </SButtonContainer>
    </SContainer>
  );
};
