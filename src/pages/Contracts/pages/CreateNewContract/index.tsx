import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

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
import { formattedDate, formattedTime } from "../../../../helpers/dateFormat";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { FormDataContract, StepType } from "./types";
import { IContractDataToFormDataDTO } from "../../../../helpers/DTO/IcontractDataToFormDataDTO";
import { useInfo, useUserPermissions } from "../../../../hooks";

export const CreateNewContract: React.FC = () => {
  const { createContract, updateContract } = ContractContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const { dataUserInfo } = useInfo();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [formData, setFormData] = React.useState<FormDataContract>({
    id: "",
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
    list_email_seller: [],
    list_email_buyer: [],
    product: "",
    name_product: "",
    crop: "",
    quality: "",
    quantity: "",
    type_currency: "",
    price: "",
    type_icms: "",
    icms: "",
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
    contract_emission_date: "",
    destination: "",
    number_external_contract_seller: "",
    number_external_contract_buyer: "",
    day_exchange_rate: "",
    payment_date: "",
    farm_direct: "",
    initial_pickup_date: "",
    final_pickup_date: "",
    internal_communication: "",
  });
  const { canConsult } = useUserPermissions();
  //const profileConsultant =  dataUserInfo?.permissions?.includes("CONSULTA");

  useEffect(() => {
    if (location.state?.isEditMode) {
      setIsEditMode(true);
      const contractDataForEdit = location.state.contractData as IContractData;
      if (contractDataForEdit) {
        const dataForm = IContractDataToFormDataDTO(contractDataForEdit);

        setFormData({
          ...dataForm,
        });
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (dataUserInfo && !isEditMode) {
      updateStatus("A Conferir");
    }
    if (isEditMode) {
      updateStatus("Editado");
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

  const updateFormData = (data: Partial<FormDataContract>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ...data,
    }));
  };

  const updateStatus = (newStatus: string) => {
    const newDate = formattedDate();
    const newTime = formattedTime();

    const newStatusEntry = {
      date: newDate,
      time: newTime,
      status: newStatus,
      owner_change: {
        name: dataUserInfo?.name || "",
        email: dataUserInfo?.email || "",
      },
    };

    const updatedStatus = {
      status_current: newStatus,
      history: [...formData.status.history, newStatusEntry],
    };

    setFormData((prevFormData) => ({
      ...prevFormData,
      status: updatedStatus,
    }));
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Se for o último step, cria o contrato

      setIsLoading(true);
      try {
        const contractData = FormDataToIContractDataDTO(formData);

        if (isEditMode && formData?.id) {
          const response = await updateContract(formData.id, contractData);

          toast.success(
            <div>
              Contrato de Número:
              <strong>{response?.data?.number_contract}</strong> atualizado com
              sucesso!
            </div>
          );
        }
        if (!isEditMode) {
          const { id: _, ...contractToCreate } = contractData;

          if (!contractToCreate.quantity || !contractToCreate.price) {
            toast.error(`Obrigatório informar quantidade e preço!`);
            return;
          }

          const response = await createContract(contractToCreate);

          toast.success(
            <div>
              Contrato de Número:
              <strong>{response?.data?.number_contract}</strong> criado com
              sucesso!
            </div>
          );
        }

        navigate("/contratos/historico");
      } catch (error) {
        toast.error(
          `Erro ao tentar ${
            isEditMode ? "atualizar" : "criar"
          } contrato, contacte o administrador do sistema ${error}`
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
      label: "Identificação",
      elements: [
        <Step1
          id="step1"
          formData={formData}
          handleChange={handleChange}
          updateFormData={updateFormData}
          isEditMode={isEditMode}
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
          isEditMode={isEditMode}
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
          isEditMode={isEditMode}
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
      elements: [
        <Review id="review" formData={formData} isEditMode={isEditMode} />,
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
