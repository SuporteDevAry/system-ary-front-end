import { useState } from "react";
import { Modal } from "../../../../components/Modal";

interface ModalCreateNewUserProps {
  open: boolean;
  onClose: (value: string) => void;
}

export function ModalCreateNewUser({ open, onClose }: ModalCreateNewUserProps) {
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
    onClose("Fechar");
  };

  const handleCreate = () => {
    // Lógica para criar o novo usuário
    console.log("Novo usuário criado:", formData);
    onClose("Criar");
  };

  return (
    <Modal
      titleText={"Criar novo usuário"}
      open={open}
      confirmButton="Criar"
      cancelButton="Fechar"
      onClose={handleClose}
      onHandleCreate={handleCreate}
    >
      <div>
        <label>Nome:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>E-mail:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Senha:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Confirme a Senha:</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>
    </Modal>
  );
}
