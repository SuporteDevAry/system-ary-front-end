import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomButton from "../../../../components/CustomButton";
import CustomTable from "../../../../components/CustomTable";
import {
  SButtonContainer,
  SCardInfo,
  SContainer,
  SContainerSearchAndButton,
  STitle,
} from "./styles";
import dayjs from "dayjs";
import { InvoiceContext } from "../../../../contexts/InvoiceContext";
import { IListInvoices } from "../../../../contexts/InvoiceContext/types";
import { NfseContext } from "../../../../contexts/NfseContext";

// Função auxiliar para escapar caracteres especiais do XML (MELHORIA: ROBUSTEZ)
const escapeXml = (unsafe: string | number) => {
  if (typeof unsafe !== "string") {
    unsafe = String(unsafe);
  }
  // Adicionado o escape para ' (aspa simples)
  return unsafe.replace(/[<>&"']/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;"; // <--- Importante para nomes e endereços
      default:
        return c;
    }
  });
};

const cleanData = (text: string) => {
  if (typeof text !== "string") return text;
  return text.replace(/[.\/\-\s]/g, "");
};

export function Invoice() {
  const invoiceContext = InvoiceContext();
  const nfseContext = NfseContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [listInvoices, setListInvoices] = useState<IListInvoices[]>([]);
  const [isLoadingRPS, setIsLoadingRPS] = useState<boolean>(true);
  const [pageRPS, setPageRPS] = useState(0);
  const [orderRPS, setOrderRPS] = useState<"asc" | "desc">("desc");
  const [orderByRPS, setOrderByRPS] = useState<string>("rps_number");
  const [selectedInvoice, setSelectedInvoice] = useState<
    IListInvoices[] | null
  >(null);

  const fetchData = useCallback(async () => {
    setIsLoadingRPS(true);
    try {
      const responseInvoice = await invoiceContext.listInvoices();

      const filteredListInvoices = responseInvoice.data.filter(
        (invoice: { nfs_number: string }) => invoice.nfs_number == "",
      );

      setListInvoices(filteredListInvoices);
    } catch (error) {
      toast.error(`Erro ao tentar ler contratos: ${error}`);
    } finally {
      setIsLoadingRPS(false);
    }
  }, [invoiceContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================
  // CONFIGURAÇÃO DO PRESTADOR
  // ============================

  const PRESTADOR = {
    CNPJ: "43025030000165",
    IM: "85333700",
    MUNICIPIO: "3550308",
    SERIE: "A",
    CODIGO_SERVICO: "06298",
  };

  const gerarXML = () => {
    const rpsList = selectedInvoice;

    if (!rpsList || rpsList.length === 0) {
      throw new Error("Nenhuma RPS selecionada");
    }

    const totalServicos = rpsList.reduce(
      (sum, rps) => sum + Number(rps?.service_value || 0),
      0,
    );
    //  const totalDeducoes = rpsList.reduce(
    //      (sum, rps) => sum + Number(rps.deduction_value || 0),
    //      0,
    // );
    const dataInicio = dayjs().format("YYYY-MM-DD");
    const dataFim = dataInicio;

    // ✅ IMPORTANTE: Elemento raiz COM namespace
    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<PedidoEnvioLoteRPS xmlns="http://www.prefeitura.sp.gov.br/nfe">`;

    // ✅ IMPORTANTE: Cabecalho COM xmlns="" - Versao="2" (Reforma Tributária 2026)
    xml += `<Cabecalho Versao="2" xmlns="">`;
    xml += `<CPFCNPJRemetente><CNPJ>${PRESTADOR.CNPJ}</CNPJ></CPFCNPJRemetente>`;
    xml += `<transacao>false</transacao>`;
    xml += `<dtInicio>${dataInicio}</dtInicio>`;
    xml += `<dtFim>${dataFim}</dtFim>`;
    xml += `<QtdRPS>${rpsList.length}</QtdRPS>`;
    xml += `<ValorTotalServicos>${totalServicos.toFixed(
      2,
    )}</ValorTotalServicos>`;
    // xml += `<ValorTotalDeducoes>${totalDeducoes.toFixed(
    //     2,
    // )}</ValorTotalDeducoes>`;
    xml += `</Cabecalho>`;

    rpsList.forEach((rps) => {
      const discriminacao = escapeXml(
        rps.service_discrim
          .replace(/(\r\n|\n|\r)/g, "|")
          .replace(/\t/g, " ")
          .replace(/\u00A0/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      );
      const valorServico = Number(rps.service_value || 0).toFixed(2);
      const valorDeducoes = Number(rps.deduction_value || 0).toFixed(2);
      const valorPIS = Number(rps.valor_pis || 0).toFixed(2);
      const valorCOFINS = Number(rps.valor_cofins || 0).toFixed(2);
      const valorINSS = Number(rps.valor_inss || 0).toFixed(2);
      const valorIR = Number(rps.valor_ir || 0).toFixed(2);
      const valorCSLL = Number(rps.valor_csll || 0).toFixed(2);
      const aliquotaServicos = (rps.aliquota_servicos || 0.05).toFixed(4);
      const valorFinalCobrado = Number(
        rps.service_liquid_value || valorServico,
      ).toFixed(2);
      const valorIPI = Number(rps.valor_ipi || 0).toFixed(2);
      const exigibilidadeSuspensa = rps.exigibilidade_suspensa || 0;
      const pagamentoParceladoAntecipado =
        rps.pagamento_parcelado_antecipado || 0;
      const nbs = rps.nbs || "102010000";
      const cLocPrestacao = rps.city_ibge || PRESTADOR.MUNICIPIO;
      const tipoLogradouro = rps.tipo_logradouro || "ROD";
      const codServico = PRESTADOR.CODIGO_SERVICO;
      const codCidadeIBGE = rps.city_ibge || PRESTADOR.MUNICIPIO;
      const cpfCnpjLimpo = cleanData(rps.cpf_cnpj);
      const dataBanco = rps.rps_emission_date;
      const dataIso = dataBanco.split("/").reverse().join("-");
      const assinaturaDummy = "DUMMY";
      xml += `<RPS xmlns="">`;
      xml += `<Assinatura>${assinaturaDummy}</Assinatura>`;
      xml += `<ChaveRPS>`;
      xml += `<InscricaoPrestador>${PRESTADOR.IM}</InscricaoPrestador>`;
      xml += `<SerieRPS>1</SerieRPS>`;
      xml += `<NumeroRPS>${rps.rps_number}</NumeroRPS>`;
      xml += `</ChaveRPS>`;
      xml += `<TipoRPS>RPS</TipoRPS>`;
      xml += `<DataEmissao>${dayjs(dataIso).format("YYYY-MM-DD")}</DataEmissao>`;
      xml += `<StatusRPS>N</StatusRPS>`;
      xml += `<TributacaoRPS>T</TributacaoRPS>`;
      xml += `<ValorDeducoes>${valorDeducoes}</ValorDeducoes>`;
      xml += `<ValorPIS>${valorPIS}</ValorPIS>`;
      xml += `<ValorCOFINS>${valorCOFINS}</ValorCOFINS>`;
      xml += `<ValorINSS>${valorINSS}</ValorINSS>`;
      xml += `<ValorIR>${valorIR}</ValorIR>`;
      xml += `<ValorCSLL>${valorCSLL}</ValorCSLL>`;
      xml += `<CodigoServico>${codServico}</CodigoServico>`;
      xml += `<AliquotaServicos>${aliquotaServicos}</AliquotaServicos>`;
      xml += `<ISSRetido>false</ISSRetido>`;
      xml += `<CPFCNPJTomador>`;
      if (cpfCnpjLimpo.length === 14) {
        xml += `<CNPJ>${cpfCnpjLimpo}</CNPJ>`;
      } else {
        xml += `<CPF>${cpfCnpjLimpo}</CPF>`;
      }
      xml += `</CPFCNPJTomador>`;
      xml += `<RazaoSocialTomador>${escapeXml(rps.name)}</RazaoSocialTomador>`;
      xml += `<EnderecoTomador>`;
      xml += `<TipoLogradouro>${tipoLogradouro}</TipoLogradouro>`;
      xml += `<Logradouro>${escapeXml(rps.address.trim())}</Logradouro>`;
      xml += `<NumeroEndereco>${escapeXml(rps.number)}</NumeroEndereco>`;
      xml += `<Bairro>${escapeXml(rps.district)}</Bairro>`;
      xml += `<Cidade>${codCidadeIBGE}</Cidade>`;
      xml += `<UF>${escapeXml(rps.state).toUpperCase()}</UF>`;
      xml += `<CEP>${rps.zip_code.replace(/\D/g, "")}</CEP>`;
      xml += `</EnderecoTomador>`;
      xml += `<Discriminacao>${discriminacao}</Discriminacao>`;
      xml += `<ValorFinalCobrado>${valorFinalCobrado}</ValorFinalCobrado>`;
      xml += `<ValorIPI>${valorIPI}</ValorIPI>`;
      xml += `<ExigibilidadeSuspensa>${exigibilidadeSuspensa}</ExigibilidadeSuspensa>`;
      xml += `<PagamentoParceladoAntecipado>${pagamentoParceladoAntecipado}</PagamentoParceladoAntecipado>`;
      xml += `<NBS>${nbs}</NBS>`;
      xml += `<cLocPrestacao>${cLocPrestacao}</cLocPrestacao>`;
      xml += `<IBSCBS>`;
      xml += `<finNFSe>0</finNFSe>`;
      xml += `<indFinal>0</indFinal>`;
      xml += `<cIndOp>030101</cIndOp>`;
      xml += `<tpOper>1</tpOper>`;
      xml += `<indDest>0</indDest>`;
      xml += `<valores>`;
      xml += `<trib>`;
      xml += `<gIBSCBS>`;
      xml += `<cClassTrib>000001</cClassTrib>`;
      xml += `</gIBSCBS>`;
      xml += `</trib>`;
      xml += `</valores>`;
      xml += `</IBSCBS>`;
      xml += `</RPS>`;
    });

    xml += `</PedidoEnvioLoteRPS>`;

    // NÃO minifique aqui - deixe o back-end fazer isso
    return xml;
  };

  // ===================================
  // SALVAR XML EM ARQUIVO PARA DOWNLOAD
  // ===================================
  const handleGeraNF_XML = () => {
    if (!selectedInvoice || selectedInvoice.length === 0) {
      toast.error("Nenhuma RPS encontrada para gerar XML.");
      return;
    }

    // Validações básicas antes de gerar XML
    const invalidRPS = selectedInvoice.find(
      (rps) =>
        !rps.rps_number || !rps.service_value || !rps.cpf_cnpj || !rps.name,
    );

    if (invalidRPS) {
      toast.error(
        "Existem RPSs com dados obrigatórios faltando. Verifique os dados.",
      );
      return;
    }

    const xml = gerarXML();

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const nomeArquivo = `lote_rps_${dayjs().format("YYYYMMDD_HHmmss")}.xml`;
    link.download = nomeArquivo;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("Arquivo XML gerado com sucesso!");
  };

  // dentro do seu componente React (Invoice)
  const handleIssueFull = async () => {
    // Verifica se há dados para enviar
    if (!selectedInvoice || selectedInvoice.length === 0) {
      toast.error(
        "Por favor, selecione ao menos uma RPS na lista para enviar.",
      );
      return;
    }

    // Validações básicas antes de enviar
    const invalidRPS = selectedInvoice.find(
      (rps) =>
        !rps.rps_number || !rps.service_value || !rps.cpf_cnpj || !rps.name,
    );

    if (invalidRPS) {
      toast.error(
        "Existem RPSs com dados obrigatórios faltando. Verifique os dados antes de enviar.",
      );
      return;
    }

    const xml = gerarXML(); // assume que gerarXML() retorna o XML bruto não-assinado

    // 🔍 DEBUG: Verifica valores antes de enviar
    console.log("📤 XML gerado (primeiros 500 chars):", xml.substring(0, 500));
    console.log("📊 Total RPS:", selectedInvoice.length);
    console.log(
      "💰 Valor total:",
      selectedInvoice
        .reduce((sum, rps) => sum + Number(rps?.service_value || 0), 0)
        .toFixed(2),
    );

    try {
      setIsLoadingRPS(true);
      const result = await nfseContext.enviarLote({ xml });

      // Mostra qual provider foi usado
      const providerMsg =
        result.provider === "focusnfe"
          ? " (via Focus NFe)"
          : " (via Prefeitura)";

      toast.success("✅ Lote enviado com sucesso" + providerMsg);
      console.log("Resposta servidor:", result);
      console.log("Provider usado:", result.provider);
      console.log("Protocolo:", result.protocolo);

      // Atualiza a lista de RPS para refletir status/protocolo
      await fetchData();
    } catch (err) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro no envio: ${errorMsg}`);
    } finally {
      setIsLoadingRPS(false);
    }
  };

  // ===================================
  // FILTRO DA TABELA (useMemo) (MELHORIA: FILTRO)
  // ===================================
  const dataFilteredBySearch = useMemo(() => {
    if (!searchTerm) return listInvoices;

    const lowerCaseSearch = searchTerm.toLowerCase();

    return listInvoices.filter(
      (invoice) =>
        // Filtra por service_code (Contrato) ou name (Nome)
        invoice.service_code?.toLowerCase().includes(lowerCaseSearch) ||
        invoice.name?.toLowerCase().includes(lowerCaseSearch),
    );
  }, [listInvoices, searchTerm]);

  // ===================================
  // AÇÕES DE EDIÇÃO E EXCLUSÃO
  // ===================================
  const handleEditInvoice = useCallback(
    (invoice: IListInvoices) => {
      navigate("/cobranca/RPS", { state: { editingInvoice: invoice } });
    },
    [navigate],
  );

  const handleDeleteInvoice = useCallback(
    async (invoice: IListInvoices) => {
      toast.warning(
        `Deletando RPS ${invoice.rps_number} de ${invoice.name}...`,
        { autoClose: 2000 },
      );

      try {
        setIsLoadingRPS(true);
        await invoiceContext.deleteInvoice(invoice.id);
        toast.success(`RPS ${invoice.rps_number} deletada com sucesso!`);
        // Recarrega a lista
        fetchData();
      } catch (error) {
        console.error("Erro ao deletar RPS:", error);
        toast.error(`Erro ao deletar RPS: ${error}`);
      } finally {
        setIsLoadingRPS(false);
      }
    },
    [invoiceContext, fetchData],
  );

  const handleResult = async (invoice: IListInvoices) => {
    if (!invoice) {
      toast.error("Nenhuma RPS selecionada para consultar o lote.");
      return;
    }
    const protocolo_lote = invoice.protocolo_lote;
    if (!protocolo_lote) {
      toast.error("RPS selecionada não possui protocolo de lote.");
      return;
    }
    setIsLoadingRPS(true);
    const tryConsultar = async (prot: string) =>
      nfseContext.consultarLote(prot);

    const extractStatus = (res: any, inv: IListInvoices) => {
      if (!res) return null;
      // se for array (lote com múltiplos itens), encontra pelo numero_rps/numero
      if (Array.isArray(res)) {
        const found = res.find(
          (it: any) =>
            String(it.numero_rps || it.numero || "") === String(inv.rps_number),
        );
        if (found && (found.status || found.Status))
          return String(found.status || found.Status);
        return null;
      }
      // se for objeto único
      if (typeof res === "object") {
        if (res.status || res.Status) return String(res.status || res.Status);
        // algumas respostas podem embutir resultado
        if (res.resultado && (res.resultado.status || res.resultado.Status))
          return String(res.resultado.status || res.resultado.Status);
      }
      return null;
    };

    const mapToLocal = (statusStr: string | null, fallback: string) => {
      if (!statusStr) return fallback;
      const s = String(statusStr).toLowerCase();
      if (s.includes("processando") || s.includes("process"))
        return "processando_autorizacao";
      if (s.includes("autoriz")) return "autorizada";
      if (s.includes("cancel")) return "cancelada";
      if (s.includes("erro")) return "erro_autorizacao";
      return fallback || statusStr;
    };

    try {
      // primeira tentativa com o protocolo atual
      const result: any = await tryConsultar(protocolo_lote);
      const remoteStatus = extractStatus(result, invoice);
      const statusLocal = mapToLocal(
        remoteStatus,
        invoice.status || "processando_autorizacao",
      );
      // somente atualiza se encontramos um status remoto ou usamos fallback para processando
      setListInvoices((prev) =>
        prev.map((rps) =>
          rps.id === invoice.id ? { ...rps, status: statusLocal } : rps,
        ),
      );
      const toastStatus = remoteStatus ?? statusLocal;
      toast.info(`Status atualizado: ${toastStatus}`);
      if (remoteStatus && /autoriz/i.test(String(remoteStatus))) {
        toast.success(`NFSe finalizada com status: ${remoteStatus}`);
      }
    } catch (err: any) {
      // Se 404, tenta versão alternativa (com/sem prefixo LOTE-)
      const is404 =
        err?.response?.status === 404 ||
        (err?.message && String(err.message).includes("404"));
      if (is404) {
        const hasPrefix = /^LOTE-/i.test(protocolo_lote);
        const alternative = hasPrefix
          ? protocolo_lote.replace(/^LOTE-/i, "")
          : `LOTE-${protocolo_lote}`;
        try {
          const result2: any = await tryConsultar(alternative);
          let status = "";
          if (result2 && typeof result2 === "object" && "status" in result2) {
            status = String(result2.status);
          }
          let statusLocal = "";
          if (status === "Processando Autorização")
            statusLocal = "processando_autorizacao";
          else if (status === "Autorizada") statusLocal = "autorizada";
          else if (status === "Cancelada") statusLocal = "cancelada";
          else if (status === "Erro Autorização")
            statusLocal = "erro_autorizacao";
          else statusLocal = status;
          setListInvoices((prev) =>
            prev.map((rps) =>
              rps.id === invoice.id ? { ...rps, status: statusLocal } : rps,
            ),
          );
          toast.info(`Status atualizado (tentativa alternativa): ${status}`);
          if (
            ["Autorizada", "Cancelada", "Erro Autorização"].includes(status)
          ) {
            toast.success(`NFSe finalizada com status: ${status}`);
          }
        } catch (err2: any) {
          const is404b =
            err2?.response?.status === 404 ||
            (err2?.message && String(err2.message).includes("404"));
          if (is404b) {
            setListInvoices((prev) =>
              prev.map((rps) =>
                rps.id === invoice.id
                  ? { ...rps, status: "processando_autorizacao" }
                  : rps,
              ),
            );
            toast.info(
              "NFSe não encontrada na FocusNFE (tentativas esgotadas). Aguarde alguns minutos.",
            );
          } else {
            const errorMsg =
              err2 instanceof Error ? err2.message : "Erro desconhecido";
            toast.error(
              `Erro ao consultar NFSe (tentativa alternativa): ${errorMsg}`,
            );
          }
        }
      } else {
        const errorMsg =
          err instanceof Error ? err.message : "Erro desconhecido";
        toast.error(`Erro ao consultar NFSe: ${errorMsg}`);
      }
    } finally {
      setIsLoadingRPS(false);
    }
  };

  const renderActionButtons = useCallback(
    (row: any) => (
      <SButtonContainer>
        <CustomButton
          $variant={"success"}
          width="80px"
          onClick={() => handleResult(row)}
        >
          Atualizar
        </CustomButton>
        <CustomButton
          $variant={"primary"}
          width="80px"
          onClick={() => handleEditInvoice(row)}
        >
          Editar
        </CustomButton>
        <CustomButton
          $variant={"danger"}
          width="80px"
          onClick={() => handleDeleteInvoice(row)}
        >
          Deletar
        </CustomButton>
      </SButtonContainer>
    ),
    [handleEditInvoice, handleDeleteInvoice, handleResult],
  );

  return (
    <SContainer>
      <SCardInfo>
        <STitle>Emissão de NFSe</STitle>
        <SContainerSearchAndButton>
          <CustomSearch
            width="400px"
            placeholder="Digite Nº Contrato ou Nome do Tomador"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <CustomButton
            $variant="success"
            width="220px"
            onClick={handleIssueFull}
            // UX: Desabilita e muda o texto durante o carregamento/envio
            disabled={isLoadingRPS || dataFilteredBySearch.length === 0}
          >
            {isLoadingRPS ? "Enviando..." : "Validar • Assinar • Enviar"}
          </CustomButton>

          <CustomButton
            $variant="success"
            width="220px"
            onClick={handleGeraNF_XML}
          >
            Gerar Arquivo XML
          </CustomButton>
        </SContainerSearchAndButton>
        <SCardInfo>
          <STitle>RPS Geradas</STitle>
          <CustomTable
            hasCheckbox
            multiSelect
            data={dataFilteredBySearch}
            columns={[
              { header: "Status", field: "status" },
              { header: "Nº RPS", field: "rps_number" },
              { header: "Data Emissão", field: "rps_emission_date" },
              { header: "Contrato", field: "service_code" },
              { header: "Tomador", field: "name" },
              { header: "Valor", field: "service_value" },
            ]}
            isLoading={isLoadingRPS}
            hasPagination={true}
            actionButtons={renderActionButtons}
            onSelectionChange={(selectedRows) => {
              if (selectedRows.length > 0) {
                setSelectedInvoice(selectedRows);
              } else {
                setSelectedInvoice(null);
              }
            }}
            page={pageRPS}
            setPage={setPageRPS}
            order={orderRPS}
            orderBy={orderByRPS}
            setOrder={setOrderRPS}
            setOrderBy={setOrderByRPS}
          />
        </SCardInfo>
      </SCardInfo>
    </SContainer>
  );
}
