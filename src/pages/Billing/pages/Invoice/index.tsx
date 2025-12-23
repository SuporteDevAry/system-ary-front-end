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

        const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>`;

        const xml =
            `${xmlHeader}
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
 <LoteRps Id="LOTE${Date.now()}" versao="2.04">
  <NumeroLote>${Date.now()}</NumeroLote>
  <CpfCnpj>
    <Cnpj>${PRESTADOR.CNPJ}</Cnpj>
  </CpfCnpj>
  <InscricaoMunicipal>${PRESTADOR.IM}</InscricaoMunicipal>
  <QuantidadeRps>${rpsList.length}</QuantidadeRps>
  <ListaRps>
` +
            rpsList
                .map((rps) => {
                    // Limpa quebras de linha e faz o escape XML na descrição
                    const serviceDiscrimEscaped = escapeXml(
                        rps.service_discrim.replace(/(\r\n|\n|\r)/g, "|")
                    );

                    // CORREÇÃO DO ERRO: Converte para Number e trata valores inválidos/nulos
                    const serviceValueNumber = Number(rps.service_value);
                    const deductionValueNumber = Number(rps.deduction_value);

                    const valorServicos =
                        Number.isNaN(serviceValueNumber) ||
                        rps.service_value === null
                            ? "0.00"
                            : serviceValueNumber.toFixed(2);

                    const valorDeducoes =
                        Number.isNaN(deductionValueNumber) ||
                        rps.deduction_value === null
                            ? "0.00"
                            : deductionValueNumber.toFixed(2);

                    return `
  <Rps>
    <InfRps Id="R${rps.rps_number}">
      <IdentificacaoRps>
        <Numero>${rps.rps_number}</Numero>
        <Serie>${PRESTADOR.SERIE}</Serie>
        <Tipo>1</Tipo>
      </IdentificacaoRps>
      <DataEmissao>${dayjs(rps.rps_emission_date).format(
          "YYYY-MM-DD"
      )}</DataEmissao>
      <NaturezaOperacao>1</NaturezaOperacao>
      <RegimeEspecialTributacao>6</RegimeEspecialTributacao>
      <OptanteSimplesNacional>2</OptanteSimplesNacional>
      <IncentivadorCultural>2</IncentivadorCultural>
      <Status>1</Status>
      <Servico>
        <Valores>
          <ValorServicos>${valorServicos}</ValorServicos>
          <ValorDeducoes>${valorDeducoes}</ValorDeducoes>
        </Valores>
        <ItemListaServico>${escapeXml(rps.service_code)}</ItemListaServico>
        <Discriminacao>${serviceDiscrimEscaped}</Discriminacao>
        <CodigoMunicipio>${PRESTADOR.MUNICIPIO}</CodigoMunicipio>
      </Servico>
      <Prestador>
        <CpfCnpj><Cnpj>${PRESTADOR.CNPJ}</Cnpj></CpfCnpj>
        <InscricaoMunicipal>${PRESTADOR.IM}</InscricaoMunicipal>
      </Prestador>
      <Tomador>
        <IdentificacaoTomador>
          <CpfCnpj>
            ${
                rps.cpf_cnpj.length === 14
                    ? `<Cnpj>${rps.cpf_cnpj}</Cnpj>`
                    : `<Cpf>${rps.cpf_cnpj}</Cpf>`
            }
          </CpfCnpj>
        </IdentificacaoTomador>
        <RazaoSocial>${escapeXml(rps.name)}</RazaoSocial>
        <Endereco>
          <Endereco>${escapeXml(rps.address)}</Endereco>
          <Numero>${escapeXml(rps.number)}</Numero>
          <Complemento>${escapeXml(rps.complement || "")}</Complemento>
          <Bairro>${escapeXml(rps.district)}</Bairro>
          <CodigoMunicipio>${escapeXml(rps.city)}</CodigoMunicipio>
          <Uf>${escapeXml(rps.state)}</Uf>
          <Cep>${rps.zip_code.replace("-", "")}</Cep>
        </Endereco>
        <Contato>
          <Email>${escapeXml(rps.email)}</Email>
        </Contato>
      </Tomador>
    </InfRps>
  </Rps>`;
                })
                .join("\n") +
            `
  </ListaRps>
 </LoteRps>
</EnviarLoteRpsEnvio>`;

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
