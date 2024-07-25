import { useState } from "react";
import { Modal } from "../../../../../../components/Modal";

import { toast } from "react-toastify";
import { isEmailValid } from "../../../../../../helpers/back-end/utils";
import { SFormContainer } from "./styles";
import { CustomInput } from "../../../../../../components/CustomInput";
import { ModalCreateNewContactProps } from "./types";
import { ContatoContext } from "../../../../../../contexts/ContatoContext";
import { useLocation } from "react-router-dom";
import { IListCliente } from "../../../../../../contexts/ClienteContext/types";

export function ModalCreateNewContact({
  open,
  onClose,
}: ModalCreateNewContactProps) {
  const location = useLocation();

  const dataClient: IListCliente = location.state?.clientForView;
  const contactContext = ContatoContext();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    sector: "",
    telephone: "",
    cellphone: "",
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
      sector: "",
      telephone: "",
      cellphone: "",
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
      const newUser = await contactContext.createContato({
        code_client: dataClient.code_client,
        name: formData.name,
        email: formData.email,
        sector: formData.sector,
        telephone: formData.telephone,
        cellphone: formData.cellphone,
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
      titleText={"Criar Novo Contato"}
      open={open}
      confirmButton="Criar"
      cancelButton="Fechar"
      onClose={handleClose}
      onHandleCreate={handleCreate}
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
      </SFormContainer>
    </Modal>
  );
}
