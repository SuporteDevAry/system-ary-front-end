import { StepProps } from "../../types";
import { SContainer, SText, STextArea } from "./styles";
import Tooltip from "@mui/material/Tooltip";

export const Step4: React.FC<StepProps> = ({ id, handleChange, formData }) => {
  return (
    <SContainer id={id}>
      <SText>Observação:</SText>
      <STextArea
        name="observation"
        onChange={handleChange}
        value={formData.observation}
      />

      <Tooltip
        title={`As informações deste campo não será exibida no contrato.`}
        arrow
      >
        <SText>Comunicado interno:</SText>
      </Tooltip>
      <STextArea
        name="observation"
        onChange={handleChange}
        value={formData.internal_communication}
      />
    </SContainer>
  );
};
