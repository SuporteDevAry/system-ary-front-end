import { StepProps } from "../../pages/CriarNovoContrato/types";
import { SContainer, SText, STextArea } from "./styles";

export const Step4: React.FC<StepProps> = ({ handleChange, formData }) => {
    return (
        <SContainer>
            <SText>Observação :</SText>
            <STextArea
                name="observation"
                onChange={handleChange}
                value={formData.observation}
            />
        </SContainer>
    );
};
