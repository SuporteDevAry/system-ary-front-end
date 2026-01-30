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
    >([]);

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
                    .replace(/(\r\n|\n|\r)/g, "|") // Remove quebras de linha
                    .replace(/\t/g, " ") // Remove tabs
                    .replace(/\u00A0/g, " ") // Remove non-breaking spaces
                    .replace(/\s+/g, " ") // Múltiplos espaços em um só
                    .trim(),
            );

            const valorServico = Number(rps.service_value || 0).toFixed(2);
            const codServico = PRESTADOR.CODIGO_SERVICO;
            const codCidadeIBGE = rps.city_ibge || PRESTADOR.MUNICIPIO;

            const aliquota = Number(rps.aliquota || 5); // Padrão 5% para SP
            const aliquotaFormatada = aliquota;
            aliquota > 1 ? (aliquota / 100).toFixed(4) : aliquota.toFixed(4);

            const cpfCnpjLimpo = cleanData(rps.cpf_cnpj);
            const dataBanco = rps.rps_emission_date;
            const dataIso = dataBanco.split("/").reverse().join("-");

            // ✅ RPS COM xmlns="" (Id será gerenciado pelo backend)
            xml += `<RPS xmlns="">`;
            xml += `<Assinatura></Assinatura>`;
            xml += `<ChaveRPS>`;
            xml += `<InscricaoPrestador>${PRESTADOR.IM}</InscricaoPrestador>`;
            xml += `<SerieRPS>${PRESTADOR.SERIE}</SerieRPS>`;
            xml += `<NumeroRPS>${rps.rps_number}</NumeroRPS>`;
            xml += `</ChaveRPS>`;
            xml += `<TipoRPS>RPS</TipoRPS>`;
            xml += `<DataEmissao>${dayjs(dataIso).format(
                "YYYY-MM-DD",
            )}</DataEmissao>`;
            xml += `<StatusRPS>N</StatusRPS>`;
            xml += `<TributacaoRPS>T</TributacaoRPS>`;
            xml += `<Servico>`;
            xml += `<ValorServicos>${valorServico}</ValorServicos>`;
            xml += `<ValorDeducoes>${Number(rps.deduction_value || 0).toFixed(
                2,
            )}</ValorDeducoes>`;
            xml += `<ValorPIS>${Number(rps.valor_pis || 0).toFixed(
                2,
            )}</ValorPIS>`;
            xml += `<ValorCOFINS>${Number(rps.valor_cofins || 0).toFixed(
                2,
            )}</ValorCOFINS>`;
            xml += `<ValorINSS>${Number(rps.valor_inss || 0).toFixed(
                2,
            )}</ValorINSS>`;
            xml += `<ValorIR>${Number(rps.valor_ir || 0).toFixed(2)}</ValorIR>`;
            xml += `<ValorCSLL>${Number(rps.valor_csll || 0).toFixed(
                2,
            )}</ValorCSLL>`;
            xml += `<CodigoServico>${codServico}</CodigoServico>`;
            xml += `<ValorISS>0</ValorISS>`;
            xml += `<AliquotaServicos>${aliquotaFormatada}</AliquotaServicos>`;
            xml += `<ISSRetido>${
                rps.iss_retido === true ? "true" : "false"
            }</ISSRetido>`;
            xml += `</Servico>`;
            xml += `<CPFCNPJTomador>`;

            if (cpfCnpjLimpo.length === 14) {
                xml += `<CNPJ>${cpfCnpjLimpo}</CNPJ>`;
            } else {
                xml += `<CPF>${cpfCnpjLimpo}</CPF>`;
            }

            xml += `</CPFCNPJTomador>`;
            xml += `<RazaoSocialTomador>${escapeXml(
                rps.name,
            )}</RazaoSocialTomador>`;

            // Adiciona email do tomador se existir
            if (rps.email && rps.email.trim()) {
                xml += `<EmailTomador>${escapeXml(
                    rps.email.trim(),
                )}</EmailTomador>`;
            }

            xml += `<EnderecoTomador>`;
            xml += `<TipoLogradouro>RUA</TipoLogradouro>`;
            xml += `<Logradouro>${escapeXml(rps.address.trim())}</Logradouro>`;
            xml += `<NumeroEndereco>${escapeXml(rps.number)}</NumeroEndereco>`;
            xml += `<ComplementoEndereco>${escapeXml(
                rps.complement || "",
            )}</ComplementoEndereco>`;
            xml += `<Bairro>${escapeXml(rps.district)}</Bairro>`;
            xml += `<Cidade>${codCidadeIBGE}</Cidade>`;
            xml += `<UF>${escapeXml(rps.state).toUpperCase()}</UF>`;
            xml += `<CEP>${rps.zip_code.replace(/\D/g, "")}</CEP>`;
            xml += `</EnderecoTomador>`;
            xml += `<Discriminacao>${discriminacao}</Discriminacao>`;
            // xml += `<MunicipioPrestacao>${PRESTADOR.MUNICIPIO}</MunicipioPrestacao>`;
            //xml += `<NumeroEncapsulamento>0</NumeroEncapsulamento>`;
            //xml += `<ValorTotalRecebido>${valorServico}</ValorTotalRecebido>`;
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
                !rps.rps_number ||
                !rps.service_value ||
                !rps.cpf_cnpj ||
                !rps.name,
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
                !rps.rps_number ||
                !rps.service_value ||
                !rps.cpf_cnpj ||
                !rps.name,
        );

        if (invalidRPS) {
            toast.error(
                "Existem RPSs com dados obrigatórios faltando. Verifique os dados antes de enviar.",
            );
            return;
        }

        const xml = gerarXML(); // assume que gerarXML() retorna o XML bruto não-assinado

        // 🔍 DEBUG: Verifica valores antes de enviar
        console.log(
            "📤 XML gerado (primeiros 500 chars):",
            xml.substring(0, 500),
        );
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
        } catch (err) {
            console.error(err);
            const errorMsg =
                err instanceof Error ? err.message : "Erro desconhecido";
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
                toast.success(
                    `RPS ${invoice.rps_number} deletada com sucesso!`,
                );
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

    const nameColumnsFromRPS = useMemo(
        () => [
            { field: "rps_number", header: "RPS" },
            { field: "rps_emission_date", header: "Dt.RPS" },
            { field: "service_code", header: "Contrato" },
            { field: "cpf_cnpj", header: "CNPJ/CPF", width: "150px" },
            { field: "name", header: "Nome", width: "150px" },
            { field: "service_liquid_value", header: "Vlr.Líquido" },
        ],
        [],
    );

    const renderActionButtons = useCallback(
        (rowData: any) => {
            // Alterado de IListInvoices para any
            const invoice = rowData as IListInvoices; // Cast interno para manter o autocomplete
            return (
                <SButtonContainer>
                    <CustomButton
                        $variant={"primary"}
                        width="80px"
                        onClick={() => handleEditInvoice(invoice)}
                    >
                        Editar
                    </CustomButton>
                    <CustomButton
                        $variant={"danger"}
                        width="80px"
                        onClick={() => handleDeleteInvoice(invoice)}
                    >
                        Deletar
                    </CustomButton>
                </SButtonContainer>
            );
        },
        [handleEditInvoice, handleDeleteInvoice],
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
