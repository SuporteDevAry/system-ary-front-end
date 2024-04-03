import { useState, useEffect } from "react";
import { Modal } from "../../../../components/Modal";
import { UserContext } from "../../../../contexts/UserContext";
import { toast } from "react-toastify";
import { isEmailValid } from "../../../../helpers/back-end/utils";
import { ModalEditUserProps } from "./types";
import {
  SNameInput,
  SEmailInput,
  SPasswordInput,
  SFormContainer,
} from "./styles";

export function ModalEditUser({ open, onClose, user }: ModalEditUserProps) {
  const userContext = UserContext();

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: user.password,
  });

  useEffect(() => {
    setFormData({
      name: user.name ?? "",
      email: user.email ?? "",
      password: user.password ?? "",
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClose = () => {
    onClose();
  };

  const handleUpdate = async () => {
    if (!isEmailValid(formData.email)) {
      toast.error("Formato de e-mail inválido.");
      return;
    }

    try {
      await userContext.updateUsers(user.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success(`Usuário ${formData.name} atualizado com sucesso!`);
      handleClose();
    } catch (error) {
      toast.error("Erro ao atualizar usuário.");
    }
  };

  return (
    <Modal
      titleText={"Editar usuário"}
      open={open}
      confirmButton="Atualizar"
      cancelButton="Cancelar"
      onClose={handleClose}
      onHandleCreate={handleUpdate}
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
      </SFormContainer>
    </Modal>
  );
}
