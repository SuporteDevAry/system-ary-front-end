import styled from "styled-components";
import { V } from "../../styles/variables";
import Card from "@mui/material/Card/Card";

export const SContainer = styled.main`
  max-width: calc(25 * ${V.xxlSpacing});
`;

// Estilos com styled-components
export const SDashboardContainer = styled.div`
    padding: 20px;
    background-color: #f0f0f0;
`;

export const SChartContainer = styled(Card)`
    margin-top: 20px;
    padding: 20px;
`;