import { /*useEffect,*/ useState } from "react";
import { SBox, SContainer } from "./styles";

//import { useLocation } from "react-router-dom";
//import { IContractData } from "../../../../../../contexts/ContractContext/types";
import { FormularioNF } from "../../../../../../components/FormularioNF";
import { toast } from "react-toastify";

export function Invoice(): JSX.Element {
    //const location = useLocation();
    //const [dataClient, setDataClient] = useState<IContractData | null>(null);

    // useEffect(() => {
    //     const contractForView: IContractData = location.state?.contractForView;
    //     setDataClient(contractForView);
    // }, [location]);

    // interface WDEmpresa {
    //     status: "OK";
    //     ultima_atualizacao: "2019-08-24T14:15:22Z";
    //     cnpj: "string";
    //     tipo: "MATRIZ";
    //     porte: "string";
    //     nome: "string";
    //     fantasia: "string";
    //     abertura: "string";
    //     atividade_principal: [
    //         {
    //             code: "string";
    //             text: "string";
    //         }
    //     ];
    //     atividades_secundarias: [
    //         {
    //             code: "string";
    //             text: "string";
    //         }
    //     ];
    //     natureza_juridica: "string";
    //     logradouro: "string";
    //     numero: "string";
    //     complemento: "string";
    //     cep: "string";
    //     bairro: "string";
    //     municipio: "string";
    //     uf: "string";
    //     email: "string";
    //     telefone: "string";
    //     efr: "string";
    //     situacao: "string";
    //     data_situacao: "string";
    //     motivo_situacao: "string";
    //     situacao_especial: "string";
    //     data_situacao_especial: "string";
    //     capital_social: "string";
    //     qsa: [
    //         {
    //             nome: "string";
    //             qual: "string";
    //             pais_origem: "string";
    //             nome_rep_legal: "string";
    //             qual_rep_legal: "string";
    //         }
    //     ];
    //     simples: {
    //         optante: true;
    //         data_opcao: "2019-08-24T14:15:22Z";
    //         data_exclusao: "2019-08-24T14:15:22Z";
    //         ultima_atualizacao: "2019-08-24T14:15:22Z";
    //     };
    //     simei: {
    //         optante: true;
    //         data_opcao: "2019-08-24T14:15:22Z";
    //         data_exclusao: "2019-08-24T14:15:22Z";
    //         ultima_atualizacao: "2019-08-24T14:15:22Z";
    //     };
    //     billing: {
    //         free: true;
    //         database: true;
    //     };
    // }

    const [formData, setFormData] = useState({
        numeroRps: "00001",
        dataEmissao: "21/08/2025",
        codigoServico: "06009",
        aliquota: "5,00",
        cpfCnpj: "",
        razaoSocial: "",
        endereco: "",
        numeroEndereco: "",
        bairro: "",
        cidade: "",
        uf: "",
        cep: "",
        email: "",
        discriminacao: "",
        valorServicos: "",
        nomeAjuste1: "",
        valorAjuste1: "",
        nomeAjuste2: "",
        valorAjuste2: "",
        valorIR: "",
        valorLiquido: "",
        valorDeducao: "",
    });

    const checkCNPJ = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("CNPJ a consultar", e.target.value);
        const cnpj = e.target.value.replace(/\D/g, "");
        fetch(
            "https://receitaws.com.br/v1/cnpj/" +
                cnpj.replace(".", "").replace("/", "").replace("-", "")
        )
            .then((res) => res.json())
            .then((data) => {
                // const dadosEmpresaAPI = {
                //     address: data.cnpj,
                //     district: data.bairro,
                //     city: data.localidade,
                //     state: data.uf,
                // };
                // setFormData({ ...formData, ...dadosEndereco });
                console.log(data);
            });
    };

    const handleCreate = async () => {
        if (!formData.numeroRps) {
            toast.error("Por favor, preencha todos os campos.");
            return;
        }
        try {
            const newRPS = formData;
            // const newRPS = await rpsContext.createCliente({
            //     numeroRps: formData.numeroRps,
            //     dataEmissao: formData.dataEmissao,
            //     codigoServico: formData.codigoServico,
            //     aliquota: formData.aliquota,
            //     cpfCnpj: formData.cpfCnpj,
            //     razaoSocial: formData.razaoSocial,
            //     endereco: formData.endereco,
            //     numeroEndereco: formData.numeroEndereco,
            //     bairro: formData.bairro,
            //     cidade: formData.cidade,
            //     uf: formData.uf,
            //     cep: formData.cep,
            //     email: formData.email,
            //     discriminacao: formData.discriminacao,
            //     valorServicos: formData.valorServicos,
            //     nomeAjuste1: formData.nomeAjuste1,
            //     valorAjuste1: formData.valorAjuste1,
            //     nomeAjuste2: formData.nomeAjuste2,
            //     valorIR: formData.valorIR,
            //     valorLiquido: formData.valorLiquido,
            //     valorDeducao: formData.valorDeducao,
            // });
            toast.success(
                `RPS ${formData.numeroRps}, foi gravada com sucesso!`
            );
            //navigate("/clientes");
            // handleClean();
            return newRPS;
        } catch (error) {
            toast.error(`Erro ao tentar criar a RPS, ${error}`);
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
