import CustomInput from "../../../../components/CustomInput";
import { StepProps } from "../../types";
import { SContainer } from "./styles";

export const Step2: React.FC<StepProps> = ({ handleChange }) => {
  return (
    <SContainer>
      <CustomInput
        type="text"
        name="product"
        label="Mercadoria: "
        labelPosition="top"
        onChange={handleChange}
      />

      <CustomInput
        type="text"
        name="quality"
        label="Qualidade: "
        labelPosition="top"
        onChange={handleChange}
      />
    </SContainer>
  );
};
