import { useCallback, useEffect, useMemo, useState } from "react";
import CustomButton from "../../../../components/CustomButton";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import { IColumn } from "../../../../components/CustomTable/types";
import { ContractContext } from "../../../../contexts/ContractContext";
import { toast } from "react-toastify";
import { IContractData } from "../../../../contexts/ContractContext/types";
import { useNavigate } from "react-router-dom";
import useTableSearch from "../../../../hooks/useTableSearch";

export function Invoice() {
    const contractContext = ContractContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [listcontracts, setListContracts] = useState<IContractData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("payment_date");

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await contractContext.listContracts();

            const filteredContracts = response.data.filter(
                (contract: { status: { status_current: string } }) =>
                    contract.status.status_current === "COBRANCA"
            );

            setListContracts(filteredContracts);
        } catch (error) {
            toast.error(
                `Erro ao tentar ler contratos, contacte o administrador do sistema: ${error}`
            );
        } finally {
            setIsLoading(false);
        }
    }, [contractContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const { filteredData, handleSearch } = useTableSearch({
        data: listcontracts,
        searchTerm,
        searchableFields: ["number_contract", "seller.name"],
    });

    useEffect(() => {
        handleSearch();
    }, [searchTerm, handleSearch]);

    // const handleViewContract = (contract: IContractData) => {
    //     navigate("/cobranca/dados-nf", {
    //         state: { contractForView: contract },
    //     });
    // };

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "status.status_current",
                header: "Status",
                width: "90px",
                sortable: true,
            },
            {
                field: "number_contract",
                header: "Nº Contrato",
                width: "160px",
                sortable: true,
            },
            {
                field: "contract_emission_date",
                header: "Dt.Emissão",
                width: "50px",
                sortable: true,
            },
            {
                field: "seller.name",
                header: "Vendedor",
                width: "160px",
                sortable: true,
            },
            // {
            //     field: "buyer.name",
            //     header: "Comprador",
            //     width: "150px",
            //     sortable: true,
            // },
            {
                field: "payment_date",
                header: "Dt.Pagto",
                width: "150px",
                sortable: true,
            },
            {
                field: "rpsGerada",
                header: "Nr.RPS",
                width: "150px",
                sortable: true,
            },
            // {
            //     field: "price",
            //     header: "PREÇO",
            //     width: "150px",
            // },
            // {
            //     field: "type_commission_seller",
            //     header: "T",
            //     width: "20px",
            // },
            // {
            //     field: "commission_seller",
            //     header: "COMISSÃO",
            //     width: "100px",
            // },
        ],
        []
    );

    // const renderActionButtons = (row: any) => (
    //     <CustomButton
    //         $variant="secondary"
    //         width="75px"
    //         onClick={() => handleViewContract(row)}
    //     >
    //         Emitir NF{" "}
    //     </CustomButton>
    // );

    interface EmissorData {
        inscricaoMunicipal: string;
        dataInicial: string;
        dataFinal: string;
    }
    interface RPSData {
        tipoRps: string;
        serieRps: string;
        numeroRps: string;
        dataEmissao: string;
        situacaoRps: string;
        valorServicos: string;
        valorDeducao: string;
        codigoServico: string;
        aliquota: string;
        issRetido: string;
        indicaTomador: string;
        cpfCnpjTomador: string;
        insMunTomador: string;
        insEstTomador: string;
        razaoSocialTomador: string;
        enderecoTomador: string;
        numeroEnderecoTomador: string;
        complEnderecoTomador: string;
        bairroTomador: string;
        cidadeTomador: string;
        ufTomador: string;
        cepTomador: string;
        emailTomador: string;
        discriminacao: string;
    }

    const mockEmissor: EmissorData[] = [
        {
            inscricaoMunicipal: "12345678",
            dataInicial: "20250801",
            dataFinal: "20250831",
        },
    ];

    const mockRPSList: RPSData[] = [
        {
            tipoRps: "RPS",
            serieRps: "A",
            numeroRps: "1001",
            dataEmissao: "2025-08-16",
            situacaoRps: "T", // Tributado em SP
            codigoServico: "06009",
            valorServicos: "2500.00",
            valorDeducao: "0.00",
            aliquota: "0500",
            issRetido: "2", // Sem ISS retido
            indicaTomador: "2", // 1-CPF 2-CNPJ 3 CPF nao informado
            cpfCnpjTomador: "12345678000199",
            insMunTomador: "00000000",
            insEstTomador: "000000000000",
            razaoSocialTomador: "Empresa Alpha Ltda",
            enderecoTomador: "Av. Paulista",
            numeroEnderecoTomador: "1000",
            complEnderecoTomador: "",
            bairroTomador: "Bela Vista",
            cidadeTomador: "São Paulo",
            ufTomador: "SP",
            cepTomador: "01310-100",
            emailTomador: "alpha@empresa.com",
            discriminacao:
                "Intermediação de Negócios:|||CONTRATO: O.1-999/25|COMPRADOR / VENDEDOR|74 TONS - OLEO|||TOTAL DOS SERVICOS ...R$   15.000.00|(-) I.R.R.F.  ........R$       0.00|VALOR A SER PAGO .....R$   15.000.00|||Depositar no Banco Inter (077) Ag.0001  C/C.nro. 1.234-5",
        },
        {
            tipoRps: "RPS",
            serieRps: "A",
            numeroRps: "1002",
            dataEmissao: "2025-08-16",
            situacaoRps: "C", // Cancelado
            codigoServico: "06009",
            valorServicos: "2500.00",
            valorDeducao: "0.00",
            aliquota: "0500",
            issRetido: "2",
            indicaTomador: "2",
            cpfCnpjTomador: "12345678000199",
            insMunTomador: "00000000",
            insEstTomador: "000000000000",
            razaoSocialTomador: "Empresa Alpha Ltda",
            enderecoTomador: "Av. Paulista",
            numeroEnderecoTomador: "1000",
            complEnderecoTomador: "",
            bairroTomador: "Bela Vista",
            cidadeTomador: "São Paulo",
            ufTomador: "SP",
            cepTomador: "01310-100",
            emailTomador: "alpha@empresa.com",
            discriminacao:
                "Intermediação de Negócios:|||CONTRATO: O.1-999/25|COMPRADOR / VENDEDOR|74 TONS - OLEO|||TOTAL DOS SERVICOS ...R$   15.000.00|(-) I.R.R.F.  ........R$       0.00|VALOR A SER PAGO .....R$   15.000.00|||Depositar no Banco Inter (077) Ag.0001  C/C.nro. 1.234-5",
        },
        {
            tipoRps: "RPS",
            serieRps: "A",
            numeroRps: "1003",
            dataEmissao: "2025-08-15",
            situacaoRps: "T",
            codigoServico: "06009",
            valorServicos: "1800.00",
            valorDeducao: "0.00",
            aliquota: "0500",
            issRetido: "2",
            indicaTomador: "2",
            cpfCnpjTomador: "98765432000155",
            insMunTomador: "00000000",
            insEstTomador: "000000000000",
            razaoSocialTomador: "Beta Solutions ME",
            enderecoTomador: "Rua das Flores",
            numeroEnderecoTomador: "200",
            complEnderecoTomador: "",
            bairroTomador: "Centro",
            cidadeTomador: "Rio de Janeiro",
            ufTomador: "RJ",
            cepTomador: "20010-020",
            emailTomador: "contato@betasolutions.com",
            discriminacao:
                "Intermediação de Negócios:|||CONTRATO: O.1-999/25|COMPRADOR / VENDEDOR|74 TONS - OLEO|||TOTAL DOS SERVICOS ...R$   15.000.00|(-) I.R.R.F.  ........R$       0.00|VALOR A SER PAGO .....R$   15.000.00|||Depositar no Banco Inter (077) Ag.0001  C/C.nro. 1.234-5",
        },
        {
            tipoRps: "RPS",
            serieRps: "A",
            numeroRps: "1004",
            dataEmissao: "2025-08-14",
            situacaoRps: "T",
            codigoServico: "06009",
            valorServicos: "3200.00",
            valorDeducao: "0.00",
            aliquota: "0500",
            issRetido: "2",
            indicaTomador: "2",
            cpfCnpjTomador: "11222333000144",
            insMunTomador: "00000000",
            insEstTomador: "000000000000",
            razaoSocialTomador: "Gamma Tech S/A",
            enderecoTomador: "Rua das Palmeiras",
            numeroEnderecoTomador: "300",
            complEnderecoTomador: "",
            bairroTomador: "Jardins",
            cidadeTomador: "Curitiba",
            ufTomador: "PR",
            cepTomador: "80020-300",
            emailTomador: "financeiro@gammatech.com",
            discriminacao:
                "Intermediação de Negócios:|||CONTRATO: O.1-999/25|COMPRADOR / VENDEDOR|74 TONS - OLEO|||TOTAL DOS SERVICOS ...R$   15.000.00|(-) I.R.R.F.  ........R$       0.00|VALOR A SER PAGO .....R$   15.000.00|||Depositar no Banco Inter (077) Ag.0001  C/C.nro. 1.234-5",
        },
        {
            tipoRps: "RPS",
            serieRps: "A",
            numeroRps: "1005",
            dataEmissao: "2025-08-13",
            situacaoRps: "T",
            codigoServico: "06009",
            valorServicos: "5000.00",
            valorDeducao: "0.00",
            aliquota: "0500",
            issRetido: "2",
            indicaTomador: "2",
            cpfCnpjTomador: "22334455000166",
            insMunTomador: "00000000",
            insEstTomador: "000000000000",
            razaoSocialTomador: "Delta Corp LTDA",
            enderecoTomador: "Av. Brasil",
            numeroEnderecoTomador: "400",
            complEnderecoTomador: "",
            bairroTomador: "Savassi",
            cidadeTomador: "Belo Horizonte",
            ufTomador: "MG",
            cepTomador: "30140-070",
            emailTomador: "delta@corp.com",
            discriminacao:
                "Intermediação de Negócios:|||CONTRATO: O.1-999/25|COMPRADOR / VENDEDOR|74 TONS - OLEO|||TOTAL DOS SERVICOS ...R$   15.000.00|(-) I.R.R.F.  ........R$       0.00|VALOR A SER PAGO .....R$   15.000.00|||Depositar no Banco Inter (077) Ag.0001  C/C.nro. 1.234-5",
        },
        {
            tipoRps: "RPS",
            serieRps: "A",
            numeroRps: "1006",
            dataEmissao: "2025-08-12",
            situacaoRps: "T",
            codigoServico: "06009",
            valorServicos: "2700.00",
            valorDeducao: "0.00",
            aliquota: "0500",
            issRetido: "2",
            indicaTomador: "2",
            cpfCnpjTomador: "33445566000177",
            insMunTomador: "00000000",
            insEstTomador: "000000000000",
            razaoSocialTomador: "Epsilon Digital",
            enderecoTomador: "Rua XV de Novembro",
            numeroEnderecoTomador: "500",
            complEnderecoTomador: "",
            bairroTomador: "Centro",
            cidadeTomador: "Porto Alegre",
            ufTomador: "RS",
            cepTomador: "90020-010",
            emailTomador: "suporte@epsilondigital.com",
            discriminacao:
                "Intermediação de Negócios:||CONTRATO: O.1-999/25|COMPRADOR / VENDEDOR|74 TONS - OLEO|||TOTAL DOS SERVICOS ...R$   15.000.00|(-) I.R.R.F.  ........R$       0.00|VALOR A SER PAGO .....R$   15.000.00|||Depositar no Banco Inter (077) Ag.0001  C/C.nro. 1.234-5",
        },
    ];

    const padRight = (value: string, length: number) =>
        (value || "").padEnd(length, " ").substring(0, length);

    const padLeft = (value: string, length: number) =>
        (value || "").padStart(length, "0").substring(0, length);

    const formatDate = (date: Date | string): string => {
        const d = typeof date === "string" ? new Date(date) : date;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}${month}${day}`;
    };

    // Registro tipo 1 - emissor
    const gerarRegistroTipo1 = (emissor: EmissorData): string => {
        return (
            "1" +
            padRight(emissor.inscricaoMunicipal, 14) +
            padRight(emissor.dataInicial, 8) +
            padRight(emissor.dataFinal, 8)
        );
    };

    // Registro tipo 2 - RPS do tomador
    const gerarRegistroTipo2 = (data: RPSData): string => {
        return (
            "2" + // identificador
            padRight(data.tipoRps, 5) +
            padRight(data.serieRps, 5) +
            padLeft(data.numeroRps, 12) +
            formatDate(data.dataEmissao) +
            padRight(data.situacaoRps, 1) +
            padLeft(data.valorServicos.replace(".", ""), 15) +
            padLeft(data.valorDeducao.replace(".", ""), 15) +
            padLeft(data.codigoServico, 5) +
            padLeft(data.aliquota.replace(".", ""), 4) +
            padRight(data.issRetido, 1) +
            padRight(data.indicaTomador, 1) +
            padRight(data.cpfCnpjTomador, 14) +
            padRight(data.insMunTomador, 8) +
            padRight(data.insEstTomador, 12) +
            padRight(data.razaoSocialTomador.toUpperCase(), 75) +
            padRight(data.enderecoTomador.toUpperCase(), 53) +
            padRight(data.numeroEnderecoTomador, 10) +
            padRight(data.complEnderecoTomador, 30) +
            padRight(data.bairroTomador.toUpperCase(), 30) +
            padRight(data.cidadeTomador.toUpperCase(), 50) +
            padRight(data.ufTomador.toUpperCase(), 2) +
            padRight(data.cepTomador.replace("-", ""), 8) +
            padRight(data.emailTomador, 75) +
            padRight(data.discriminacao, 1000)
        );
    };

    // Registro tipo 9 - trailer
    const gerarRegistroTipo9 = (
        qtd: number,
        totalServicos: number,
        totalDeducoes: number
    ): string => {
        return (
            "9" +
            padLeft(qtd.toString(), 7) +
            padLeft(totalServicos.toFixed(2).replace(".", ""), 15) +
            padLeft(totalDeducoes.toFixed(2).replace(".", ""), 15)
        );
    };

    const handleGeraRPS = () => {
        navigate(
            "/cobranca/dados-nf" /*{state: { contractForView: contract},*/
        );
    };

    // Geração do arquivo
    const handleGeraNF = () => {
        const linhas: string[] = [];
        let totalServicos = 0;
        let totalDeducoes = 0;

        linhas.push(gerarRegistroTipo1(mockEmissor[0])); // registro tipo 1
        mockRPSList.forEach((rps) => {
            linhas.push(gerarRegistroTipo2(rps));
            totalServicos += parseFloat(rps.valorServicos || "0");
            totalDeducoes += parseFloat(rps.valorDeducao || "0");
        });
        linhas.push(
            gerarRegistroTipo9(mockRPSList.length, totalServicos, totalDeducoes)
        );

        const conteudo = linhas.join("\r\n");

        const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;

        const data1 = mockEmissor[0].dataInicial;
        const data2 = mockEmissor[0].dataFinal;

        // Nome dinâmico
        const nomeArquivo = `rps_gerada_${data1}_a_${data2}.txt`;

        link.download = nomeArquivo;
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <SContainer>
            <STitle>Emissão de RPS</STitle>

            <SContainerSearchAndButton>
                <CustomSearch
                    width="400px"
                    placeholder="Digite Nº Contrato ou Vendedor"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <CustomButton
                    $variant="success"
                    width="180px"
                    onClick={handleGeraRPS}
                >
                    Gravar RPS
                </CustomButton>
                <CustomButton
                    $variant="success"
                    width="180px"
                    onClick={handleGeraNF}
                >
                    Gerar Arquivo RPS
                </CustomButton>
            </SContainerSearchAndButton>
            <CustomTable
                isLoading={isLoading}
                data={filteredData}
                columns={nameColumns}
                hasPagination
                hasCheckbox
                dateFields={["created_at"]}
                //actionButtons={renderActionButtons}
                maxChars={15}
                page={page}
                setPage={setPage}
                order={order}
                orderBy={orderBy}
                setOrder={setOrder}
                setOrderBy={setOrderBy}
                // onRowClick={(rowData) =>
                //     handleSetContract(rowData.number_contract)
                // }
            />
        </SContainer>
    );
}
