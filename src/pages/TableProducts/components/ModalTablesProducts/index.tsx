import { useState, useEffect } from "react";
import { Modal } from "../../../../components/Modal";
import { toast } from "react-toastify";
import { SFormContainer } from "./styles";
import { CustomInput } from "../../../../components/CustomInput";
import { ModalTableProductProps } from "./types";
import { TableProductContext } from "../../../../contexts/TablesProducts";
import { ITableProductsData } from "../../../../contexts/TablesProducts/types";
import CustomTooltipLabel from "../../../../components/CustomTooltipLabel";

export function ModalTablesProducts({
  open,
  onClose,
  tableProductToEdit,
}: ModalTableProductProps) {
  const tableProductContext = TableProductContext();

  const initialFormData: Omit<ITableProductsData, "id"> = {
    product_types: [],
    name: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (tableProductToEdit) {
      setFormData({
        product_types: tableProductToEdit.product_types || [],
        name: tableProductToEdit.name || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [tableProductToEdit, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      if (name === "product_types") {
        // Divide a string por vírgula, remove espaços e converte para maiúsculas
        const newArray = value.split(",").map((s) => s.trim().toUpperCase());

        return {
          ...prevData,
          [name]: newArray,
        };
      }

      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const handleClose = () => {
    onClose();
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    if (!formData.product_types.length || !formData.name) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    try {
      if (tableProductToEdit?.id) {
        await tableProductContext.updateTableProduct(tableProductToEdit.id, {
          ...formData,
          product_types: formData.product_types,
          name: formData.name.toUpperCase(),
        });
        toast.success(`Produto ${formData.name} foi atualizado com sucesso!`);
      } else {
        await tableProductContext.createTableProduct({
          ...formData,
          product_types: formData.product_types,
          name: formData.name.toUpperCase(),
        });
        toast.success(`Mesa ${formData.name} foi criado com sucesso!`);
      }

      handleClose();
    } catch (error) {
      toast.error(
        `Erro ao tentar ${
          tableProductToEdit ? "editar" : "criar"
        } a mesa: ${error}`
      );
    }
  };

  return (
    <Modal
      titleText={tableProductToEdit ? "Editar Mesa" : "Criar Nova Mesa"}
      open={open}
      confirmButton={tableProductToEdit ? "Salvar" : "Criar"}
      cancelButton="Fechar"
      onClose={handleClose}
      onHandleConfirm={handleSubmit}
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
          name="product_types"
          label={
            <CustomTooltipLabel
              title={`Separe as siglas por vírgula. ex.: S,T`}
            >
              Grupo de produtos:
            </CustomTooltipLabel>
          }
          $labelPosition="top"
          onChange={handleChange}
          value={formData.product_types.join(", ")}
        />
      </SFormContainer>
    </Modal>
  );
}
