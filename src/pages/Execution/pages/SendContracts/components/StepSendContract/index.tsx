import { CustomTextArea } from "../../../../../../components/CustomTextArea";
import { StepProps } from "../../types";
import { SCheckbox, SContainer, SFormControlLabel } from "./styles";

export const StepSendContract: React.FC<StepProps> = ({
  id,
  handleChange,
  formData,
}) => {
  return (
    <>
      <SContainer id={id}>
        <SFormControlLabel
          control={
            <SCheckbox
              name="copy_correct"
              onChange={handleChange}
              value={formData?.copy_correct}
              checked={formData?.copy_correct === "true"}
            />
          }
          label="Cópia correta"
        />

        <CustomTextArea
          width="530px"
          height="230px"
          label="E-mails do vendedor:"
          name="list_email_seller"
          onChange={handleChange}
          value={formData?.list_email_seller}
        />
        <CustomTextArea
          width="530px"
          height="230px"
          label="E-mails do comprador:"
          name="list_email_buyer"
          onChange={handleChange}
          value={formData?.list_email_buyer}
        />
      </SContainer>
    </>
  );
};
