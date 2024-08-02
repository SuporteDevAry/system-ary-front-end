import { useState, useEffect } from "react";
import { Modal } from "../../../../components/Modal";
import { UserContext } from "../../../../contexts/UserContext";
import { toast } from "react-toastify";
import { isEmailValid } from "../../../../helpers/back-end/utils";
import { ModalEditUserProps } from "./types";
import { SFormContainer } from "./styles";
import { CustomInput } from "../../../../components/CustomInput";

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
      titleText={"Editar Usuário"}
      open={open}
      confirmButton="Atualizar"
      cancelButton="Cancelar"
      onClose={handleClose}
      onHandleConfirm={handleUpdate}
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
      </SFormContainer>
    </Modal>
  );
}
