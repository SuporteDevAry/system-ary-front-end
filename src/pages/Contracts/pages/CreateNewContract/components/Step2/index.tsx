import { CustomInput } from "../../../../../../components/CustomInput";
import { StepProps } from "../../types";
import { SContainer, SText, STextArea } from "./styles";
import { CustomSelect } from "../../../../../../components/CustomSelect";
import { ProductType, productInfo } from "./types";

export const Step2: React.FC<StepProps> = ({
  id,
  handleChange,
  formData,
  updateFormData,
  isEditMode,
}) => {
  const handleFieldChange = (field: string, value: string) => {
    const info = productInfo[value as ProductType];
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
          { value: "CN", label: "MILHO" },
          { value: "T", label: "TRIGO" },
          { value: "SG", label: "SORGO" },
        ]}
        onSelectChange={(value) => handleFieldChange("product", value)}
        value={formData.product}
        readOnly={isEditMode}
      />

      <CustomInput
        type="text"
        name="crop"
        label="Safra: "
        $labelPosition="top"
        onChange={handleChange}
        value={formData.crop}
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
