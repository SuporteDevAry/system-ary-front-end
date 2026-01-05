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

export function FormularioNF({
    titleText,
    data,
    onChange,
    onHandleCreate,
    onCheckCNPJ,
}: IFormNFProps) {
    const navigate = useNavigate();
    const formData = data;
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Aqui você deve chamar a função onChange que veio das props
        // para atualizar o estado no componente pai.
        onChange({
            target: {
                name: e.target.name, // Garante que o nome do campo seja passado
                value: e.target.value,
            },
        } as any); // Usando 'as any' para forçar o tipo de evento, como nos outros handlers
    };

    const handleDateChange = (newDate: string) => {
        // Chamamos a função onChange do pai para atualizar o campo de data.
        onChange({
            target: {
                name: "rps_emission_date",
                value: newDate,
            },
        } as any);
    };

    const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Atualiza normalmente o campo alterado
        //onChange(e);
        onChange({
            target: {
                name: name,
                value: value.toUpperCase(),
            },
        } as any);

        // Calcula o líquido automaticamente
        if (
            name === "service_value" ||
            name === "irrf_value" ||
            name === "value_adjust1"
        ) {
            const service = Number(
                name === "service_value" ? value : formData.service_value || 0
            );
            const irrf = Number(
                name === "irrf_value" ? value : formData.irrf_value || 0
            );
            const value_adjust1 = Number(
                name === "value_adjust1" ? value : formData.value_adjust1 || 0
            );

            const liquid = (service - irrf - value_adjust1).toFixed(2);

            // Atualiza o valor líquido chamando o mesmo onChange do pai
            onChange({
                target: {
                    name: "service_liquid_value",
                    value: liquid,
                },
            } as any);
        }
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
                <CustomDatePicker
                    type="text"
                    label="Data Emissão:"
                    $labelPosition="top"
                    name="rps_emission_date"
                    width="70%"
                    value={formData.rps_emission_date}
                    onChange={handleDateChange}
                />
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
                    label="Razão Social:"
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
                    label="Endereço:"
                    $labelPosition="top"
                    name="address"
                    width="80%"
                    value={formData.address}
                    onChange={handleChangeValue}
                />{" "}
                <CustomInput
                    type="text"
                    label="Número:"
                    $labelPosition="top"
                    name="number"
                    width="20%"
                    value={formData.number}
                    onChange={handleChangeValue}
                />{" "}
                <CustomInput
                    type="text"
                    label="Bairro:"
                    $labelPosition="top"
                    name="district"
                    width="50%"
                    value={formData.district.toString()}
                    onChange={handleChangeValue}
                />{" "}
                <CustomInput
                    type="text"
                    label="Cidade:"
                    $labelPosition="top"
                    name="city"
                    width="50%"
                    value={formData.city.toString()}
                    onChange={handleChangeValue}
                />{" "}
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
                    type="number"
                    label="Valor Serviços:"
                    $labelPosition="top"
                    name="service_value"
                    width="100%"
                    value={formData.service_value.toString()}
                    onChange={handleChangeValue}
                />
                <CustomInput
                    type="number"
                    label="Valor I.R.R.F:"
                    $labelPosition="top"
                    name="irrf_value"
                    width="100%"
                    value={formData.irrf_value.toString()}
                    onChange={handleChangeValue}
                />
                <CustomInput
                    type="number"
                    label="Valor Líquido:"
                    $labelPosition="top"
                    name="service_liquid_value"
                    width="100%"
                    value={formData.service_liquid_value.toString()}
                    onChange={onChange}
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
                    value={formData.value_adjust1.toString()}
                    onChange={handleChangeValue}
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
