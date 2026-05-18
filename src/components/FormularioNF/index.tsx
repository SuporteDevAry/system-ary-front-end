import {
    BoxContainer,
    SCustomTextArea,
    SFormContainer,
    STitle,
} from "./styles";
import { IFormNFProps } from "./types";
import { useNavigate } from "react-router-dom";
import CustomButton from "../CustomButton";
import { CustomInput } from "../CustomInput";
import CustomDatePicker from "../CustomDatePicker";
import {
    formatEuropeanDecimal,
    normalizeEuropeanDecimalInput,
    parseEuropeanDecimal,
} from "../../helpers/europeanDecimal";

const monetaryFields = new Set([
    "service_value",
    "irrf_value",
    "value_adjust1",
    "service_liquid_value",
]);

export function FormularioNF({
    titleText,
    data,
    onChange,
    onHandleCreate,
    onCheckCNPJ,
    cpfCnpjAction,
}: IFormNFProps) {
    const navigate = useNavigate();
    const formData = data;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({
            target: {
                name: e.target.name,
                value: e.target.value,
            },
        } as any);
    };

    const handleDateChange = (newDate: string) => {
        onChange({
            target: {
                name: "rps_emission_date",
                value: newDate,
            },
        } as any);
    };

    const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (monetaryFields.has(name)) {
            const normalizedValue = normalizeEuropeanDecimalInput(value);

            onChange({
                target: {
                    name,
                    value: normalizedValue,
                },
            } as any);

            if (
                name === "service_value" ||
                name === "irrf_value" ||
                name === "value_adjust1"
            ) {
                const service = parseEuropeanDecimal(
                    name === "service_value"
                        ? normalizedValue
                        : formData.service_value,
                );
                const irrf = parseEuropeanDecimal(
                    name === "irrf_value"
                        ? normalizedValue
                        : formData.irrf_value,
                );
                const valueAdjust1 = parseEuropeanDecimal(
                    name === "value_adjust1"
                        ? normalizedValue
                        : formData.value_adjust1,
                );

                onChange({
                    target: {
                        name: "service_liquid_value",
                        value: formatEuropeanDecimal(
                            service - irrf - valueAdjust1,
                        ),
                    },
                } as any);
            }

            return;
        }

        onChange({
            target: {
                name,
                value: value.toUpperCase(),
            },
        } as any);
    };

    const handleBlurValue = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (!monetaryFields.has(name)) {
            return;
        }

        onChange({
            target: {
                name,
                value: formatEuropeanDecimal(value),
            },
        } as any);
    };

    return (
        <SFormContainer>
            <STitle>{titleText}</STitle>

            <div
                style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                }}
            >
                <CustomDatePicker
                    type="text"
                    label="Data Emissao:"
                    $labelPosition="top"
                    name="rps_emission_date"
                    width="180px"
                    value={formData.rps_emission_date}
                    onChange={handleDateChange}
                />
                <CustomInput
                    name="exportacao"
                    label="Exportação de Serviço"
                    $labelPosition="top"
                    radioPosition="only"
                    radioOptions={[
                        { label: "Sim", value: "Sim" },
                        { label: "Não", value: "Não" },
                    ]}
                    onRadioChange={onChange}
                    selectedRadio={formData.exportacao || "Não"}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "flex-end",
                }}
            >
                <CustomInput
                    type="text"
                    label="CPF/CNPJ Tomador:"
                    $labelPosition="top"
                    name="cpf_cnpj"
                    width="100%"
                    value={formData.cpf_cnpj}
                    onBlur={onCheckCNPJ}
                    onChange={onChange}
                />
                {cpfCnpjAction}
            </div>
            <div
                style={{
                    display: "grid",
                    gap: "5px",
                    alignItems: "flex-start",
                }}
            >
                <CustomInput
                    type="text"
                    label="Razao Social:"
                    $labelPosition="top"
                    name="name"
                    width="100%"
                    value={formData.name.toString()}
                    onChange={handleChangeValue}
                />
                <CustomInput
                    type="text"
                    label="CEP:"
                    $labelPosition="top"
                    name="zip_code"
                    width="30%"
                    value={formData.zip_code}
                    onChange={handleChangeValue}
                />
                <CustomInput
                    type="text"
                    label="Endereco:"
                    $labelPosition="top"
                    name="address"
                    width="80%"
                    value={formData.address}
                    onChange={handleChangeValue}
                />
                <CustomInput
                    type="text"
                    label="Numero:"
                    $labelPosition="top"
                    name="number"
                    width="20%"
                    value={formData.number}
                    onChange={handleChangeValue}
                />
                <CustomInput
                    type="text"
                    label="Bairro:"
                    $labelPosition="top"
                    name="district"
                    width="50%"
                    value={formData.district.toString()}
                    onChange={handleChangeValue}
                />
                <CustomInput
                    type="text"
                    label="Cidade:"
                    $labelPosition="top"
                    name="city"
                    width="50%"
                    value={formData.city.toString()}
                    onChange={handleChangeValue}
                />
                <CustomInput
                    type="text"
                    label="UF:"
                    $labelPosition="top"
                    name="state"
                    width="20%"
                    value={formData.state.toString()}
                    onChange={handleChangeValue}
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
                    inputMode="decimal"
                    label="Valor Servicos:"
                    $labelPosition="top"
                    name="service_value"
                    width="100%"
                    value={String(formData.service_value ?? "")}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
                <CustomInput
                    type="text"
                    inputMode="decimal"
                    label="Valor I.R.R.F:"
                    $labelPosition="top"
                    name="irrf_value"
                    width="100%"
                    value={String(formData.irrf_value ?? "")}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
                <CustomInput
                    type="text"
                    inputMode="decimal"
                    label="Valor Liquido:"
                    $labelPosition="top"
                    name="service_liquid_value"
                    width="100%"
                    value={String(formData.service_liquid_value ?? "")}
                    onChange={onChange}
                    onBlur={handleBlurValue}
                    readOnly
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
                    label="Descricao Ajuste:"
                    $labelPosition="top"
                    name="name_adjust1"
                    width="100%"
                    value={formData.name_adjust1}
                    onChange={onChange}
                />
                <CustomInput
                    type="text"
                    inputMode="decimal"
                    label="Valor Ajuste:"
                    $labelPosition="top"
                    name="value_adjust1"
                    width="100%"
                    value={String(formData.value_adjust1 ?? "")}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
            </div>
            <SCustomTextArea
                width="100%"
                height="220px"
                label="Discriminacao dos servicos:"
                name="service_discrim"
                value={formData.service_discrim}
                onChange={handleChange}
            />
            <BoxContainer>
                <CustomButton
                    $variant={"primary"}
                    width="80px"
                    onClick={() => navigate("/cobranca")}
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
