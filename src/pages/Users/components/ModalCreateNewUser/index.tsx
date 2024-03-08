import { useState } from "react";
import { Modal } from "../../../../components/Modal";
import { UserContext } from "../../../../contexts/UserContext";
import { toast } from "react-toastify";
import { isEmailValid } from "../../../../helpers/utils";
import {
  SFormContainer,
  SNameInput,
  SConfirmPasswordInput,
  SEmailInput,
  SPasswordInput,
} from "./styles";
import { ModalCreateNewUserProps } from "./types";

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
      titleText={"Criar novo usuário"}
      open={open}
      confirmButton="Criar"
      cancelButton="Fechar"
      onClose={handleClose}
      onHandleCreate={handleCreate}
      variantCancel={"primary"}
      variantConfirm={"success"}
    >
      <SFormContainer>
        <div>
          <label>Nome:</label>
          <SNameInput
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>E-mail:</label>
          <SEmailInput
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Senha:</label>
          <SPasswordInput
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Confirme a Senha:</label>
          <SConfirmPasswordInput
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
      </SFormContainer>
    </Modal>
  );
}
