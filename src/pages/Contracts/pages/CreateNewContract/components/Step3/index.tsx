import FormControl from "@mui/material/FormControl";
import { CustomInput } from "../../../../../../components/CustomInput";
import { StepProps } from "../../types";
import { SContainer } from "./styles";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import React from "react";
import Box from "@mui/material/Box";

export const Step3: React.FC<StepProps> = ({ handleChange, formData }) => {
    const [icms, setICMS] = React.useState("");

    const handleChangeICMS = (event: SelectChangeEvent) => {
        setICMS(event.target.value as string);
    };
    return (
        <SContainer>
            <CustomInput
                type="text"
                name="quantity"
                label="Quantidade"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.quantity}
            />

            <CustomInput
                type="number"
                name="price"
                label="Preço:"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.price}
            />

            <CustomInput
                type="number"
                name="icms"
                label="ICMS:"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.icms}
            />

            <CustomInput
                type="text"
                name="payment"
                label="Pagamento:"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.payment}
            />

            <CustomInput
                type="text"
                name="pickup"
                label="Retirada:"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.pickup}
            />

            <CustomInput
                type="text"
                name="pickupLocation"
                label="Local de Retirada:"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.pickupLocation}
            />

            <CustomInput
                type="text"
                name="inspection"
                label="Conferência:"
                $labelPosition="top"
                onChange={handleChange}
                value={formData.inspection}
            />
        </SContainer>
    );
};
