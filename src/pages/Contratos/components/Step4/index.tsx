import { StepProps } from "../../types";
import { SContainer, SText, STextArea } from "./styles";

export const Step4: React.FC<StepProps> = ({ handleChange }) => {
  return (
    <SContainer>
      <SText>Observação :</SText>
      <STextArea name="observation" onChange={handleChange} />
    </SContainer>
  );
};
