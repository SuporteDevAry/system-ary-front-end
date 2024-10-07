import { StepProps } from "../../types";
import { SContainer, SText, STextArea } from "./styles";
import { CustomSelect } from "../../../../../../components/CustomSelect";
import { ProductType, productInfo } from "./types";
import { useMemo } from "react";
import { generateCropYears } from "./helpers";

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
          { value: "Comercialização", label: "Comercialização" },
          {
            value: "Industrialização Ração Animal - Suspenso de Pis/Cofins",
            label: "Industrialização Ração Animal - Suspenso de Pis/Cofins",
          },
          { value: "", label: "Nenhum" },
        ]}
        onSelectChange={(value) => handleFieldChange("destination", value)}
        value={formData.destination}
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
