import styled from "styled-components";
import Stepper from "@mui/material/Stepper";
export const SContainer = styled.div`
  padding: 16px;
  min-width: 900px;
`;

export const SContent = styled.div`
  padding-top: 32px;
  padding-left: 10px;
`;

// Estamos estendendo os valores do SContent para o SButtonContainer com essa abordagem "styled(SContent)"
export const SButtonContainer = styled(SContent)`
  display: flex;
  gap: 16px;
  justify-content: start;
`;

export const SStepper = styled(Stepper)`
  span svg {
    &.MuiStepIcon-root.Mui-active {
      color: ${(props) => props.theme["black"]};
    }

    &.MuiStepIcon-root.Mui-completed {
      color: ${(props) => props.theme["green-300"]};
    }
  }
`;
