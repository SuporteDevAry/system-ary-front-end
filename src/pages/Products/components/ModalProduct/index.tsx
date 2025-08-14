import { useState, useEffect } from "react";
import { Modal } from "../../../../components/Modal";
import { toast } from "react-toastify";
import { SFormContainer } from "./styles";
import { CustomInput } from "../../../../components/CustomInput";
import { ProductContext } from "../../../../contexts/Products";
import { CustomTextArea } from "../../../../components/CustomTextArea";
import { getCommissionFormat } from "../../../Contracts/pages/CreateNewContract/components/Step3/helpers";
import { useCommissionHandlers } from "../../../Contracts/pages/CreateNewContract/components/Step3/hooks";
import { ModalProductProps } from "./types";

export function ModalProduct({
  open,
  onClose,
  productToEdit,
}: ModalProductProps) {
  const productContext = ProductContext();

  const initialFormData = {
    product_type: "",
    name: "",
    commission_seller: "",
    type_commission_seller: "",
    quality: "",
    observation: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  // Use useEffect para carregar os dados do produto quando o modal é aberto
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        product_type: productToEdit.product_type || "",
        name: productToEdit.name || "",
        commission_seller: productToEdit.commission_seller || "",
        type_commission_seller: productToEdit.type_commission_seller || "",
        quality: productToEdit.quality || "",
        observation: productToEdit.observation || "",
      });
    } else {
      setFormData(initialFormData); // Reseta o formulário para criação
    }
  }, [productToEdit, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    customName?: string
  ) => {
    const { name, value, type } = e.target;
    const fieldName = customName || name;

    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: type === "radio" ? value : value,
    }));
  };

  const handleClose = () => {
    onClose();
    setFormData(initialFormData); // Reseta o formulário ao fechar
  };

  const handleSubmit = async () => {
    if (
      !formData.product_type ||
      !formData.name ||
      !formData.commission_seller ||
      !formData.type_commission_seller ||
      !formData.quality ||
      !formData.observation
    ) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    try {
      if (productToEdit?.id) {
        // Lógica de edição
        await productContext.updateProduct(productToEdit.id, {
          ...formData,
          product_type: formData.product_type.toUpperCase(),
          name: formData.name.toUpperCase(),
        });
        toast.success(`Produto ${formData.name} foi atualizado com sucesso!`);
      } else {
        // Lógica de criação
        await productContext.createProduct({
          ...formData,
          product_type: formData.product_type.toUpperCase(),
          name: formData.name.toUpperCase(),
        });
        toast.success(`Produto ${formData.name} foi criado com sucesso!`);
      }

      handleClose();
    } catch (error) {
      toast.error(
        `Erro ao tentar ${
          productToEdit ? "editar" : "criar"
        } o produto: ${error}`
      );
    }
  };

  const handleNumericInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    const regex = /^[0-9]*[.,]?[0-9]*$/;

    if (regex.test(value)) {
      handleChange?.({
        ...event,
        target: {
          ...event.target,
          name,
          value,
        },
      });
    }
  };

  const { isEditingCommission, handleCommissionFocus, handleCommissionBlur } =
    useCommissionHandlers();

  return (
    <Modal
      titleText={productToEdit ? "Editar Produto" : "Criar Novo Produto"}
      open={open}
      confirmButton={productToEdit ? "Salvar" : "Criar"}
      cancelButton="Fechar"
      onClose={handleClose}
      onHandleConfirm={handleSubmit}
      variantCancel={"primary"}
      variantConfirm={"success"}
    >
      <SFormContainer>
        <CustomInput
          type="text"
          name="product_type"
          label="Sigla:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.product_type}
        />
        <CustomInput
          type="text"
          name="name"
          label="Nome:"
          $labelPosition="top"
          onChange={handleChange}
          value={formData.name}
        />

        <CustomInput
          name="commission_seller"
          label="Comissão Vendedor:"
          $labelPosition="top"
          onChange={handleNumericInputChange}
          value={
            isEditingCommission.seller
              ? formData.commission_seller
              : formData.type_commission_seller === "Valor"
              ? `${getCommissionFormat(formData.type_commission_seller || "")}${
                  formData.commission_seller
                }`
              : `${formData.commission_seller}${getCommissionFormat(
                  formData.type_commission_seller || ""
                )}`
          }
          radioOptions={[
            { label: "Percentual", value: "Percentual" },
            { label: "Valor", value: "Valor" },
          ]}
          onFocus={() => handleCommissionFocus("seller")}
          onBlur={() => handleCommissionBlur("seller")}
          radioPosition="inline"
          onRadioChange={(e) => handleChange(e, "type_commission_seller")}
          selectedRadio={formData.type_commission_seller}
        />
        <CustomTextArea
          width="500px"
          height="230px"
          label="Qualidade:"
          name="quality"
          onChange={handleChange}
          value={formData.quality}
        />
        <CustomTextArea
         width="500px"
          height="230px"
          label="Observação:"
          name="observation"
          onChange={handleChange}
          value={formData.observation}
        />
      </SFormContainer>
    </Modal>
  );
}
