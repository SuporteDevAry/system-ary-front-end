import React, { useState, useEffect, useCallback } from "react";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import CustomLoadingButton from "../../../../components/CustomLoadingButton";
import generatePdf from "./generatePdf";

import { ITemplates } from "../../../../templates";
import { useInfo } from "../../../../hooks";

import { IContractData } from "../../../../contexts/ContractContext/types";

import { SendEmailContext } from "../../../../contexts/SendEmailContext";

const SendContracts: React.FC = () => {
  const contractContext = ContractContext();
  const sendEmailContext = SendEmailContext();
  const { dataUserInfo } = useInfo();

  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [contractData, setContractData] = useState<IContractData | null>(null);
  const [templateName, setTemplateName] = useState<ITemplates["template"]>(
    "contratoTemplateSoja"
  );
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (dataUserInfo?.email) {
      setUserEmail(dataUserInfo.email);
    }
  }, [dataUserInfo]);

  const fetchContractData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await contractContext.listContracts();
      const filteredContracts = response.data.filter(
        (contract: IContractData) =>
          contract.status.status_current === "A CONFERIR"
      );
      setContractData(filteredContracts[0] || null);
    } catch (error) {
      toast.error(`Erro ao buscar contratos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [contractContext]);

  useEffect(() => {
    fetchContractData();
  }, [fetchContractData]);

  const generateAndOpenPdf = async (
    typeContract: "Vendedor" | "Comprador"
  ): Promise<Blob | null> => {
    if (!contractData) {
      toast.error("Contrato não encontrado.");
      return null;
    }

    setIsPdfLoading(true);
    try {
      const pdfBlob = await generatePdf(
        contractData,
        typeContract,
        templateName
      );
      if (pdfBlob) {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, "_blank");
        return pdfBlob;
      }
      return null;
    } catch (error) {
      toast.error(`Erro ao gerar o PDF para ${typeContract}.`);
      return null;
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleSendEmails = async () => {
    if (!contractData) {
      toast.error("Contrato não encontrado.");
      return;
    }

    setIsEmailSending(true);
    try {
      const numberContract = contractData?.number_contract?.replace("/", "-");

      const response = await sendEmailContext.sendEmail({
        contractData,
        templateName,
        sender: userEmail,
        number_contract: numberContract || "",
      });

      if (response) {
        toast.success("E-mails enviados com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao enviar e-mails:", error);
      toast.error("Erro ao enviar os e-mails.");
    } finally {
      setIsEmailSending(false);
    }
  };
  const renderContractInfo = (type: "buyer" | "seller") => {
    const data = contractData?.[type];
    if (!data) return null;

    return (
      <div>
        <p>
          Nome do {type === "buyer" ? "comprador" : "vendedor"}: {data.name}
        </p>
        <p>CNPJ: {data.cnpj_cpf}</p>
        <p>Endereço: {data.address}</p>
      </div>
    );
  };

  return (
    <div>
      <div>
        <select
          onChange={(e) =>
            setTemplateName(e.target.value as ITemplates["template"])
          }
        >
          <option value="contratoTemplateSoja">Template Soja</option>
          <option value="contrato">Contrato</option>
        </select>
      </div>
      <br />
      {contractData ? (
        <>
          {renderContractInfo("buyer")}
          {renderContractInfo("seller")}
        </>
      ) : (
        <p>Nenhum contrato disponível para conferir.</p>
      )}
      <br />
      <CustomLoadingButton
        onClick={fetchContractData}
        isLoading={isLoading}
        label="Buscar Contrato"
        loadingLabel="Carregando..."
      />
      <br />
      <CustomLoadingButton
        onClick={() => generateAndOpenPdf("Vendedor")}
        isLoading={isPdfLoading}
        label="Gerar PDF (Vendedor)"
        loadingLabel="Gerando PDF..."
      />
      <br />
      <CustomLoadingButton
        onClick={() => generateAndOpenPdf("Comprador")}
        isLoading={isPdfLoading}
        label="Gerar PDF (Comprador)"
        loadingLabel="Gerando PDF..."
      />
      <br />
      <CustomLoadingButton
        onClick={handleSendEmails}
        isLoading={isEmailSending}
        label="Enviar E-mails"
        loadingLabel="Enviando..."
      />
    </div>
  );
};

export default SendContracts;
