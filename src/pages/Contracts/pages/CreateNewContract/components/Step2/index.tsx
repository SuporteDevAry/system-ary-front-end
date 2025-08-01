import { StepProps } from "../../types";
import { SContainer, SText, STextArea } from "./styles";
import { CustomSelect } from "../../../../../../components/CustomSelect";
import { ProductType, productInfo } from "./types";
import { useMemo } from "react";
import { generateCropYears } from "./helpers";
import { CustomInput } from "../../../../../../components/CustomInput";

export const Step2: React.FC<StepProps> = ({
  id,
  handleChange,
  formData,
  updateFormData,
}) => {
  const cropYearOptions = useMemo(generateCropYears, []);

  const handleFieldChange = (field: string, value: string) => {
    const info = productInfo[value as ProductType];

    if (field === "destination") {
      updateFormData?.({
        ...formData,
        destination: value,
      });
      return;
    }

    if (field === "complement_destination") {
      updateFormData?.({
        ...formData,
        complement_destination: value,
      });
      return;
    }

    if (field === "crop") {
      updateFormData?.({
        ...formData,
        crop: value,
      });
      return;
    }

    updateFormData?.({
      ...formData,
      [field]: value,
      quality: info.quality,
      observation: info.observation,
      name_product: info.name,
      commission_seller: info.commission_seller,
      type_commission_seller: info.type_commission_seller,
    });
  };

  return (
    <SContainer id={id}>
      <CustomSelect
        name="product"
        label="Mercadoria: "
        $labelPosition="top"
        selectOptions={[
          { value: "S", label: "SOJA em Grãos" },
          { value: "CN", label: "MILHO em Grãos" },
          { value: "T", label: "TRIGO" },
          { value: "SG", label: "SORGO" },
          { value: "O", label: "ÓLEO DE SOJA a Granel" },
          { value: "OC", label: "ÓLEO DE CANOLA a Granel" },
          { value: "OA", label: "ÓLEO DE ALGODÃO a Granel" },
          { value: "SB", label: "SEBO BOVINO" },
          { value: "EP", label: "ESTEARINA DE PALMA" },
          { value: "F", label: "FARELO DE SOJA a Granel" },
        ]}
        onSelectChange={(value) => handleFieldChange("product", value)}
        value={formData.product}
        //readOnly={isEditMode}  permitindo editar o produto
      />
      <CustomSelect
        name="crop"
        label="Safra: "
        $labelPosition="top"
        selectOptions={cropYearOptions}
        onSelectChange={(value) => handleFieldChange("crop", value)}
        value={formData.crop}
      />
      <CustomSelect
        name="destination"
        label="Destinação: "
        $labelPosition="top"
        selectOptions={[
          { value: "+D.U.E", label: "+D.U.E" },
          {
            value: "+D.U.E - Livre de FETHAB",
            label: "+D.U.E - Livre de FETHAB",
          },
          { value: "Comercialização", label: "Comercialização" },
          {
            value: "Industrialização",
            label: "Industrialização",
          },
          {
            value: "Industrialização Ração Animal - Suspenso de Pis/Cofins",
            label: "Industrialização Ração Animal - Suspenso de Pis/Cofins",
          },
          { value: "Nenhum", label: "Nenhum" },
        ]}
        onSelectChange={(value) => handleFieldChange("destination", value)}
        value={formData.destination}
      />

      <CustomInput
        type="text"
        name="complement_destination"
        label="Complemento Destinação:"
        $labelPosition="top"
        value={formData.complement_destination || ""}
        onChange={(e) =>
          handleFieldChange("complement_destination", e.target.value)
        }
      />
      <SText>Qualidade:</SText>
      <STextArea
        name="quality"
        onChange={handleChange}
        value={formData.quality}
      />
    </SContainer>
  );
};
