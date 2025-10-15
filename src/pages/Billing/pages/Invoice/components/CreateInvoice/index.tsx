import { useCallback, useEffect, useState } from "react";
import { SBox, SContainer } from "./styles";
import { useLocation, useNavigate } from "react-router-dom";
import { FormularioNF } from "../../../../../../components/FormularioNF";
import { toast } from "react-toastify";
import { ClienteContext } from "../../../../../../contexts/ClienteContext";
import { InvoiceContext } from "../../../../../../contexts/InvoiceContext";
import dayjs from "dayjs";

export function CreateInvoice(): JSX.Element {
    const navigate = useNavigate();
    const invoiceContext = InvoiceContext();
    const location = useLocation();
    const currentDate = dayjs().format("DD/MM/YYYY");
    const [cnpjContract, setCnpjContract] = useState("");
    const [cnpjFound, setCnpjFound] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        rps_number: "",
        rps_emission_date: currentDate,
        nfs_number: "",
        nfs_emission_date: "",
        service_code: "",
        aliquot: 0,
        cpf_cnpj: "",
        name: "",
        address: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
        zip_code: "",
        email: "",
        service_discrim: "",
        service_value: 0,
        name_adjust1: "",
        value_adjust1: 0,
        name_adjust2: "",
        value_adjust2: 0,
        irrf_value: 0,
        service_liquid_value: 0,
        deduction_value: 0,
    });

    const clienteContext = ClienteContext();

    const fetchData = useCallback(async () => {
        const cnpj =
            location.state?.selectedContract.seller.account[0].cnpj_pagto.replace(
                /\.|-|\//g,
                ""
            );

        setCnpjContract(cnpj);

        setFormData((prev) => ({
            ...prev,
            cpf_cnpj: cnpj,
        }));

        const nextNumberRps = await invoiceContext.getNextNumberRps();
        setFormData((prev) => ({
            ...prev,
            rps_number: nextNumberRps.data.nextNumber,
        }));

        try {
            const response = await clienteContext.getClientByCnpj_cpf(cnpj);

            if (response.status == "200") {
                setFormData((prev) => ({
                    ...prev,
                    cpf_cnpj: cnpj,
                    name: response.data.name || "",
                    address: response.data.address || "",
                    number: response.data.number || "",
                    district: response.data.district || "",
                    city: response.data.city || "",
                    state: response.data.state || "",
                    zip_code: response.data.zip_code || "",
                }));
            }
        } catch (error) {
            setCnpjFound(false);
            setFormData((prev) => ({
                ...prev,
                cpf_cnpj: cnpj,
            }));
        }
    }, [location.state?.selectedContract.seller.account, cnpjContract]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const larguraValor = 15; // largura da coluna dos valores
        const colunaTotal = 40; // posição onde o valor deve começar

        // Função para gerar a linha com pontos dinâmicos
        function formatLinha(nome: string, valor: number | string) {
            const valorStr = Number(valor)
                .toFixed(2)
                .padStart(larguraValor, " ");
            const pontosQtd = colunaTotal - nome.length - valorStr.length;
            const pontos = ".".repeat(pontosQtd > 0 ? pontosQtd : 0);
            return `${nome}${pontos} R$ ${valorStr}`;
        }

        // Linhas principais
        const linhaTotalServicos = formatLinha(
            "TOTAL DOS SERVIÇOS",
            formData.service_value
        );
        const linhaIRRF = formatLinha("(-) I.R.R.F.", formData.irrf_value);
        const linhaAjuste1 =
            formData.name_adjust1.length > 0
                ? formatLinha(formData.name_adjust1, formData.value_adjust1)
                : "";
        const linhaTotalPago = formatLinha(
            "VALOR A SER PAGO",
            formData.service_liquid_value
        );

        const nickSeller = location.state?.selectedContract.seller.nickname
            ? location.state?.selectedContract.seller.nickname
            : location.state?.selectedContract.seller.name;
        const nickBuyer = location.state?.selectedContract.buyer.nickname
            ? location.state?.selectedContract.buyer.nickname
            : location.state?.selectedContract.buyer.name;

        const dadosContrato = {
            service_discrim: `Intermediação de Negócios:

CTR. ${location.state?.selectedContract.number_contract}
${nickSeller}/${nickBuyer}
${location.state?.selectedContract.quantity} ${location.state?.selectedContract.type_quantity}

${linhaTotalServicos}
${linhaIRRF}
${linhaAjuste1}
${linhaTotalPago}


Depositar no Banco Bradesco S.A. (237)       Ag. 0108-2       C/C. 132.362-8`,
        };

        setFormData({ ...formData, ...dadosContrato });
    }, [
        formData.service_value,
        formData.irrf_value,
        formData.name_adjust1,
        formData.value_adjust1,
        formData.service_liquid_value,
    ]);

    const checkCNPJ = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (cnpjFound) return;

        const cnpj = e.target.value
            .replace(/\D/g, "")
            .replace(".", "")
            .replace("/", "")
            .replace("-", "");

        //fetch(`${process.env.REACT_APP_URL_CNPJ}/${cnpj}`)
        fetch(` /api-cnpj/cnpj/${cnpj}`)
            .then((res) => res.json())
            .then((data) => {
                setFormData((prev) => ({
                    ...prev,
                    name: data.nome || "",
                    address: data.logradouro || "",
                    number: data.numero || "",
                    district: data.bairro || "",
                    city: data.municipio || "",
                    state: data.uf || "",
                    zip_code: data.cep || "",
                }));
            });
    };

    const handleCreate = async () => {
        try {
            const newRPS = await invoiceContext.createInvoice({
                ...formData,
                service_code: location.state?.selectedContract.number_contract,
            });
            toast.success(
                `RPS ${formData.rps_number} foi gravada com sucesso!`
            );
            navigate("/cobranca/notafiscal");
            return newRPS;
        } catch (error: any) {
            console.error(error);
            toast.error(
                `Erro ao tentar criar a RPS: ${error.message || String(error)}`
            );
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    return (
        <>
            <SContainer>
                <SBox>
                    <FormularioNF
                        titleText={"Preenchimento de RPS"}
                        data={formData}
                        onHandleCreate={handleCreate}
                        onChange={handleChange}
                        onCheckCNPJ={checkCNPJ}
                    />
                </SBox>
            </SContainer>
        </>
    );
}
