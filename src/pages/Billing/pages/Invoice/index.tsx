import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
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
    const [searchTerm, setSearchTerm] = useState("");

    const [listInvoices, setListInvoices] = useState<IListInvoices[]>([]);
    const [isLoadingRPS, setIsLoadingRPS] = useState<boolean>(true);
    const [pageRPS, setPageRPS] = useState(0);
    const [orderRPS, setOrderRPS] = useState<"asc" | "desc">("desc");
    const [orderByRPS, setOrderByRPS] = useState<string>("rps_number");
    const [selectedInvoice, setSelectedInvoice] = useState<
        IListInvoices[] | null
    >([]);

    const fetchData = useCallback(async () => {
        setIsLoadingRPS(true);
        try {
            const responseInvoice = await invoiceContext.listInvoices();

            const filteredListInvoices = responseInvoice.data.filter(
                (invoice: { nfs_number: string }) => invoice.nfs_number == ""
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
        CNPJ: "05668724000121",
        IM: "67527655",
        MUNICIPIO: "3550308",
        SERIE: "A",
    };

    const gerarXML = () => {
        const rpsList = selectedInvoice;
        const totalServicos = rpsList?.reduce(
            (sum, rps) => sum + Number(rps?.service_value || 0),
            0
        );
        const totalDeducoes = rpsList?.reduce(
            (sum, rps) => sum + Number(rps.deduction_value || 0),
            0
        );
        const dataInicio = dayjs().format("YYYY-MM-DD");
        const dataFim = dataInicio;

        let xml = `<Cabecalho Versao="1" xmlns="">
    <CPFCNPJRemetente>
      <CNPJ>${PRESTADOR.CNPJ}</CNPJ>
    </CPFCNPJRemetente>
    <transacao>false</transacao>
    <dtInicio>${dataInicio}</dtInicio>
    <dtFim>${dataFim}</dtFim>
    <QtdRPS>${rpsList?.length}</QtdRPS>
    <ValorTotalServicos>${totalServicos?.toFixed(2)}</ValorTotalServicos>
    <ValorTotalDeducoes>${totalDeducoes?.toFixed(2)}</ValorTotalDeducoes>
  </Cabecalho>`;

        rpsList?.forEach((rps) => {
            const discriminacao = escapeXml(
                rps.service_discrim
                    .replace(/(\r\n|\n|\r)/g, "|") // Transforma enter em pipe
                    .replace(/\t/g, " ") // Remove tabs
                    .replace(/\u00A0/g, " ") // Remove non-breaking spaces
                    .replace(/\s+/g, " ") // Transforma múltiplos espaços em um só
            );
            const valorServico = Number(rps.service_value || 0).toFixed(2);
            const codServico = String(rps.service_code).padStart(5, "0");
            const codCidadeIBGE = rps.city_ibge || "3550308";

            xml += `
  <RPS xmlns="">
    <Assinatura></Assinatura>
    <ChaveRPS>
      <InscricaoPrestador>${PRESTADOR.IM}</InscricaoPrestador>
      <SerieRPS>${PRESTADOR.SERIE}</SerieRPS>
      <NumeroRPS>${rps.rps_number}</NumeroRPS>
    </ChaveRPS>
    <TipoRPS>RPS</TipoRPS>
    <DataEmissao>${dayjs(rps.rps_emission_date).format(
        "YYYY-MM-DD"
    )}</DataEmissao>
    <StatusRPS>N</StatusRPS>
    <TributacaoRPS>T</TributacaoRPS>
    <ValorServicos>${valorServico}</ValorServicos>
    <ValorDeducoes>${Number(rps.deduction_value || 0).toFixed(
        2
    )}</ValorDeducoes>
    <ValorPIS>${Number(rps.valor_pis || 0).toFixed(2)}</ValorPIS>
    <ValorCOFINS>${Number(rps.valor_cofins || 0).toFixed(2)}</ValorCOFINS>
    <ValorINSS>${Number(rps.valor_inss || 0).toFixed(2)}</ValorINSS>
    <ValorIR>${Number(rps.valor_ir || 0).toFixed(2)}</ValorIR>
    <ValorCSLL>${Number(rps.valor_csll || 0).toFixed(2)}</ValorCSLL>
    <CodigoServico>${codServico}</CodigoServico>
    <AliquotaServicos>${Number(rps.aliquota || 0.05).toFixed(
        4
    )}</AliquotaServicos>
    <ISSRetido>${rps.iss_retido ? "true" : "false"}</ISSRetido>
    <CPFCNPJTomador>
      ${
          rps.cpf_cnpj.length === 14
              ? `<CNPJ>${cleanData(rps.cpf_cnpj)}</CNPJ>`
              : `<CPF>${cleanData(rps.cpf_cnpj)}</CPF>`
      }
    </CPFCNPJTomador>
    <RazaoSocialTomador>${escapeXml(rps.name)}</RazaoSocialTomador>
    <EnderecoTomador>
      <TipoLogradouro>RUA</TipoLogradouro>
      <Logradouro>${escapeXml(rps.address.trim())}</Logradouro>
      <NumeroEndereco>${escapeXml(rps.number)}</NumeroEndereco>
      <ComplementoEndereco>${escapeXml(
          rps.complement || ""
      )}</ComplementoEndereco>
      <Bairro>${escapeXml(rps.district)}</Bairro>
      <Cidade>${codCidadeIBGE}</Cidade>
      <UF>${escapeXml(rps.state)}</UF>
      <CEP>${rps.zip_code.replace(/\D/g, "")}</CEP>
    </EnderecoTomador>
    <Discriminacao>${discriminacao}</Discriminacao>
    <MunicipioPrestacao>3550308</MunicipioPrestacao>
    <NumeroEncapsulamento>0</NumeroEncapsulamento>
    <ValorTotalRecebido>${valorServico}</ValorTotalRecebido>
  </RPS>`;
        });

        // No final da sua função gerarXML()
        const xmlBruto = `<?xml version="1.0" encoding="UTF-8"?><PedidoEnvioLoteRPS xmlns="http://www.prefeitura.sp.gov.br/nfe">${xml}</PedidoEnvioLoteRPS>`;

        // ADICIONE ISSO ANTES DO RETURN:
        return xmlBruto
            .replace(/>\s+</g, "><")
            .replace(/\r?\n|\r/g, "")
            .trim();
    };

    // ===================================
    // SALVAR XML EM ARQUIVO PARA DOWNLOAD
    // ===================================
    const handleGeraNF_XML = () => {
        if (selectedInvoice?.length === 0) {
            toast.error("Nenhuma RPS encontrada para gerar XML.");
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
                "Por favor, selecione ao menos uma RPS na lista para enviar."
            );
            return;
        }

        const xml = gerarXML(); // assume que gerarXML() retorna o XML bruto não-assinado
        try {
            setIsLoadingRPS(true);
            const resp = await fetch(
                "http://localhost:3030/api/nfse/enviar-lote",
                {
                    method: "POST",
                    //headers: { "Content-Type": "application/xml" },
                    headers: { "Content-Type": "application/json" },
                    //body: xml,
                    body: JSON.stringify({ xml: xml }),
                }
            );

            const json = await resp.json();
            if (!resp.ok) {
                toast.error(
                    "Erro no envio: " + (json.error || JSON.stringify(json))
                );
            } else {
                toast.success("Lote enviado com sucesso (resposta recebida).");
                console.log("Resposta servidor:", json);
            }
        } catch (err) {
            console.error(err);
            toast.error("Falha na conexão com o servidor de NFSe.");
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
                invoice.name?.toLowerCase().includes(lowerCaseSearch)
        );
    }, [listInvoices, searchTerm]);

    const nameColumnsFromRPS = useMemo(
        () => [
            { field: "rps_number", header: "RPS" },
            { field: "rps_emission_date", header: "Dt.RPS" },
            { field: "service_code", header: "Contrato" },
            { field: "cpf_cnpj", header: "CNPJ/CPF", width: "150px" },
            { field: "name", header: "Nome", width: "150px" },
            { field: "service_liquid_value", header: "Vlr.Líquido" },
        ],
        []
    );

    const renderActionButtons = useCallback(
        () => (
            <SButtonContainer>
                <CustomButton $variant={"primary"} width="80px">
                    Editar
                </CustomButton>
                <CustomButton $variant={"danger"} width="80px">
                    Deletar
                </CustomButton>
            </SButtonContainer>
        ),
        []
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
                        disabled={
                            isLoadingRPS || dataFilteredBySearch.length === 0
                        }
                    >
                        {isLoadingRPS
                            ? "Enviando..."
                            : "Validar • Assinar • Enviar"}
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
                        columns={nameColumnsFromRPS}
                        isLoading={isLoadingRPS}
                        hasPagination={true}
                        actionButtons={renderActionButtons}
                        onSelectionChange={(selectedRows) => {
                            if (selectedRows.length > 0) {
                                const row = selectedRows;
                                setSelectedInvoice(row);
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
