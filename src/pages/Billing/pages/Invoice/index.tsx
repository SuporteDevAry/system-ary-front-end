import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomButton from "../../../../components/CustomButton";
import CustomTable from "../../../../components/CustomTable";
import { FaFilePdf } from "react-icons/fa6";
import { BsFiletypeXml } from "react-icons/bs";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
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
import { ModalDelete } from "../../../../components/ModalDelete";

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
    const [isDeleteInvoiceModal, setDeleteInvoiceModal] =
        useState<boolean>(false);
    const [modalContent, setModalContent] = useState<string>("");
    const [invoiceForDelete, setInvoiceForDelete] = useState<IListInvoices>();
    const ibgeByCepCache = useRef(new Map<string, string>());

    const getInvoiceSelectionKey = useCallback((invoice: IListInvoices) => {
        return String(invoice.rps_number || invoice.id);
    }, []);

    const normalizeSelectedInvoices = useCallback(
        (invoices: IListInvoices[] | null | undefined) => {
            if (!invoices || invoices.length === 0) return [];

            const uniqueInvoices = new Map<string, IListInvoices>();

            invoices.forEach((invoice) => {
                uniqueInvoices.set(getInvoiceSelectionKey(invoice), invoice);
            });

            return Array.from(uniqueInvoices.values());
        },
        [getInvoiceSelectionKey],
    );

    const isAuthorizedForCancel = useCallback((status?: string | null) => {
        return (
            String(status || "")
                .trim()
                .toUpperCase() === "AUTORIZADA"
        );
    }, []);

    const selectedInvoicesForActions = useMemo(
        () => normalizeSelectedInvoices(selectedInvoice),
        [normalizeSelectedInvoices, selectedInvoice],
    );

    const hasAuthorizedSelectedInvoice = useMemo(
        () =>
            selectedInvoicesForActions.some((invoice) =>
                isAuthorizedForCancel(invoice?.status),
            ),
        [isAuthorizedForCancel, selectedInvoicesForActions],
    );

    const fetchData = useCallback(async () => {
        setIsLoadingRPS(true);
        try {
            const responseInvoice = await invoiceContext.listInvoices();
            setListInvoices(responseInvoice.data);
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
    const FOREIGN_TOMADOR_IBGE = "9999999";

    const getPrimitiveString = (value: unknown) => {
        if (typeof value === "string" || typeof value === "number") {
            const normalized = String(value).trim();
            return normalized ? normalized : "";
        }

        return "";
    };

    const isForeignTomador = (invoice: IListInvoices) => {
        return getPrimitiveString(invoice.exportacao) === "Sim";
    };

    const normalizeExportacao = (value?: string | null) => {
        const normalizedValue = getPrimitiveString(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        if (normalizedValue === "sim") return "Sim";
        if (normalizedValue === "nao") return "Não";

        return null;
    };

    const extractIbgeCodeFromResponse = (res: any) => {
        const rawCode = getPrimitiveString(
            res?.codigo_ibge ||
                res?.ibge ||
                res?.codigo_municipio ||
                res?.codigo_municipio_ibge ||
                res?.municipio_ibge ||
                res?.codigoIBGE ||
                res?.codigoIbge ||
                res?.resultado?.codigo_ibge ||
                res?.resultado?.ibge ||
                res?.resultado?.codigo_municipio ||
                res?.resultado?.codigo_municipio_ibge ||
                res?.resultado?.municipio_ibge ||
                res?.resultado?.codigoIBGE ||
                res?.resultado?.codigoIbge ||
                res?.data?.codigo_ibge ||
                res?.data?.ibge ||
                res?.data?.codigo_municipio ||
                res?.data?.codigo_municipio_ibge ||
                res?.data?.municipio_ibge ||
                res?.data?.codigoIBGE ||
                res?.data?.codigoIbge ||
                res,
        );

        const normalized = rawCode.replace(/\D/g, "");
        return normalized.length === 7 ? normalized : "";
    };

    const resolveCityIbgeFromCep = useCallback(
        async (invoice: IListInvoices) => {
            if (isForeignTomador(invoice)) {
                return FOREIGN_TOMADOR_IBGE;
            }

            const cep = getPrimitiveString(invoice.zip_code).replace(/\D/g, "");

            if (!cep) {
                throw new Error(
                    `A RPS ${invoice.rps_number} não possui CEP do tomador para consultar o IBGE.`,
                );
            }

            const cachedCode = ibgeByCepCache.current.get(cep);
            if (cachedCode) {
                return cachedCode;
            }

            const response = await nfseContext.buscarIbgePorCep(cep);
            const code = extractIbgeCodeFromResponse(response);

            if (!code) {
                throw new Error(
                    `RPS ${invoice.rps_number} - consulta de IBGE pelo CEP ${cep} não retornou código válido.`,
                );
            }

            ibgeByCepCache.current.set(cep, code);
            return code;
        },
        [nfseContext],
    );

    const resolveInvoicesWithIbge = useCallback(
        async (invoices: IListInvoices[]) => {
            const resolvedInvoices: IListInvoices[] = [];

            for (const invoice of invoices) {
                try {
                    const cityIbge = isForeignTomador(invoice)
                        ? FOREIGN_TOMADOR_IBGE
                        : await resolveCityIbgeFromCep(invoice);

                    resolvedInvoices.push({
                        ...invoice,
                        city_ibge: cityIbge,
                    });
                } catch (error) {
                    const cep = getPrimitiveString(invoice.zip_code).replace(
                        /\D/g,
                        "",
                    );
                    const errorMsg =
                        error instanceof Error
                            ? error.message
                            : "Erro desconhecido";

                    throw new Error(
                        `RPS ${invoice.rps_number}${
                            cep ? ` - CEP ${cep}` : ""
                        } - ${errorMsg}`,
                    );
                }
            }

            return resolvedInvoices;
        },
        [getPrimitiveString, resolveCityIbgeFromCep],
    );

    const extractResponseRpsNumber = (item: any) => {
        return getPrimitiveString(
            item?.numero_rps ||
                item?.rps_number ||
                item?.numeroRps ||
                item?.rps,
        );
    };

    const findResponseItemByRps = (res: any, inv: IListInvoices) => {
        if (!res) return null;

        const possibleCollections = [
            res,
            res?.resultado,
            res?.resultado?.rps,
            res?.resultado?.rpss,
            res?.resultado?.notas,
            res?.resultado?.lote,
            res?.resultado?.lote?.rps,
            res?.data,
            res?.data?.rps,
            res?.data?.rpss,
            res?.data?.notas,
            res?.data?.lote,
            res?.lote,
            res?.lote?.rps,
        ];

        for (const collection of possibleCollections) {
            if (!Array.isArray(collection)) continue;

            const found = collection.find(
                (item: any) =>
                    extractResponseRpsNumber(item) === String(inv.rps_number),
            );

            if (found) return found;
        }

        return null;
    };

    const findSingleResponseItem = (res: any) => {
        if (!res) return null;

        const possibleCollections = [
            res?.resultado?.rps,
            res?.resultado?.rpss,
            res?.resultado?.notas,
            res?.resultado?.lote?.rps,
            res?.data?.rps,
            res?.data?.rpss,
            res?.data?.notas,
            res?.data?.lote?.rps,
            res?.lote?.rps,
        ];

        for (const collection of possibleCollections) {
            if (Array.isArray(collection) && collection.length === 1) {
                return collection[0];
            }
        }

        return null;
    };

    const extractProtocolValue = (item: any) => {
        return getPrimitiveString(
            item?.protocolo_lote ||
                item?.numero_lote ||
                item?.protocolo ||
                item?.numero_protocolo ||
                item?.lote?.protocolo_lote ||
                item?.lote?.numero_lote ||
                item?.lote?.protocolo ||
                item?.lote?.numero_protocolo ||
                item?.lote?.numero ||
                item?.lote,
        );
    };

    const extractBatchProtocol = (res: any, inv: IListInvoices) => {
        const matchedItem =
            findResponseItemByRps(res, inv) || findSingleResponseItem(res);
        const itemProtocol = extractProtocolValue(matchedItem);

        if (itemProtocol) return itemProtocol;

        const topLevelProtocol = extractProtocolValue(res);

        if (topLevelProtocol) return topLevelProtocol;

        const resultProtocol = extractProtocolValue(res?.resultado);

        if (resultProtocol) return resultProtocol;

        return extractProtocolValue(res?.data);
    };

    const extractInvoiceInfoFromResponse = (res: any, inv: IListInvoices) => {
        const emptyInfo = {
            status: null as string | null,
            url: null as string | null,
            numero: null as string | null,
        };

        if (!res) return emptyInfo;

        const found =
            findResponseItemByRps(res, inv) || findSingleResponseItem(res);

        if (found) {
            return {
                status:
                    found.status || found.Status
                        ? String(found.status || found.Status)
                        : null,
                url:
                    found.url_danfse ||
                    found.url ||
                    found.link ||
                    found.pdf ||
                    null,
                numero:
                    found.numero_nfse || found.numero
                        ? String(found.numero_nfse || found.numero)
                        : null,
            };
        }

        if (typeof res === "object") {
            if (res.status || res.Status) {
                return {
                    status: String(res.status || res.Status),
                    url: res.url_danfse || res.url || null,
                    numero:
                        res.numero_nfse || res.numero
                            ? String(res.numero_nfse || res.numero)
                            : null,
                };
            }

            if (
                res.resultado &&
                (res.resultado.status || res.resultado.Status)
            ) {
                return {
                    status: String(
                        res.resultado.status || res.resultado.Status,
                    ),
                    url: res.resultado.url_danfse || res.resultado.url || null,
                    numero:
                        res.resultado.numero_nfse || res.resultado.numero
                            ? String(
                                  res.resultado.numero_nfse ||
                                      res.resultado.numero,
                              )
                            : null,
                };
            }
        }

        return emptyInfo;
    };

    const normalizeInvoiceStatus = (
        remoteStatus: string | null,
        remoteUrl: string | null,
    ) => {
        const normalizedRemoteStatus = String(remoteStatus || "").trim();

        if (/erro/i.test(normalizedRemoteStatus)) {
            return "erro_autorizacao";
        }
        if (/processando/i.test(normalizedRemoteStatus)) {
            return "processando_autorizacao";
        }
        if (/cancelad/i.test(normalizedRemoteStatus)) {
            return "cancelada";
        }
        if (/autoriz/i.test(normalizedRemoteStatus)) {
            return remoteUrl ? "autorizada" : "processando_autorizacao";
        }

        return remoteStatus ?? "processando_autorizacao";
    };

    const isAuthorizedStatus = (status: string | null) => {
        const normalizedStatus = String(status || "").trim();
        return ["AUTORIZADA", "AUTORIZADO"].includes(
            normalizedStatus.toUpperCase(),
        );
    };

    const gerarXML = (rpsListParam?: IListInvoices[]) => {
        const rpsList = rpsListParam ?? selectedInvoice;

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
        xml += `<transacao>true</transacao>`;
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
            const exportacao = normalizeExportacao(rps.exportacao);

            if (!exportacao) {
                throw new Error(
                    `A RPS ${rps.rps_number} está sem o campo exportação preenchido corretamente.`,
                );
            }

            const discriminacao = escapeXml(
                rps.service_discrim
                    .replace(/(\r\n|\n|\r)/g, "|")
                    .replace(/\t/g, " ")
                    .replace(/\u00A0/g, " ")
                    .replace(/\s+/g, " ")
                    .trim(),
            );
            const valorServico = Number(rps.service_value || 0).toFixed(2);
            const valorServicoNumber = Number(rps.service_value || 0);
            const valorDeducoes = Number(rps.deduction_value || 0).toFixed(2);
            const valorPIS = (valorServicoNumber * 0.0065).toFixed(2);
            const valorCOFINS = (valorServicoNumber * 0.03).toFixed(2);
            const valorINSS = Number(rps.valor_inss || 0).toFixed(2);
            const valorIR = Number(rps.valor_ir || 0).toFixed(2);
            const valorCSLL = (valorServicoNumber * 0.01).toFixed(2);
            const aliquotaServicos = (rps.aliquota_servicos || 0.05).toFixed(4);
            const valorFinalCobrado = Number(
                rps.service_liquid_value || valorServico,
            ).toFixed(2);
            const valorIPI = Number(rps.valor_ipi || 0).toFixed(2);
            const exigibilidadeSuspensa = rps.exigibilidade_suspensa || 0;
            //const pagamentoParceladoAntecipado =
            //     rps.pagamento_parcelado_antecipado || 0;
            const nbs = rps.nbs || "102010000";
            const codCidadeIBGE = getPrimitiveString(rps.city_ibge);

            if (!codCidadeIBGE) {
                throw new Error(
                    `A RPS ${rps.rps_number} não possui código IBGE do tomador.`,
                );
            }

            const cLocPrestacao = codCidadeIBGE;
            const tipoLogradouro = rps.tipo_logradouro || "ROD";
            const codServico = PRESTADOR.CODIGO_SERVICO;
            const cpfCnpjLimpo = cleanData(rps.cpf_cnpj);
            const dataBanco = rps.rps_emission_date;
            const dataIso = dataBanco.split("/").reverse().join("-");
            const assinaturaDummy = "DUMMY";
            const codigo_indicador_operacao = "100301";

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
            xml += `<TributacaoRPS>${exportacao === "Sim" ? "P" : "T"}</TributacaoRPS>`;
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
            //xml += `<PagamentoParceladoAntecipado>${pagamentoParceladoAntecipado}</PagamentoParceladoAntecipado>`;
            xml += `<NBS>${nbs}</NBS>`;
            xml += `<cLocPrestacao>${cLocPrestacao}</cLocPrestacao>`;
            xml += `<IBSCBS>`;
            xml += `<finNFSe>0</finNFSe>`;
            xml += `<indFinal>0</indFinal>`;
            xml += `<cIndOp>${codigo_indicador_operacao}</cIndOp>`;
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

    const handleCancelNFSe = async () => {
        const invoicesToIssue = selectedInvoicesForActions;
        const selectedInvoiceToCancel = invoicesToIssue[0];

        if (invoicesToIssue.length === 0) {
            toast.error("Nenhuma NFSe selecionada para cancelamento.");
            return;
        }

        if (invoicesToIssue.length > 1) {
            toast.error("Selecione apenas uma NFSe para cancelamento.");
            return;
        }

        if (!isAuthorizedForCancel(selectedInvoiceToCancel?.status)) {
            toast.error(
                "A NFSe s� pode ser cancelada quando o registro estiver com status AUTORIZADA.",
            );
            return;
        }

        const protocoloLote = selectedInvoiceToCancel?.protocolo_lote;

        if (!protocoloLote) {
            toast.error(
                "A NFSe selecionada n�o possui protocolo para cancelamento.",
            );
            return;
        }

        try {
            setIsLoadingRPS(true);
            const response = await nfseContext.cancelarNFSe(protocoloLote);

            setListInvoices((prev) =>
                prev.map((invoice) =>
                    invoice.id === selectedInvoiceToCancel.id
                        ? {
                              ...invoice,
                              status: "cancelada",
                          }
                        : invoice,
                ),
            );

            setSelectedInvoice(
                (prev) =>
                    prev?.map((invoice) =>
                        invoice.id === selectedInvoiceToCancel.id
                            ? {
                                  ...invoice,
                                  status: "cancelada",
                              }
                            : invoice,
                    ) ?? null,
            );

            toast.success(
                response?.message ||
                    `NFSe vinculada ao protocolo ${protocoloLote} cancelada com sucesso.`,
            );
            await fetchData();
        } catch (error: any) {
            const errorMsg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Não foi possível cancelar a NFSe.";
            toast.error(`Erro ao cancelar NFSe: ${errorMsg}`);
        } finally {
            setIsLoadingRPS(false);
        }
    };

    // ===================================
    // SALVAR XML EM ARQUIVO PARA DOWNLOAD
    // ===================================
    const handleGeraNF_XML = async () => {
        const invoicesToIssue = normalizeSelectedInvoices(selectedInvoice);

        if (invoicesToIssue.length === 0) {
            toast.error("Nenhuma RPS encontrada para gerar XML.");
            return;
        }

        // Validações básicas antes de gerar XML
        const invalidRPS = invoicesToIssue.find((rps) => {
            // Permite ausência de cpf_cnpj se for estrangeiro (exportacao = Sim)
            const isEstrangeiro = getPrimitiveString(rps.exportacao) === "Sim";
            return (
                !rps.rps_number ||
                !rps.service_value ||
                !rps.name ||
                !normalizeExportacao(rps.exportacao) ||
                (!rps.cpf_cnpj && !isEstrangeiro)
            );
        });

        if (invalidRPS) {
            toast.error(
                "Existem RPSs com dados obrigatórios faltando ou com exportação inválida. Verifique os dados.",
            );
            return;
        }

        let invoicesWithIbge: IListInvoices[];

        try {
            invoicesWithIbge = await resolveInvoicesWithIbge(invoicesToIssue);
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : "Erro desconhecido";
            toast.error(`Erro ao obter IBGE pelo CEP: ${errorMsg}`);
            return;
        }

        const xml = gerarXML(invoicesWithIbge);

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
        const invoicesToIssue = normalizeSelectedInvoices(selectedInvoice);
        // Verifica se há dados para enviar
        if (invoicesToIssue.length === 0) {
            toast.error(
                "Por favor, selecione ao menos uma RPS na lista para enviar.",
            );
            return;
        }

        // Validações básicas antes de enviar
        const invalidRPS = invoicesToIssue.find((rps) => {
            // Permite ausência de cpf_cnpj se for estrangeiro (exportacao = Sim)
            const isEstrangeiro = getPrimitiveString(rps.exportacao) === "Sim";
            return (
                !rps.rps_number ||
                !rps.service_value ||
                !rps.name ||
                (!rps.cpf_cnpj && !isEstrangeiro)
            );
        });

        if (invalidRPS) {
            toast.error(
                "Existem RPSs com dados obrigatórios faltando ou com exportação inválida. Verifique os dados antes de enviar.",
            );
            return;
        }

        try {
            setIsLoadingRPS(true);
            const updatedInvoices: IListInvoices[] = [];
            const failedInvoices: string[] = [];
            const processedProtocols = new Set<string>();
            const invoicesWithIbge =
                await resolveInvoicesWithIbge(invoicesToIssue);

            for (const invoice of invoicesWithIbge) {
                try {
                    const xml = gerarXML([invoice]);
                    const result = await nfseContext.enviarLote({ xml });
                    const protocoloLote = extractBatchProtocol(result, invoice);

                    if (!protocoloLote) {
                        throw new Error(
                            "A API não retornou um número de lote para esta RPS.",
                        );
                    }

                    if (processedProtocols.has(protocoloLote)) {
                        throw new Error(
                            `O lote ${protocoloLote} já, foi usado neste envio para outra RPS.`,
                        );
                    }

                    processedProtocols.add(protocoloLote);
                    const info = extractInvoiceInfoFromResponse(
                        result,
                        invoice,
                    );
                    const status = normalizeInvoiceStatus(
                        info.status,
                        info.url,
                    );

                    const updatedInvoice = {
                        ...invoice,
                        protocolo_lote: protocoloLote,
                        status,
                        url_danfse: info.url ?? invoice.url_danfse,
                        nfs_number:
                            isAuthorizedStatus(info.status) && info.numero
                                ? info.numero
                                : invoice.nfs_number,
                    };

                    const fullInvoice = await invoiceContext.getInvoiceById(
                        invoice.id,
                    );

                    await invoiceContext.updateInvoice(invoice.id, {
                        ...fullInvoice.data,
                        city_ibge: invoice.city_ibge,
                        protocolo_lote: updatedInvoice.protocolo_lote,
                        status: updatedInvoice.status,
                        url_danfse: updatedInvoice.url_danfse,
                        nfs_number: updatedInvoice.nfs_number,
                    });

                    updatedInvoices.push(updatedInvoice);
                } catch (error) {
                    failedInvoices.push(String(invoice.rps_number));
                    const errorMsg =
                        error instanceof Error
                            ? error.message
                            : "Erro desconhecido";
                    toast.error(
                        `Erro ao enviar a RPS ${invoice.rps_number}: ${errorMsg}`,
                    );
                }
            }

            setSelectedInvoice(updatedInvoices);
            setListInvoices((prev) =>
                prev.map((currentInvoice) => {
                    const updatedInvoice = updatedInvoices.find(
                        (invoice) => invoice.id === currentInvoice.id,
                    );

                    return updatedInvoice ?? currentInvoice;
                }),
            );

            if (updatedInvoices.length > 0) {
                toast.success(
                    `${updatedInvoices.length} de ${invoicesToIssue.length} RPS enviadas com sucesso.`,
                );
            }

            if (failedInvoices.length > 0) {
                toast.warning(
                    `Falha ao gerar NFSe para as RPS: ${failedInvoices.join(", ")}`,
                );
            }

            // Recarrega para refletir qualquer dado complementar processado no back-end.
            await fetchData();
        } catch (err) {
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

    const handleOpenDeleteInvoiceModal = useCallback(
        (invoice: IListInvoices) => {
            setModalContent(
                `Tem certeza que deseja deletar a RPS: ${invoice?.rps_number} ?`,
            );
            setInvoiceForDelete(invoice);
            setDeleteInvoiceModal(true);
        },
        [],
    );

    const handleCloseDeleteInvoiceModal = useCallback(() => {
        setDeleteInvoiceModal(false);
    }, []);

    const handleDeleteInvoice = useCallback(async () => {
        if (!invoiceForDelete || !invoiceForDelete.id) {
            toast.error("Id da RPS não encontrado.");
            return;
        }

        try {
            setIsLoadingRPS(true);
            await invoiceContext.deleteInvoice(invoiceForDelete.id);
            toast.success(
                <div>
                    RPS: <strong>{invoiceForDelete.rps_number}</strong> deletada
                    com sucesso!
                </div>,
            );
            fetchData();
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : "Erro desconhecido";
            toast.error(`Erro ao deletar RPS: ${errorMsg}`);
        } finally {
            setIsLoadingRPS(false);
            setDeleteInvoiceModal(false);
        }
    }, [fetchData, invoiceContext, invoiceForDelete]);

    const handleResult = async (invoice: IListInvoices) => {
        if (!invoice) {
            toast.error("Nenhuma RPS selecionada para consultar o lote.");
            return;
        }
        const protocolo_lote = invoice.protocolo_lote;
        // if (!protocolo_lote) {
        //   toast.error("RPS selecionada não possui protocolo de lote.");
        //   return;
        // }
        setIsLoadingRPS(true);
        const tryConsultar = async (prot: string) =>
            nfseContext.consultarLote(prot);

        const persistNfsNumber = async (
            targetInvoice: IListInvoices,
            nfsNumber: string,
        ) => {
            if (!nfsNumber) return;

            const fullInvoice = await invoiceContext.getInvoiceById(
                targetInvoice.id,
            );

            await invoiceContext.updateInvoice(targetInvoice.id, {
                ...fullInvoice.data,
                nfs_number: nfsNumber,
            });
        };

        const extractAuthorizationErrorMessage = (res: any) => {
            const status = res?.resultado?.status || res?.resultado?.Status;
            const firstErrorMessage = res?.resultado?.erros?.[0]?.mensagem;

            if (String(status) === "erro_autorizacao" && firstErrorMessage) {
                return String(firstErrorMessage);
            }

            return null;
        };
        try {
            const result: any = await tryConsultar(protocolo_lote);
            const info = extractInvoiceInfoFromResponse(result, invoice);
            const authorizationErrorMessage =
                extractAuthorizationErrorMessage(result);
            const remoteStatus = info.status;
            const remoteUrl = info.url;
            const remoteNumero = info.numero;
            const statusLocal = normalizeInvoiceStatus(remoteStatus, remoteUrl);

            setListInvoices((prev) =>
                prev.map((rps) =>
                    rps.id === invoice.id
                        ? {
                              ...rps,
                              status: statusLocal,
                              url_danfse: remoteUrl ?? rps.url_danfse,
                              nfs_number:
                                  isAuthorizedStatus(remoteStatus) &&
                                  remoteNumero
                                      ? remoteNumero
                                      : rps.nfs_number,
                          }
                        : rps,
                ),
            );

            if (isAuthorizedStatus(remoteStatus) && remoteNumero) {
                await persistNfsNumber(invoice, remoteNumero);
            }

            const toastStatus = remoteStatus ?? statusLocal;
            toast.info(`Status atualizado: ${toastStatus}`);
            if (authorizationErrorMessage) {
                toast.error(authorizationErrorMessage);
            }
            if (isAuthorizedStatus(remoteStatus)) {
                toast.success(`NFSe finalizada com status: ${remoteStatus}`);
            }
        } catch (err: any) {
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
                    const info2 = extractInvoiceInfoFromResponse(
                        result2,
                        invoice,
                    );
                    const authorizationErrorMessage2 =
                        extractAuthorizationErrorMessage(result2);
                    const remoteStatus2 = info2.status;
                    const remoteUrl2 = info2.url;
                    const remoteNumero2 = info2.numero;
                    const statusLocal2 = normalizeInvoiceStatus(
                        remoteStatus2,
                        remoteUrl2,
                    );

                    setListInvoices((prev) =>
                        prev.map((rps) =>
                            rps.id === invoice.id
                                ? {
                                      ...rps,
                                      status: statusLocal2,
                                      url_danfse: remoteUrl2 ?? rps.url_danfse,
                                      nfs_number:
                                          isAuthorizedStatus(remoteStatus2) &&
                                          remoteNumero2
                                              ? remoteNumero2
                                              : rps.nfs_number,
                                  }
                                : rps,
                        ),
                    );

                    if (isAuthorizedStatus(remoteStatus2) && remoteNumero2) {
                        await persistNfsNumber(invoice, remoteNumero2);
                    }

                    toast.info(
                        `Status atualizado (tentativa alternativa): ${remoteStatus2 ?? statusLocal2}`,
                    );
                    if (authorizationErrorMessage2) {
                        toast.error(authorizationErrorMessage2);
                    }
                    if (
                        [
                            "autorizada",
                            "cancelada",
                            "erro_autorizacao",
                        ].includes(statusLocal2)
                    ) {
                        toast.success(
                            `NFSe finalizada com status: ${remoteStatus2 ?? statusLocal2}`,
                        );
                    }
                } catch (err2: any) {
                    const is404b =
                        err2?.response?.status === 404 ||
                        (err2?.message && String(err2.message).includes("404"));
                    if (is404b) {
                        setListInvoices((prev) =>
                            prev.map((rps) =>
                                rps.id === invoice.id
                                    ? {
                                          ...rps,
                                          status: "processando_autorizacao",
                                      }
                                    : rps,
                            ),
                        );
                        toast.info(
                            "NFSe não encontrada na FocusNFE (tentativas esgotadas). Aguarde alguns minutos.",
                        );
                    } else {
                        const errorMsg =
                            err2 instanceof Error
                                ? err2.message
                                : "Erro desconhecido";
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
                {row?.url_danfse ? (
                    <Tooltip title="Baixar NFSe">
                        <span>
                            <IconButton
                                component="a"
                                href={row.url_danfse}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: "#E7B10A", marginRight: 3 }}
                                size="medium"
                            >
                                <FaFilePdf />
                            </IconButton>
                        </span>
                    </Tooltip>
                ) : null}
                {row?.url_danfse ? (
                    <Tooltip title="Baixar XML">
                        <span>
                            <IconButton
                                onClick={async () => {
                                    try {
                                        // Se o XML já vier no objeto, usa direto; senão busca por id
                                        let xmlContent = row.xml_nfse;
                                        if (!xmlContent) {
                                            const resp =
                                                await invoiceContext.getInvoiceById(
                                                    row.id,
                                                );
                                            xmlContent = resp?.data?.xml_nfse;
                                        }
                                        if (!xmlContent) {
                                            toast.error(
                                                "XML não disponível para download.",
                                            );
                                            return;
                                        }

                                        const blob = new Blob([xmlContent], {
                                            type: "application/xml;charset=utf-8",
                                        });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `nfse_${row.rps_number || row.id}.xml`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    } catch (err: any) {
                                        const errorMsg =
                                            err instanceof Error
                                                ? err.message
                                                : "Erro desconhecido";
                                        toast.error(
                                            `Falha ao baixar XML: ${errorMsg}`,
                                        );
                                    }
                                }}
                                sx={{ color: "#1976d2", marginRight: 3 }}
                                size="medium"
                            >
                                <BsFiletypeXml />
                            </IconButton>
                        </span>
                    </Tooltip>
                ) : null}
                <CustomButton
                    $variant={"success"}
                    width="80px"
                    onClick={() => handleResult(row)}
                    disabled={isAuthorizedStatus(row?.status)}
                >
                    Atualizar
                </CustomButton>
                <CustomButton
                    $variant={"primary"}
                    width="80px"
                    onClick={() => handleEditInvoice(row)}
                    disabled={Boolean(row?.nfs_number)}
                >
                    Editar
                </CustomButton>
                <CustomButton
                    $variant={"danger"}
                    width="80px"
                    onClick={() => handleOpenDeleteInvoiceModal(row)}
                    disabled={Boolean(row?.nfs_number)}
                >
                    Deletar
                </CustomButton>
            </SButtonContainer>
        ),
        [handleEditInvoice, handleOpenDeleteInvoiceModal, handleResult],
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
                        disabled={
                            isLoadingRPS ||
                            !selectedInvoice ||
                            selectedInvoice.length === 0 ||
                            hasAuthorizedSelectedInvoice
                        }
                    >
                        {isLoadingRPS ? "Enviando..." : "Emitir NFSe"}
                    </CustomButton>
                    <CustomButton
                        $variant="success"
                        width="220px"
                        onClick={handleCancelNFSe}
                        disabled={true}
                    >
                        Cancelar NFSe
                    </CustomButton>

                    <CustomButton
                        $variant="success"
                        width="220px"
                        onClick={handleGeraNF_XML}
                        disabled={selectedInvoicesForActions.length !== 1}
                    >
                        Gerar Arquivo XML
                    </CustomButton>
                </SContainerSearchAndButton>
                <SCardInfo>
                    <CustomTable
                        hasCheckbox
                        multiSelect
                        data={dataFilteredBySearch}
                        columns={[
                            { header: "Status", field: "status" },
                            { header: "Nº RPS", field: "rps_number" },
                            { header: "NFS", field: "nfs_number" },
                            {
                                header: "Data Emissão",
                                field: "rps_emission_date",
                            },
                            { header: "Contrato", field: "service_code" },
                            { header: "Tomador", field: "name" },
                            { header: "Valor", field: "service_value" },
                        ]}
                        isLoading={isLoadingRPS}
                        hasPagination={true}
                        actionButtons={renderActionButtons}
                        onSelectionChange={(selectedRows) => {
                            const normalizedRows =
                                normalizeSelectedInvoices(selectedRows);

                            if (normalizedRows.length > 0) {
                                setSelectedInvoice(normalizedRows);
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
            <ModalDelete
                open={isDeleteInvoiceModal}
                onClose={handleCloseDeleteInvoiceModal}
                onConfirm={handleDeleteInvoice}
                content={modalContent}
            />
        </SContainer>
    );
}
