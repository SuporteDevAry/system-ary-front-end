import { StepProps } from "../../types";
import { SContainer, SText, STextArea } from "./styles";

export const Step4: React.FC<StepProps> = ({ id, handleChange, formData }) => {
  return (
    <SContainer id={id}>
      <SText>Observação :</SText>
      <STextArea
        name="observation"
        onChange={handleChange}
        value={formData.observation}
      />
    </SContainer>
  );
};
