import { useEffect, useState } from "react";
import { SBox, SContainer } from "./styles";
import { useLocation, useNavigate } from "react-router-dom";
import { FormularioNF } from "../../../../../../components/FormularioNF";
import { toast } from "react-toastify";
import { ClienteContext } from "../../../../../../contexts/ClienteContext";
import { InvoiceContext } from "../../../../../../contexts/InvoiceContext";

export function CreateInvoice(): JSX.Element {
    const navigate = useNavigate();
    const invoiceContext = InvoiceContext();
    const location = useLocation();
    const comTimestamp = new Date().toISOString();
    const [cnpjContract, setCnpjContract] = useState("");

    const [formData, setFormData] = useState({
        rps_number: "",
        rps_emission_date: comTimestamp,
        nfs_number: "",
        nfs_emission_date: comTimestamp,
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
    const fetchData = async () => {
        setCnpjContract(
            location.state?.selectedContract.seller.account[0].cnpj_pagto.replace(
                /\.|-|\//g,
                ""
            )
        );

        //if (cnpjContract) return;
        try {
            const response = await clienteContext.getClientByCnpj_cpf(
                cnpjContract
            );

            if (response) {
                formData.name = response.data.name;
                formData.address = response.data.address;
                formData.number = response.data.number;
                formData.district = response.data.district;
                formData.city = response.data.city;
                formData.state = response.data.state;
                formData.zip_code = response.data.zip_code;

                // Atualiza o estado corretamente
                setFormData((prev) => ({
                    ...prev,
                    // cpf_cnpj: cnpjContract || "",
                    // name: response.data.nome || "",
                    // address: response.data.logradouro || "",
                    // number: response.data.numero || "",
                    // district: response.data.bairro || "",
                    // city: response.data.municipio || "",
                    // state: response.data.uf || "",
                    // zip_code: response.data.cep || "",
                }));
            }
        } catch (error) {
            setCnpjContract(
                location.state?.selectedContract.seller.account[0].cnpj_pagto.replace(
                    /\.|-|\//g,
                    ""
                )
            );
            setFormData((prev) => ({
                ...prev,
                cpf_cnpj: cnpjContract || "",
            }));

            // toast.error(
            //     `Erro ao tentar ler clientes, contacte o administrador do sistema ${error}`
            // );
        } finally {
        }
    };

    useEffect(() => {
        fetchData();
    }, [cnpjContract]);

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
            // cpf_cnpj:
            //     location.state?.selectedContract.seller.account[0].cnpj_pagto.replace(
            //         /\.|-|\//g,
            //         ""
            //     ),
            // sellerNickname: location.state?.selectedContract.seller.nickname,
            // buyerNickname: location.state?.selectedContract.buyer.nickname,
            // razaoSocial: location.state?.selectedContract.seller.name,
            // endereco: location.state?.selectedContract.seller.address,
            // numeroEndereco: location.state?.selectedContract.seller.number,
            // bairro: location.state?.selectedContract.seller.district,
            // cidade: location.state?.selectedContract.seller.city,
            // uf: location.state?.selectedContract.seller.state,
            // cep: location.state?.selectedContract.seller.zip_code,
            // email: "",
            // bankName:
            //     location.state?.selectedContract.seller.account[0].bank_name,
            // bankNumber:
            //     location.state?.selectedContract.seller.account[0].bank_number,
            // agency: location.state?.selectedContract.seller.account[0].agency,
            // accountNumber:
            //     location.state?.selectedContract.seller.account[0]
            //         .account_number,
            // name_pagto:
            //     location.state?.selectedContract.seller.account[0].name_pagto,
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

    // const checkCNPJ = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     //console.log("CNPJ a consultar", e.target.value);
    //     const cnpj = e.target.value.replace(/\D/g, "");
    //     fetch(
    //         // "https://receitaws.com.br/v1/cnpj/"
    //         "http://localhost:4000/cnpj/" +
    //             cnpj.replace(".", "").replace("/", "").replace("-", "")
    //     )
    //         .then((res) => res.json())
    //         .then((data) => {
    //             formData.name = data.nome;
    //             formData.address = data.logradouro;
    //             formData.number = data.numero;
    //             formData.district = data.bairro;
    //             formData.city = data.municipio;
    //             formData.state = data.uf;
    //             formData.zip_code = data.cep;
    //         });

    //     //fetchData();
    // };

    const checkCNPJ = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cnpj = e.target.value
            .replace(/\D/g, "")
            .replace(".", "")
            .replace("/", "")
            .replace("-", "");

        fetch(`${process.env.REACT_APP_URL_RECEITAWS}/${cnpj}`)
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

    // const handleCreate = async () => {
    //     if (!formData.rps_number) {
    //         toast.error("Por favor, preencha todos os campos.");
    //         return;
    //     }
    //     try {
    //         const newRPS = await invoiceContext.createInvoice({
    //             rps_number: formData.rps_number,
    //             rps_emission_date: formData.rps_emission_date,
    //             service_code: formData.service_code,
    //             aliquot: formData.aliquot,
    //             cpf_cnpj: formData.cpf_cnpj,
    //             name: formData.name,
    //             address: formData.address,
    //             number: formData.number,
    //             district: formData.district,
    //             city: formData.city,
    //             state: formData.state,
    //             zip_code: formData.zip_code,
    //             email: formData.email,
    //             service_discrim: formData.service_discrim,
    //             service_value: formData.service_value,
    //             name_adjust1: formData.name_adjust1,
    //             value_adjust1: formData.value_adjust1,
    //             irrf_value: formData.irrf_value,
    //             service_liquid_value: formData.service_liquid_value,
    //             deduction_value: formData.deduction_value,
    //         });
    //         toast.success(
    //             `RPS ${formData.rps_number}, foi gravada com sucesso!`
    //         );
    //         //navigate("/clientes");
    //         // handleClean();
    //         return newRPS;
    //     } catch (error) {
    //         toast.error(`Erro ao tentar criar a RPS, ${error}`);
    //     }
    // };

    const handleCreate = async () => {
        try {
            const newRPS = await invoiceContext.createInvoice({ ...formData });
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
