import React from "react";
import { FormDataContract, StepType } from "./types";
import { Step1 } from "./components/Step1";
import { Step2 } from "./components/Step2";
import { Step3 } from "./components/Step3";
import { Step4 } from "./components/Step4";

// import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { SButtonContainer, SContainer, SContent, SStepper } from "./styles";
import CustomButton from "../../components/CustomButton";

export const FormContract: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [formData, setFormData] = React.useState<FormDataContract>({
    seller: "",
    buyer: "",
    product: "",
    quality: "",
    quantity: "",
    price: 0,
    icms: 0,
    payment: "",
    pickup: "",
    pickupLocation: "",
    inspection: "",
    observation: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const steps: StepType[] = [
    {
      label: "Identificação",
      elements: [<Step1 handleChange={handleChange} />],
    },
    {
      label: "Produto",
      elements: [<Step2 handleChange={handleChange} />],
    },
    {
      label: "Info. de Venda",
      elements: [<Step3 handleChange={handleChange} />],
    },
    {
      label: "Observação",
      elements: [<Step4 handleChange={handleChange} />],
    },
    {
      label: "Review",
      elements: [<Step4 handleChange={handleChange} />],
    },
    {
      label: "Envio",
      elements: [<Step4 handleChange={handleChange} />],
    },
  ];

  const currentStep = steps[activeStep];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

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
          <CustomButton
            onClick={handleBack}
            //disabled={activeStep === 0}
            variant={"primary"}
          >
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
