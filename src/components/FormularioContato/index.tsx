import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import {
    ButtonCancelar,
    ButtonGravar,
    BoxContainer,
    SFormContainer,
    SCli_codigoInput,
    SSequenciaInput,
    SGrupoInput,
    SNomeInput,
    SCargoInput,
    SEmailInput,
    STelefoneInput,
    SCelularInput,
} from "./styles";
import { insertMaskInTelefone } from "../insertMaskInFone";
import { insertMaskInCelular } from "../insertMaskInCelular";
import { IFormularioContatosProps } from "./types";
import { useNavigate } from "react-router-dom";

export function FormularioContato({
    titleText,
    data,
    onChange,
    onHandleCreate,
}: IFormularioContatosProps) {
    const navigate = useNavigate();

    const formData = data;

    return (
        <>
            <SFormContainer>
                <h2>{titleText}</h2>
                <div>
                    <label>Código Cliente:</label>
                    <SCli_codigoInput
                        type="text"
                        name="cli_codigo"
                        value={formData.cli_codigo}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <label>Seq:</label>
                    <SSequenciaInput
                        type="text"
                        name="sequencia"
                        value={formData.sequencia}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <label>Grupo:</label>
                    <SGrupoInput
                        type="text"
                        name="grupo"
                        value={formData.grupo}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>Nome:</label>
                    <SNomeInput
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <label>Cargo:</label>
                    <SCargoInput
                        type="text"
                        name="cargo"
                        value={formData.cargo}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <label>e-Mail:</label>
                    <SEmailInput
                        type="text"
                        name="email"
                        value={formData.email}
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
                        value={insertMaskInTelefone(formData.telefone)}
                        onChange={onChange}
                    />
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
                    <label>Recebe E-Mail:</label>
                    <RadioGroup
                        row
                        aria-labelledby="recebe_email"
                        name="recebe_email"
                        value={formData.recebe_email}
                        onChange={onChange}
                    >
                        <FormControlLabel
                            value="S"
                            control={<Radio />}
                            label="Sim"
                        />
                        <FormControlLabel
                            value="N"
                            control={<Radio />}
                            label="Não"
                        />
                    </RadioGroup>
                </div>
                <BoxContainer>
                    <ButtonCancelar onClick={() => navigate("/contatos")}>
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
