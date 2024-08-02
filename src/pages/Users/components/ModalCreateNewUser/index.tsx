import { useState } from "react";
import { Modal } from "../../../../components/Modal";
import { UserContext } from "../../../../contexts/UserContext";
import { toast } from "react-toastify";
import { isEmailValid } from "../../../../helpers/back-end/utils";
import { SFormContainer } from "./styles";
import { ModalCreateNewUserProps } from "./types";
import { CustomInput } from "../../../../components/CustomInput";

export function ModalCreateNewUser({ open, onClose }: ModalCreateNewUserProps) {
  const userContext = UserContext();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleCreate = async () => {
    if (!isEmailValid(formData.email)) {
      toast.error(
        "Formato de e-mail inválido, verifique se seu e-mail está correto."
      );
      return;
    }
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(
        "As senhas não coincidem, digite a senha de forma idêntica nos campos solicitados."
      );
      return;
    }

    try {
      const newUser = await userContext.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success(`Usuario ${formData.name}, foi criado com sucesso!`);
      handleClose();
      return newUser;
    } catch (error) {
      toast.error(
        `Erro ao tentar criar usuário novo, contacte o administrador do sistema ${error}`
      );
    }
  };

  return (
    <Modal
      titleText={"Criar Novo Usuário"}
      open={open}
      confirmButton="Criar"
      cancelButton="Fechar"
      onClose={handleClose}
      onHandleConfirm={handleCreate}
      variantCancel={"primary"}
      variantConfirm={"success"}
    >
      <SFormContainer>
        <CustomInput
          type="text"
          name="name"
          label="Nome:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.name}
        />
        <CustomInput
          type="email"
          name="email"
          label="E-mail:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.email}
        />
        <CustomInput
          type="password"
          name="password"
          label="Senha:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.password}
        />
        <CustomInput
          type="password"
          name="confirmPassword"
          label="Confirme a Senha:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.confirmPassword}
        />
      </SFormContainer>
    </Modal>
  );
}
