import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ButtonCancelar, ButtonGravar, BoxContainer, SBairroInput, SCelularInput, SCepInput, SCidadeInput, SCli_codigoInput, SCnpjInput, SComplementoInput, SEnderecoInput, SFormContainer, SIns_estInput, SIns_munInput, SNomeInput, SNumeroInput, STelefoneInput, SUfInput, SemailInput } from "./styles";
import { insertMaskInCEP } from "../insertMaskInCep";
import { insertMaskInCpf } from "../insertMaskInCpf";
import { insertMaskInCnpj } from "../insertMaskInCnpj";
import { insertMaskInTelefone } from "../insertMaskInFone";
import { insertMaskInCelular } from "../insertMaskInCelular";
import { IFormularioClienteProps } from "./types";
import { useNavigate } from "react-router-dom";

export function FormularioCliente({titleText, data, onChange, onHandleCreate, onCheckCEP}:IFormularioClienteProps) {

  
     const navigate = useNavigate();

    return(
        <>
        <SFormContainer>
          <h2>{titleText}</h2>
          <div>
            <label>Código:</label>
            <SCli_codigoInput
              type="text"
              name="cli_codigo"
              value={data.cli_codigo}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label>Nome:</label>
            <SNomeInput
              type="text"
              name="nome"
              value={data.nome}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label>CEP:</label>
            <SCepInput
              type="text"
              name="cep"
              maxLength={9}
              value={insertMaskInCEP(data.cep)}
              onChange={onChange}
              onBlur={onCheckCEP}
              required
            />
          </div>
          <div>
              <label>Endereço:</label>
              <SEnderecoInput
                type="text"
                name="endereco"
                value={data.endereco}
                onChange={onChange}
                required
              />
          </div>
          <div>
                <label>Nro:</label>
                <SNumeroInput
                  type="text"
                  name="numero"
                  value={data.numero}
                  onChange={onChange}
                  required
                />
              <label>Complemento:</label>
              <SComplementoInput
                type="text"
                name="complemento"
                value={data.complemento}
                onChange={onChange}
              />
              <label>Bairro:</label>
              <SBairroInput
                type="text"
                name="bairro"
                value={data.bairro}
                onChange={onChange}
              />
          </div>

          <div>
            <label>Cidade:</label>
            <SCidadeInput
              type="text"
              name="cidade"
              value={data.cidade}
              onChange={onChange}
              required
            />
            <label>UF:</label>
            <SUfInput
              type="text"
              name="uf"
              maxLength={2}
              value={data.uf}
              onChange={onChange}
              required
            />
          </div>   
          
          <div>
            <label>Natureza:</label>
            <RadioGroup
              row
              aria-labelledby="natureza"
              name="natureza"
              value={data.natureza}
              onChange={onChange}
            >
              <FormControlLabel value="F" control={<Radio />} label="Pessoa Fisica" />
              <FormControlLabel value="J" control={<Radio />} label="Pessoa Juridica" />
            </RadioGroup>
          </div>     
          <div>
            <label>CPF/CNPJ:</label>
            <SCnpjInput
              type="text"
              name="cnpj"
              maxLength={data.natureza == "F" ? 14 : 18}
              value={data.natureza == "F" ? insertMaskInCpf(data.cnpj) : insertMaskInCnpj(data.cnpj)}
              onChange={onChange}
              required
            />
          </div>  
          <div>
            <label>Ins.Estadual:</label>
            <SIns_estInput
              type="text"
              name="ins_est"
              value={data.ins_est}
              onChange={onChange}
            />
          </div> 
          <div>
            <label>Ins.Municipal:</label>
            <SIns_munInput
              type="text"
              name="ins_mun"
              value={data.ins_mun}
              onChange={onChange}
            />
          </div> 
          <div>
            <label>e-Mail:</label>
            <SemailInput
              type="text"
              name="email"
              value={data.email}
              onChange={onChange}
              placeholder="contato@email.com.br"
              required
            />
          </div> 
          <div>
            <label>Telefone:</label>
            <STelefoneInput
              type="text"
              name="telefone"
              maxLength={15}
              value={insertMaskInTelefone(data.telefone)}
              onChange={onChange}
            />
            <label>Celular:</label>
            <SCelularInput
              type="text"
              name="celular"
              maxLength={15}
              value={insertMaskInCelular(data.celular)}
              onChange={onChange}
            />
          </div>
          <div>
            <label>Situação:</label>
            <RadioGroup
              row
              aria-labelledby="situacao"
              name="situacao"
              value={data.situacao}
              onChange={onChange}
            >
              <FormControlLabel value="A" control={<Radio />} label="Ativa" />
              <FormControlLabel value="I" control={<Radio />} label="Inativa" />
            </RadioGroup>

          </div> 
          <BoxContainer>
            <ButtonCancelar onClick={() => navigate("/clientes")}> Cancelar</ButtonCancelar>
            <ButtonGravar onClick={onHandleCreate}> Gravar</ButtonGravar>
          </BoxContainer>
        </SFormContainer>
    </>
    )
}