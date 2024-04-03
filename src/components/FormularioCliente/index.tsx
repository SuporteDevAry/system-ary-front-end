import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import {
    ButtonCancelar,
    ButtonGravar,
    BoxContainer,
    SBairroInput,
    SCelularInput,
    SCepInput,
    SCidadeInput,
    SCli_codigoInput,
    SCnpjInput,
    SComplementoInput,
    SEnderecoInput,
    SFormContainer,
    SIns_estInput,
    SIns_munInput,
    SNomeInput,
    SNumeroInput,
    STelefoneInput,
    SUfInput,
    SemailInput,
} from "./styles";
import { insertMaskInCEP } from "../../helpers/front-end/insertMaskInCep";
import { insertMaskInCpf } from "../../helpers/front-end/insertMaskInCpf";
import { insertMaskInCnpj } from "../../helpers/front-end/insertMaskInCnpj";
import { insertMaskInTelefone } from "../../helpers/front-end/insertMaskInFone";
import { insertMaskInCelular } from "../../helpers/front-end/insertMaskInCelular";
import { IFormularioClienteProps } from "./types";
import { useNavigate } from "react-router-dom";

export function FormularioCliente({
    titleText,
    data,
    onChange,
    onHandleCreate,
    onCheckCEP,
}: IFormularioClienteProps) {
    const navigate = useNavigate();

    /*
     const defaultData: IFormData = {
      cli_codigo: "",
      nome: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      natureza: "",
      cnpj: "",
      ins_est: "",
      ins_mun: "",
      email: "",
      telefone: "",
      celular: "",
      situacao: ""
    };
    */

    const formData = data;

    return (
        <>
            <SFormContainer>
                <h2>{titleText}</h2>
                <div>
                    <label>Código:</label>
                    <SCli_codigoInput
                        type="text"
                        name="cli_codigo"
                        value={formData.cli_codigo}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <label>Nome:</label>
                    <SNomeInput
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>CEP:</label>
                    <SCepInput
                        type="text"
                        name="cep"
                        maxLength={9}
                        value={insertMaskInCEP(formData.cep)}
                        onChange={onChange}
                        onBlur={onCheckCEP}
                    />
                </div>
                <div>
                    <label>Endereço:</label>
                    <SEnderecoInput
                        type="text"
                        name="endereco"
                        value={formData.endereco}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>Nro:</label>
                    <SNumeroInput
                        type="text"
                        name="numero"
                        value={formData.numero}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>Complemento:</label>
                    <SComplementoInput
                        type="text"
                        name="complemento"
                        value={formData.complemento}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>Bairro:</label>
                    <SBairroInput
                        type="text"
                        name="bairro"
                        value={formData.bairro}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>Cidade:</label>
                    <SCidadeInput
                        type="text"
                        name="cidade"
                        value={formData.cidade}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>UF:</label>
                    <SUfInput
                        type="text"
                        name="uf"
                        maxLength={2}
                        value={formData.uf}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>Natureza:</label>
                    <RadioGroup
                        row
                        aria-labelledby="natureza"
                        name="natureza"
                        value={formData.natureza}
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
                <div>
                    <label>CPF/CNPJ:</label>
                    <SCnpjInput
                        type="text"
                        name="cnpj"
                        maxLength={formData.natureza == "F" ? 14 : 18}
                        value={
                            formData.natureza == "F"
                                ? insertMaskInCpf(formData.cnpj)
                                : insertMaskInCnpj(formData.cnpj)
                        }
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>Ins.Estadual:</label>
                    <SIns_estInput
                        type="text"
                        name="ins_est"
                        value={formData.ins_est}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>Ins.Municipal:</label>
                    <SIns_munInput
                        type="text"
                        name="ins_mun"
                        value={formData.ins_mun}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>e-Mail:</label>
                    <SemailInput
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        placeholder="contato@email.com.br"
                    />
                </div>
                <div>
                    <label>Telefone:</label>
                    <STelefoneInput
                        type="text"
                        name="telefone"
                        maxLength={15}
                        value={insertMaskInTelefone(formData.telefone)}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>Celular:</label>
                    <SCelularInput
                        type="text"
                        name="celular"
                        maxLength={15}
                        value={insertMaskInCelular(formData.celular)}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>Situação:</label>
                    <RadioGroup
                        row
                        aria-labelledby="situacao"
                        name="situacao"
                        value={formData.situacao}
                        onChange={onChange}
                    >
                        <FormControlLabel
                            value="A"
                            control={<Radio />}
                            label="Ativa"
                        />
                        <FormControlLabel
                            value="I"
                            control={<Radio />}
                            label="Inativa"
                        />
                    </RadioGroup>
                </div>
                <BoxContainer>
                    <ButtonCancelar onClick={() => navigate("/clientes")}>
                        {" "}
                        Cancelar
                    </ButtonCancelar>
                    <ButtonGravar onClick={onHandleCreate}>
                        {" "}
                        Gravar
                    </ButtonGravar>
                </BoxContainer>
            </SFormContainer>
        </>
    );
}
