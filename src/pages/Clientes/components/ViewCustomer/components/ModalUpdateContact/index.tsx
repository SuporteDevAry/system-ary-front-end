import { useEffect, useState } from "react";
import { Modal } from "../../../../../../components/Modal";

import { toast } from "react-toastify";
import { isEmailValid } from "../../../../../../helpers/back-end/utils";
import { SCheckbox, SFormContainer, SFormControlLabel } from "./styles";
import { CustomInput } from "../../../../../../components/CustomInput";
import { ModalUpdateContactProps } from "./types";
import { ContatoContext } from "../../../../../../contexts/ContatoContext";

export function ModalUpdateContact({
  open,
  onClose,
  dataContact,
}: ModalUpdateContactProps) {
  const contactContext = ContatoContext();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    sector: "",
    telephone: "",
    cellphone: "",
    receive_email: "",
  });

  useEffect(() => {
    setFormData({
      name: dataContact.name ?? "",
      email: dataContact.email ?? "",
      sector: dataContact.sector ?? "",
      telephone: dataContact.telephone ?? "",
      cellphone: dataContact.cellphone ?? "",
      receive_email: dataContact.receive_email === "true" ? "true" : "false",
    });
  }, [dataContact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? (checked ? "true" : "false") : value,
    }));
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: "",
      email: "",
      sector: "",
      telephone: "",
      cellphone: "",
      receive_email: "",
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
      !formData.sector ||
      !formData.telephone ||
      !formData.cellphone
    ) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const newUser = await contactContext.updateContato(dataContact.id, {
        name: formData.name,
        email: formData.email,
        sector: formData.sector,
        telephone: formData.telephone,
        cellphone: formData.cellphone,
        receive_email: formData.receive_email,
      });

      toast.success(`Usuario ${formData.name}, foi atualizado com sucesso!`);
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
      titleText={"Editar Contato"}
      open={open}
      confirmButton="Salvar"
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
          type="text"
          name="email"
          label="E-mail:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.email}
        />
        <CustomInput
          type="text"
          name="sector"
          label="Setor:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.sector}
        />

        <CustomInput
          type="text"
          name="telephone"
          label="Telefone:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.telephone}
        />
        <CustomInput
          type="text"
          name="cellphone"
          label="Celular:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.cellphone}
        />
        <SFormControlLabel
          control={
            <SCheckbox
              name="receive_email"
              onChange={handleChange}
              value={formData.receive_email}
              checked={formData.receive_email === "true"}
            />
          }
          label="Recebe e-mail"
        />
      </SFormContainer>
    </Modal>
  );
}
