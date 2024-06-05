import { CustomInput } from "../../../../components/CustomInput";
import { StepProps } from "../../types";
import { SContainer, SText, STextArea } from "./styles";
import { CustomSelect } from "../../../../components/CustomSelect";

export const Step2: React.FC<StepProps> = ({
  handleChange,
  formData,
  updateFormData,
}) => {
  // const handleSelectChange = (value: string) => {
  //   // Atualiza o state formData no componente pai
  //   updateFormData?.({ product: value });
  // };

  const handleFieldChange = (field: string, value: string) => {
    // Atualiza o state formData no componente pai
    updateFormData?.({ ...formData, [field]: value });
  };

  return (
    <SContainer>
      <CustomSelect
        name="product"
        label="Mercadoria: "
        labelPosition="top"
        selectOptions={[
          { value: "S", label: "SOJA" },
          { value: "CN", label: "MILHO" },
          { value: "T", label: "TRIGO" },
          { value: "SG", label: "SORGO" },
        ]}
        onSelectChange={(value) => handleFieldChange("product", value)}
        value={formData.product}
      />

      <CustomInput
        type="text"
        name="crop"
        label="Safra: "
        labelPosition="top"
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
