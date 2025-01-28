import CustomButton from "../../../../../../components/CustomButton";
import { CustomTextArea } from "../../../../../../components/CustomTextArea";
import { StepProps } from "../../types";
import { SContainer } from "./styles";

export const StepSendContract: React.FC<StepProps> = ({
  id,
  handleChange,
  formData,
}) => {
  return (
    <>
      <SContainer id={id}>
        <CustomTextArea
          height="230px"
          label="E-mails do vendedor:"
          name="list_email_seller"
          onChange={handleChange}
          value={formData.list_email_seller}
        />
        <CustomTextArea
          height="230px"
          label="E-mails do comprador:"
          name="list_email_buyer"
          onChange={handleChange}
          value={formData.list_email_buyer}
        />
        <CustomTextArea
          height="230px"
          label="E-mails de cópia oculta:"
          name="list_email_ocult_copy"
          onChange={handleChange}
          value={formData.list_email_ocult_copy}
        />
      </SContainer>
    </>
  );
};
