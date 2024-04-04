import { useState } from "react";
import { ContatoContext } from "../../../../contexts/ContatoContext";
import { toast } from "react-toastify";
import { isEmailValid } from "../../../../helpers/back-end/utils";

import { FormularioContato } from "../../../../components/FormularioContato";

export function CadastrarContato() {
  const contatoContext = ContatoContext();

  const [formData, setFormData] = useState({
    cli_codigo: "",
    sequencia: "",
    grupo: "",
    nome: "",
    cargo: "",
    email: "",
    telefone: "",
    celular: "",
    recebe_email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleClose = () => {
    setFormData({
      cli_codigo: "",
      sequencia: "",
      grupo: "",
      nome: "",
      cargo: "",
      email: "",
      telefone: "",
      celular: "",
      recebe_email: "",
    });
  };

  const handleCreate = async () => {
    if (!isEmailValid(formData.email)) {
      toast.error(
        "Formato de e-mail inválido, verifique se seu e-mail está correto."
      );
      return;
    }

    try {
      const newContato = await contatoContext.createContato({
        cli_codigo: formData.cli_codigo,
        sequencia: formData.sequencia,
        grupo: formData.grupo,
        nome: formData.nome,
        cargo: formData.cargo,
        email: formData.email,
        telefone: formData.telefone,
        celular: formData.celular,
        recebe_email: formData.recebe_email,
      });

      toast.success(
        `Contato ${formData.cli_codigo} ${formData.sequencia}, foi criado com sucesso!`
      );
      handleClose();

      return newContato;
    } catch (error) {
      toast.error(`Erro ao tentar criar o Contato, ${error}`);
    }
  };

  return (
    <>
      <FormularioContato
        titleText={"Cadastrar Contato"}
        data={formData}
        onHandleCreate={handleCreate}
        onChange={handleChange}
      />
    </>
  );
}
