import axios from "axios";
import PdfGeneratorNew from "../../../../helpers/PDFGenerator/pdfnew";
import { useCallback, useEffect, useState } from "react";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";

const apiKey = process.env.VITE_RESEND_API_KEY;

if (!apiKey) {
  console.error(
    "Chave da API Resend não encontrada. Verifique o arquivo .env."
  );
  throw new Error(
    "Chave da API Resend não encontrada. Verifique o arquivo .env."
  );
}

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
    const pdfSeller = await PdfGeneratorNew({
      elementId: "contrato",
      fileName: `Contrato_${contractData.number_contract}_Vendedor`,
      data: contractData,
      typeContract: "Vendedor",
      template: "contrato",
    });

    const pdfBuyer = await PdfGeneratorNew({
      elementId: "contrato",
      fileName: `Contrato_${contractData.number_contract}_Comprador`,
      data: contractData,
      typeContract: "Comprador",
      template: "contrato",
    });

    if (!pdfSeller || !pdfBuyer) {
      throw new Error("Erro ao gerar um dos PDFs.");
    }

    const emailDataSeller: EmailData = {
      from: "no-reply@seu-dominio.com",
      to: ["vendedor@dominio.com"],
      subject: "Contrato para Vendedor",
      text: "Contrato anexado.",
      attachments: [
        {
          filename: "Contrato_Vendedor.pdf",
          content: await pdfSeller.output("arraybuffer"),
        },
      ],
    };

    const emailDataBuyer: EmailData = {
      ...emailDataSeller,
      to: ["comprador@dominio.com"],
      subject: "Contrato para Comprador",
      attachments: [
        {
          filename: "Contrato_Comprador.pdf",
          content: await pdfBuyer.output("arraybuffer"),
        },
      ],
    };

    await Promise.all([
      axios.post("https://api.resend.io/v1/send", emailDataSeller, {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
      axios.post("https://api.resend.io/v1/send", emailDataBuyer, {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
    ]);

    toast.success("E-mails enviados com sucesso!");
  } catch (error) {
    console.error(error);
    toast.error("Erro ao enviar os e-mails.");
  }
};

const SendContracts: React.FC = () => {
  const contractContext = ContractContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
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
      setContractData(filteredContracts[0]);
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

    try {
      setIsPdfLoading(true); // Adicione estado de carregamento
      const pdf = await PdfGeneratorNew({
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
    } catch (error) {
      toast.error("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleSendEmails = async () => {
    if (!contractData || !contractData.number_contract) {
      toast.error("Os dados do contrato estão incompletos ou ausentes.");
      return;
    }
    await sendEmails(contractData);
  };

  return (
    <div>
      {contractData && contractData.buyer && (
        <div>
          <p>Nome do comprador: {contractData.buyer.name}</p>
          <p>CNPJ: {contractData.buyer.cnpj_cpf}</p>
          <p>Endereço: {contractData.buyer.address}</p>
          {/* Exiba outras propriedades conforme necessário */}
        </div>
      )}
      <br />
      {contractData && contractData.seller && (
        <div>
          <p>Nome do vendedor: {contractData.seller.name}</p>
          <p>CNPJ: {contractData.seller.cnpj_cpf}</p>
          <p>Endereço: {contractData.seller.address}</p>
          {/* Exiba outras propriedades conforme necessário */}
        </div>
      )}
      <br />
      <button onClick={fetchContractData} disabled={isLoading}>
        {isLoading ? "Carregando..." : "Buscar Contrato"}
      </button>
      <br />
      <button
        onClick={() => generateAndOpenPdf("Vendedor")}
        disabled={!contractData || isLoading || isPdfLoading}
      >
        {isPdfLoading ? "Gerando PDF Vendedor..." : "Visualizar PDF Vendedor"}
      </button>
      <br />
      <button
        onClick={() => generateAndOpenPdf("Comprador")}
        disabled={!contractData || isLoading || isPdfLoading}
      >
        {isPdfLoading ? "Gerando PDF Comprador..." : "Visualizar PDF Comprador"}
      </button>
      <br />
      {contractData && (
        <button
          onClick={handleSendEmails}
          disabled={!contractData || isLoading}
        >
          Enviar Contratos por E-mail
        </button>
      )}
    </div>
  );
};

export default SendContracts;
