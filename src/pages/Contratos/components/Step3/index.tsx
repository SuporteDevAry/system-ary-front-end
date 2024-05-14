import CustomInput from "../../../../components/CustomInput";
import { StepProps } from "../../types";
import { SContainer } from "./styles";

export const Step3: React.FC<StepProps> = ({ handleChange }) => {
  return (
    <SContainer>
      <CustomInput
        type="text"
        name="quantity"
        label="Quantidade:"
        labelPosition="top"
        onChange={handleChange}
      />

      <CustomInput
        type="number"
        name="price"
        label="Preço:"
        labelPosition="top"
        onChange={handleChange}
      />

      <CustomInput
        type="number"
        name="icms"
        label="ICMS:"
        labelPosition="top"
        onChange={handleChange}
      />

      <CustomInput
        type="text"
        name="payment"
        label="Pagamento:"
        labelPosition="top"
        onChange={handleChange}
      />

      <CustomInput
        type="text"
        name="pickup"
        label="Retirada:"
        labelPosition="top"
        onChange={handleChange}
      />

      <CustomInput
        type="text"
        name="pickupLocation"
        label="Local de Retirada:"
        labelPosition="top"
        onChange={handleChange}
      />

      <CustomInput
        type="text"
        name="inspection"
        label="Conferência:"
        labelPosition="top"
        onChange={handleChange}
      />
    </SContainer>
  );
};
