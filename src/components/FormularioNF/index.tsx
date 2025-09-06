import {
    BoxContainer,
    SBox,
    SCardInfo,
    SFormContainer,
    SKeyContainer,
    SkeyName,
    SKeyValue,
    STitle,
} from "./styles";
import { IFormNFProps } from "./types";
import { useNavigate } from "react-router-dom";
import CustomButton from "../CustomButton";
import { CustomInput } from "../CustomInput";
import { CustomTextArea } from "../CustomTextArea";

export function FormularioNF({
    titleText,
    data,
    onChange,
    onHandleCreate,
    onCheckCNPJ,
}: IFormNFProps) {
    const navigate = useNavigate();

    const contractFields = [
        { label: "Razão Social", value: data?.razaoSocial, cols: 3 },
        { label: "Endereço", value: data?.endereco, cols: 2 },
        { label: "Número", value: data?.numeroEndereco, cols: 1 },
        { label: "Bairro", value: data?.bairro, cols: 1 },
        { label: "Cidade", value: data?.cidade, cols: 1 },
        { label: "UF", value: data?.uf, cols: 1 },
        { label: "CEP", value: data?.cep, cols: 1 },
        { label: "E-mail", value: data?.email, cols: 2 },
    ];

    return (
        <SFormContainer>
            <STitle>{titleText}</STitle>

            <div
                style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "flex-start",
                }}
            >
                <CustomInput
                    type="text"
                    label="Número RPS:"
                    $labelPosition="top"
                    name="numeroRps"
                    width="70%"
                    value={data.numeroRps}
                    onChange={onChange}
                    readOnly
                />
                <CustomInput
                    type="text"
                    label="Data Emissão:"
                    $labelPosition="top"
                    name="dataEmissao"
                    width="80%"
                    value={data.dataEmissao}
                    onChange={onChange}
                    readOnly
                />
                <CustomInput
                    type="text"
                    label="Cód.Serviço:"
                    $labelPosition="top"
                    name="codigoServico"
                    width="70%"
                    value={data.codigoServico}
                    onChange={onChange}
                    readOnly
                />
                <CustomInput
                    type="text"
                    label="Alíquota ISS:"
                    $labelPosition="top"
                    name="aliquota"
                    width="70%"
                    value={data.aliquota}
                    onChange={onChange}
                    readOnly
                />
            </div>
            <CustomInput
                type="text"
                label="CPF/CNPJ Tomador:"
                $labelPosition="top"
                name="cpfCnpj"
                width="30%"
                value={data.cpfCnpj}
                onBlur={onCheckCNPJ}
                onChange={onChange}
            />
            <SBox>
                <SCardInfo>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)", // até 3 colunas
                            gap: "5px",
                        }}
                    >
                        {contractFields.map((field, index) => (
                            <div
                                key={index}
                                style={{
                                    gridColumn: `span ${field.cols ?? 1}`, // ocupa 1, 2 ou 3 colunas
                                }}
                            >
                                <SKeyContainer>
                                    <SkeyName>
                                        {field.label}:
                                        <SKeyValue>{field.value}</SKeyValue>
                                    </SkeyName>
                                </SKeyContainer>
                            </div>
                        ))}
                    </div>
                </SCardInfo>
            </SBox>

            <div
                style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "flex-start",
                }}
            >
                <CustomInput
                    type="text"
                    label="Valor Serviços:"
                    $labelPosition="top"
                    name="valorServicos"
                    width="100%"
                    value={data.valorServicos}
                    onChange={onChange}
                />
                <CustomInput
                    type="text"
                    label="Valor I.R.R.F:"
                    $labelPosition="top"
                    name="valorIR"
                    width="100%"
                    value={data.valorIR}
                    onChange={onChange}
                />
                <CustomInput
                    type="text"
                    label="Valor Dedução:"
                    $labelPosition="top"
                    name="valorDeducao"
                    width="100%"
                    value={data.valorDeducao}
                    onChange={onChange}
                    readOnly
                />
                <CustomInput
                    type="text"
                    label="Valor Líquido:"
                    $labelPosition="top"
                    name="valorLiquido"
                    width="100%"
                    value={data.valorLiquido}
                    onChange={onChange}
                />
            </div>
            <CustomTextArea
                label="Discriminação dos serviços:"
                name="discriminacao"
                width="100%"
            />
            <BoxContainer>
                <CustomButton
                    $variant={"primary"}
                    width="80px"
                    onClick={() => navigate("/cobranca/notafiscal")}
                >
                    Cancelar
                </CustomButton>
                <CustomButton
                    $variant={"success"}
                    width="80px"
                    onClick={onHandleCreate}
                >
                    Gravar
                </CustomButton>
            </BoxContainer>
        </SFormContainer>
    );
}
