<<<<<<< HEAD:src/pages/Contratos/components/Step3/index.tsx
import { CustomInput } from "../../../../components/CustomInput";
import { StepProps } from "../../pages/CriarNovoContrato/types";
=======
import { CustomInput } from "../../../../../../components/CustomInput";
import { StepProps } from "../../types";
>>>>>>> 341f9a7f8e5997943688ac4f15c22a8d01d3a9ac:src/pages/Contratos/pages/CriarNovoContrato/components/Step3/index.tsx
import { SContainer } from "./styles";

export const Step3: React.FC<StepProps> = ({ handleChange, formData }) => {
    return (
        <SContainer>
            <CustomInput
                type="text"
                name="quantity"
                label="Quantidade:"
                labelPosition="top"
                onChange={handleChange}
                value={formData.quantity}
            />

            <CustomInput
                type="number"
                name="price"
                label="Preço:"
                labelPosition="top"
                onChange={handleChange}
                value={formData.price}
            />

            <CustomInput
                type="number"
                name="icms"
                label="ICMS:"
                labelPosition="top"
                onChange={handleChange}
                value={formData.icms}
            />

            <CustomInput
                type="text"
                name="payment"
                label="Pagamento:"
                labelPosition="top"
                onChange={handleChange}
                value={formData.payment}
            />

            <CustomInput
                type="text"
                name="pickup"
                label="Retirada:"
                labelPosition="top"
                onChange={handleChange}
                value={formData.pickup}
            />

            <CustomInput
                type="text"
                name="pickupLocation"
                label="Local de Retirada:"
                labelPosition="top"
                onChange={handleChange}
                value={formData.pickupLocation}
            />

            <CustomInput
                type="text"
                name="inspection"
                label="Conferência:"
                labelPosition="top"
                onChange={handleChange}
                value={formData.inspection}
            />
        </SContainer>
    );
};
