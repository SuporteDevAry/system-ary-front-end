import { useState } from "react";
import { ContatoContext } from "../../../../contexts/ContatoContext";
import { toast } from "react-toastify";
import { isEmailValid } from "../../../../helpers/back-end/utils";
import { FormularioContato } from "../../../../components/FormularioContato";
import { useLocation, useNavigate } from "react-router-dom";
import { TClienteContato } from "../TableContatos";

export function EditarContato() {
    const navigate = useNavigate();
    const location = useLocation();

    const contatoForUpdate: TClienteContato = location.state?.contatoForUpdate;

    const contatoContext = ContatoContext();

    const [formData, setFormData] = useState({
        cli_codigo: contatoForUpdate.cli_codigo,
        sequencia: contatoForUpdate.sequencia,
        grupo: contatoForUpdate.grupo,
        nome: contatoForUpdate.nome,
        cargo: contatoForUpdate.cargo,
        email: contatoForUpdate.email,
        telefone: contatoForUpdate.telefone,
        celular: contatoForUpdate.celular,
        recebe_email: contatoForUpdate.recebe_email,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleCreate = async () => {
        if (!isEmailValid(formData.email)) {
            toast.error(
                "Formato de e-mail inválido, verifique se seu e-mail está correto."
            );
            return;
        }
        try {
            contatoContext.updateContato(
                contatoForUpdate.cli_codigo,
                contatoForUpdate.sequencia,
                {
                    cli_codigo: formData.cli_codigo,
                    sequencia: formData.sequencia,
                    grupo: formData.grupo,
                    nome: formData.nome,
                    cargo: formData.cargo,
                    email: formData.email,
                    telefone: formData.telefone,
                    celular: formData.celular,
                    recebe_email: formData.recebe_email,
                }
            );

            toast.success(
                `Contato ${formData.cli_codigo} ${formData.sequencia}, foi alterado com sucesso!`
            );
            navigate("/contatos");
        } catch (error) {
            toast.error(`Erro ao tentar alterar o Contato, ${error}`);
        }
    };

    return (
        <>
            <FormularioContato
                titleText={"Editar Contato"}
                data={formData}
                onHandleCreate={handleCreate}
                onChange={handleChange}
            />
        </>
    );
}
