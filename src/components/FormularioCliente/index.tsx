import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { BoxContainer, SFormContainer, STitle } from "./styles";
import { insertMaskInCEP } from "../../helpers/front-end/insertMaskInCep";
import { insertMaskInCpf } from "../../helpers/front-end/insertMaskInCpf";
import { insertMaskInCnpj } from "../../helpers/front-end/insertMaskInCnpj";
import { insertMaskInTelefone } from "../../helpers/front-end/insertMaskInFone";
import { insertMaskInCelular } from "../../helpers/front-end/insertMaskInCelular";
import { IFormularioClienteProps } from "./types";
import { useNavigate } from "react-router-dom";
import CustomButton from "../CustomButton";
import { CustomInput } from "../CustomInput";

export function FormularioCliente({
  titleText,
  data,
  onChange,
  onHandleCreate,
  onCheckCEP,
}: IFormularioClienteProps) {
  const navigate = useNavigate();

  return (
    <SFormContainer>
      <STitle>{titleText}</STitle>

      <CustomInput
        type="text"
        label="Nome:"
        labelPosition="top"
        name="name"
        width="70%"
        value={data.name}
        onChange={onChange}
      />

      <CustomInput
        type="text"
        label="Apelido:"
        labelPosition="top"
        name="nickname"
        width="70%"
        value={data.nickname}
        onChange={onChange}
      />

      <CustomInput
        type="text"
        label="CEP:"
        labelPosition="top"
        name="zip_code"
        maxLength={9}
        value={insertMaskInCEP(data.zip_code)}
        onChange={onChange}
        onBlur={onCheckCEP}
      />

      <CustomInput
        type="text"
        name="address"
        label="Endereço:"
        labelPosition="top"
        width="70%"
        value={data.address}
        onChange={onChange}
      />

      <CustomInput
        type="number"
        name="number"
        label="Nº:"
        labelPosition="top"
        value={data.number}
        onChange={onChange}
      />

      <CustomInput
        type="text"
        name="complement"
        label="Complemento:"
        labelPosition="top"
        width="70%"
        value={data.complement}
        onChange={onChange}
      />

      <CustomInput
        type="text"
        name="district"
        label="Bairro:"
        labelPosition="top"
        value={data.district}
        onChange={onChange}
      />

      <CustomInput
        type="text"
        name="city"
        label="Cidade:"
        labelPosition="top"
        value={data.city}
        onChange={onChange}
      />

      <CustomInput
        type="text"
        name="state"
        label="UF:"
        labelPosition="top"
        maxLength={2}
        value={data.state}
        onChange={onChange}
      />

      <div>
        <label>Natureza:</label>
        <RadioGroup
          row
          aria-labelledby="natureza"
          name="kind"
          value={data.kind}
          onChange={onChange}
        >
          <FormControlLabel
            value="F"
            control={<Radio />}
            label="Pessoa Fisica"
          />
          <FormControlLabel
            value="J"
            control={<Radio />}
            label="Pessoa Juridica"
          />
          <FormControlLabel
            value="E"
            control={<Radio />}
            label="Pessoa Estrangeira"
          />
        </RadioGroup>
      </div>

      <CustomInput
        type="text"
        name="cnpj_cpf"
        label="CPF/CNPJ:"
        labelPosition="top"
        maxLength={data.kind == "F" ? 14 : 18}
        value={
          data.kind == "F"
            ? insertMaskInCpf(data.cnpj_cpf)
            : insertMaskInCnpj(data.cnpj_cpf)
        }
        onChange={onChange}
      />

      <CustomInput
        type="text"
        name="ins_est"
        label="Ins.Estadual:"
        labelPosition="top"
        value={data.ins_est}
        onChange={onChange}
      />

      <CustomInput
        type="text"
        name="ins_mun"
        label="Ins.Municipal:"
        labelPosition="top"
        value={data.ins_mun}
        onChange={onChange}
      />

      <CustomInput
        type="text"
        name="telephone"
        label="Telefone:"
        labelPosition="top"
        maxLength={15}
        value={insertMaskInTelefone(data.telephone)}
        onChange={onChange}
      />

      <CustomInput
        type="text"
        name="cellphone"
        label="Celular:"
        labelPosition="top"
        maxLength={15}
        value={insertMaskInCelular(data.cellphone)}
        onChange={onChange}
      />

      <div>
        <label>Situação:</label>
        <RadioGroup
          row
          aria-labelledby="situacao"
          name="situation"
          value={data.situation}
          onChange={onChange}
        >
          <FormControlLabel value="A" control={<Radio />} label="Ativa" />
          <FormControlLabel value="I" control={<Radio />} label="Inativa" />
        </RadioGroup>
      </div>
      <BoxContainer>
        <CustomButton
          variant={"primary"}
          width="80px"
          onClick={() => navigate("/clientes")}
        >
          Cancelar
        </CustomButton>
        <CustomButton variant={"success"} width="80px" onClick={onHandleCreate}>
          Gravar
        </CustomButton>
      </BoxContainer>
    </SFormContainer>
  );
}
