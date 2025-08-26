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

    const contractFieldsCol1 = [
        { label: "Razão Social", value: data?.razaoSocial },
        { label: "Endereço", value: data?.endereco },
        { label: "Bairro", value: data?.bairro },
        { label: "UF", value: data?.uf },
        { label: "E-mail", value: data?.email },
    ];
    const column1 = contractFieldsCol1;

    const contractFieldsCol2 = [
        { label: "", valeu: "" },
        { label: "Nro.", value: data?.numeroEndereco },
        { label: "Cidade", value: data?.cidade },
        { label: "CEP", value: data?.cep },
    ];
    const column2 = contractFieldsCol2;

    return (
        <SFormContainer>
            <STitle>{titleText}</STitle>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
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
                />
                <CustomInput
                    type="text"
                    label="Data Emissão:"
                    $labelPosition="top"
                    name="dataEmissao"
                    width="80%"
                    value={data.dataEmissao}
                    onChange={onChange}
                />
                <CustomInput
                    type="text"
                    label="Cód.Serviço:"
                    $labelPosition="top"
                    name="codigoServico"
                    width="70%"
                    value={data.codigoServico}
                    onChange={onChange}
                />
                <CustomInput
                    type="text"
                    label="Alíquota ISS:"
                    $labelPosition="top"
                    name="aliquota"
                    width="70%"
                    value={data.aliquota}
                    onChange={onChange}
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
                            gap: "10px",
                            width: "50%",
                        }}
                    >
                        {column1.map((field, index) => (
                            <SKeyContainer key={index}>
                                <SkeyName>
                                    {field.label}:
                                    <SKeyValue>{field.value}</SKeyValue>
                                </SkeyName>
                            </SKeyContainer>
                        ))}
                    </div>
                    <div
                        style={{
                            gap: "10px",
                            width: "50%",
                        }}
                    >
                        {column2.map((field, index) => (
                            <SKeyContainer key={index}>
                                <SkeyName>
                                    {field.label}:
                                    <SKeyValue>{field.value}</SKeyValue>
                                </SkeyName>
                            </SKeyContainer>
                        ))}
                    </div>
                </SCardInfo>
            </SBox>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
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
