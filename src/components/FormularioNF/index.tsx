import {
    BoxContainer,
    SBox,
    SCardInfo,
    SCustomTextArea,
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
import CustomDatePicker from "../CustomDatePicker";

export function FormularioNF({
    titleText,
    data,
    onChange,
    onHandleCreate,
    onCheckCNPJ,
}: IFormNFProps) {
    const navigate = useNavigate();

    const formData = data;

    const contractFields = [
        { label: "Razão Social", value: formData?.name, cols: 3 },
        { label: "Endereço", value: formData?.address, cols: 2 },
        { label: "Número", value: formData?.number, cols: 1 },
        { label: "Bairro", value: formData?.district, cols: 3 },
        { label: "Cidade", value: formData?.city, cols: 1 },
        { label: "UF", value: formData?.state, cols: 1 },
        { label: "CEP", value: formData?.zip_code, cols: 1 },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        return { ...formData, service_discrim: e.target.value };
    };

    const handleDateChange = (newDate: string) => {
        return { ...formData, rps_emission_date: newDate };
    };

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
                    label="CPF/CNPJ Tomador:"
                    $labelPosition="top"
                    name="cpf_cnpj"
                    width="90%"
                    value={formData.cpf_cnpj}
                    onBlur={onCheckCNPJ}
                    onChange={onChange}
                />
                {/* <CustomInput
                    type="text"
                    label="Número RPS:"
                    $labelPosition="top"
                    name="rps_number"
                    width="90%"
                    value={formData.rps_number}
                    onChange={onChange}
                    readOnly
                /> */}
                <CustomDatePicker
                    type="text"
                    label="Data Emissão:"
                    $labelPosition="top"
                    name="rps_emission_date"
                    width="70%"
                    value={formData.rps_emission_date}
                    onChange={handleDateChange}
                />
                {/* <CustomInput
                    type="text"
                    label="Cód.Serviço:"
                    $labelPosition="top"
                    name="codigoServico"
                    width="70%"
                    value={formData.codigoServico}
                    onChange={onChange}
                    readOnly
                />
                <CustomInput
                    type="text"
                    label="Alíquota ISS:"
                    $labelPosition="top"
                    name="aliquota"
                    width="70%"
                    value={formData.aliquota}
                    onChange={onChange}
                    readOnly
                /> */}
            </div>
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
                    type="number"
                    label="Valor Serviços:"
                    $labelPosition="top"
                    name="service_value"
                    width="100%"
                    value={formData.service_value}
                    onChange={onChange}
                />
                <CustomInput
                    type="number"
                    label="Valor I.R.R.F:"
                    $labelPosition="top"
                    name="irrf_value"
                    width="100%"
                    value={formData.irrf_value}
                    onChange={onChange}
                />
                {/* <CustomInput
                    type="number"
                    label="Valor Dedução:"
                    $labelPosition="top"
                    name="valorDeducao"
                    width="100%"
                    value={formData.valorDeducao}
                    onChange={onChange}
                    readOnly
                /> */}
                <CustomInput
                    type="number"
                    label="Valor Líquido:"
                    $labelPosition="top"
                    name="service_liquid_value"
                    width="100%"
                    value={formData.service_liquid_value}
                    onChange={onChange}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "flex-start",
                }}
            >
                <CustomInput
                    type="text"
                    label="Descrição Ajuste:"
                    $labelPosition="top"
                    name="name_adjust1"
                    width="100%"
                    value={formData.name_adjust1}
                    onChange={onChange}
                />
                <CustomInput
                    type="number"
                    label="Valor Ajuste:"
                    $labelPosition="top"
                    name="value_adjust1"
                    width="100%"
                    value={formData.value_adjust1}
                    onChange={onChange}
                />
            </div>
            <SCustomTextArea
                width="100%"
                height="220px"
                label="Discriminação dos serviços:"
                name="service_discrim"
                value={formData.service_discrim}
                onChange={handleChange}
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
