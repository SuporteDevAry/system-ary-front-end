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
    // Substitui caracteres que quebram o XML pelas entidades correspondentes
    return unsafe.replace(/[<>&"]/g, function (c) {
        switch (c) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case '"':
                return "&quot;";
            default:
                return c;
        }
    });
};

export function Invoice() {
    const invoiceContext = InvoiceContext();
    const [searchTerm, setSearchTerm] = useState("");

    const [listInvoices, setListInvoices] = useState<IListInvoices[]>([]);
    const [isLoadingRPS, setIsLoadingRPS] = useState<boolean>(true);
    const [pageRPS, setPageRPS] = useState(0);
    const [orderRPS, setOrderRPS] = useState<"asc" | "desc">("desc");
    const [orderByRPS, setOrderByRPS] = useState<string>("rps_number");

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

    // ===============================
    // GERAÇÃO DO XML ABRASF / PMSP
    // ===============================

    const gerarXML = () => {
        const rpsList = listInvoices;

        const totalServicos = rpsList.reduce(
            (sum, rps) => sum + Number(rps.service_value || 0),
            0
        );

        const totalDeducoes = rpsList.reduce(
            (sum, rps) => sum + Number(rps.deduction_value || 0),
            0
        );

        const dataInicio = dayjs().format("YYYY-MM-DD");
        const dataFim = dataInicio;

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<PedidoEnvioRPS xmlns="http://www.prefeitura.sp.gov.br/nfe">
  <Cabecalho Versao="2">
    <CPFCNPJRemetente>
      <CNPJ>${PRESTADOR.CNPJ}</CNPJ>
    </CPFCNPJRemetente>
    <transacao>true</transacao>
    <dtInicio>${dataInicio}</dtInicio>
    <dtFim>${dataFim}</dtFim>
    <QtdRPS>${rpsList.length}</QtdRPS>
    <ValorTotalServicos>${totalServicos.toFixed(2)}</ValorTotalServicos>
    <ValorTotalDeducoes>${totalDeducoes.toFixed(2)}</ValorTotalDeducoes>
  </Cabecalho>
`;

        rpsList.forEach((rps) => {
            const discriminacao = escapeXml(
                rps.service_discrim.replace(/(\r\n|\n|\r)/g, " ")
            );

            const valorServico = Number(rps.service_value || 0).toFixed(2);
            const valorDeducao = Number(rps.deduction_value || 0).toFixed(2);

            xml += `
 <RPS Id="RPS${rps.rps_number}">
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

    <Servico>
      <Valores>
        <ValorServicos>${valorServico}</ValorServicos>
        <ValorDeducoes>${valorDeducao}</ValorDeducoes>
      </Valores>
      <ItemListaServico>${escapeXml(rps.service_code)}</ItemListaServico>
      <Discriminacao>${discriminacao}</Discriminacao>
      <CodigoMunicipio>${PRESTADOR.MUNICIPIO}</CodigoMunicipio>
    </Servico>

    <Prestador>
      <CPFCNPJ>
        <CNPJ>${PRESTADOR.CNPJ}</CNPJ>
      </CPFCNPJ>
      <InscricaoMunicipal>${PRESTADOR.IM}</InscricaoMunicipal>
    </Prestador>

    <Tomador>
      <IdentificacaoTomador>
        <CPFCNPJ>
          ${
              rps.cpf_cnpj.length === 14
                  ? `<CNPJ>${rps.cpf_cnpj}</CNPJ>`
                  : `<CPF>${rps.cpf_cnpj}</CPF>`
          }
        </CPFCNPJ>
      </IdentificacaoTomador>

      <RazaoSocial>${escapeXml(rps.name)}</RazaoSocial>

      <Endereco>
        <Endereco>${escapeXml(rps.address)}</Endereco>
        <Numero>${escapeXml(rps.number)}</Numero>
        <Complemento>${escapeXml(rps.complement || "")}</Complemento>
        <Bairro>${escapeXml(rps.district)}</Bairro>
        <CodigoMunicipio>${escapeXml(rps.city)}</CodigoMunicipio>
        <UF>${escapeXml(rps.state)}</UF>
        <CEP>${rps.zip_code.replace(/\D/g, "")}</CEP>
      </Endereco>

      <Contato>
        <Email>${escapeXml(rps.email)}</Email>
      </Contato>
    </Tomador>
  </RPS>
`;
        });

        xml += `
</PedidoEnvioRPS>`;

        return xml;
    };

    // ===================================
    // SALVAR XML EM ARQUIVO PARA DOWNLOAD
    // ===================================
    const handleGeraNF_XML = () => {
        if (listInvoices.length === 0) {
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
        if (listInvoices.length === 0) {
            toast.error("Nenhuma RPS encontrada para enviar.");
            return;
        }

        const xml = gerarXML(); // assume que gerarXML() retorna o XML bruto não-assinado

        try {
            setIsLoadingRPS(true);
            const resp = await fetch("http://localhost:3033/api/issue-full", {
                method: "POST",
                headers: { "Content-Type": "application/xml" },
                body: xml,
            });
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
                <STitle>Emissão de RPS</STitle>
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
