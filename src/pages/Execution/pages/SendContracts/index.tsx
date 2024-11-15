import axios from "axios";
import PdfGeneratorNew from "../../../../helpers/PDFGenerator/pdfnew";
import { useCallback, useEffect, useState } from "react";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";

interface EmailAttachment {
  filename: string;
  content: Uint8Array | ArrayBuffer | null;
}

interface EmailData {
  from: string;
  to: string[];
  subject: string;
  text: string;
  attachments: EmailAttachment[];
}

// Função para enviar e-mails usando Resend
const sendEmails = async (contractData: IContractData): Promise<void> => {
  try {
    // 1. Buscar os dados do contrato
    // const response = await axios.get<ContractDataTest>(
    //   "https://seu-endpoint.com/contratos"
    // );
    // const contractData: ContractDataTest = response.data;

    // 2. Gerar PDFs para vendedor e comprador
    const pdfSeller = await PdfGeneratorNew({
      //documentContent: document,
      elementId: "contrato",
      fileName: `Contrato_${contractData.number_contract}_Vendedor`,
      data: contractData,
      typeContract: "Vendedor",
      template: "contrato",
    });

    const pdfBuyer = await PdfGeneratorNew({
      //documentContent: document,
      elementId: "contrato",
      fileName: `Contrato_${contractData.number_contract}_Comprador`,
      data: contractData,
      typeContract: "Comprador",
      template: "contrato",
    });

    console.log("###Entrei na fn Send", contractData);

    if (!pdfSeller || !pdfBuyer) {
      console.error("Erro ao gerar um dos PDFs.");
      return;
    }

    // 3. Configurar dados de e-mail para Resend
    const apiKey = process.env.VITE_RESEND_API_KEY;

    if (!apiKey) {
      console.error("Chave da API Resend não encontrada.");
      return;
    }

    const emailDataSeller: EmailData = {
      from: "no-reply@seu-dominio.com",
      to: ["vendedor@dominio.com", "outro-vendedor@dominio.com"],
      subject: "Contrato para Vendedor",
      text: "Por favor, encontre em anexo o contrato.",
      attachments: [
        {
          filename: "Contrato_Vendedor.pdf",
          content: await pdfSeller?.output("arraybuffer"), // Envia o PDF como conteúdo binário
        },
      ],
    };

    const emailDataBuyer: EmailData = {
      ...emailDataSeller,
      to: ["comprador@dominio.com", "outro-comprador@dominio.com"],
      subject: "Contrato para Comprador",
      attachments: [
        {
          filename: "Contrato_Comprador.pdf",
          content: await pdfBuyer?.output("arraybuffer"), // Envia o PDF como conteúdo binário
        },
      ],
    };

    // 4. Enviar e-mails usando a API da Resend
    await Promise.all([
      axios.post("https://api.resend.io/v1/send", emailDataSeller, {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
      axios.post("https://api.resend.io/v1/send", emailDataBuyer, {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
    ]);

    console.log("E-mails enviados com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar e-mails:", error);
  }
};

const SendContracts: React.FC = () => {
  const contractContext = ContractContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contractData, setContractData] = useState<IContractData>();

  const fetchContractData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await contractContext.listContracts();

      const filteredContracts = response.data.filter(
        (contract: IContractData) =>
          contract.status.status_current === "A CONFERIR"
      );

      console.log("## ", filteredContracts);
      setContractData(filteredContracts);
    } catch (error) {
      toast.error(
        `Erro ao tentar ler contratos, contacte o administrador do sistema: ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [contractContext]);

  useEffect(() => {
    fetchContractData();
  }, [fetchContractData]);

  const generateAndOpenPdf = async (typeContract: "Vendedor" | "Comprador") => {
    if (!contractData) return;

    const pdf = PdfGeneratorNew({
      documentContent: document,
      elementId: "contrato",
      fileName: `Contrato_${contractData.id}_${typeContract}`,
      data: contractData,
      typeContract,
      template: "contrato",
    });

    if (pdf) {
      const pdfBlob = new Blob([await pdf.output("arraybuffer")], {
        type: "application/pdf",
      });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    }
  };

  return (
    <div>
      {contractData && <>{contractData.buyer}</>}
      <button onClick={fetchContractData} disabled={isLoading}>
        Buscar Contrato
      </button>
      <br />
      <button
        onClick={() => generateAndOpenPdf("Vendedor")}
        disabled={!contractData || isLoading}
      >
        Visualizar PDF Vendedor
      </button>
      <br />
      <button
        onClick={() => generateAndOpenPdf("Comprador")}
        disabled={!contractData || isLoading}
      >
        Visualizar PDF Comprador
      </button>
      <br />
      {contractData && (
        <button
          onClick={() => sendEmails(contractData)}
          disabled={!contractData}
        >
          Enviar Email
        </button>
      )}
    </div>
  );
};

export default SendContracts;
