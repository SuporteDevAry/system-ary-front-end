import styled from "styled-components";
import FormControlLabel from "@mui/material/FormControlLabel";

export const SFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
`;

export const SFormControlLabel = styled(FormControlLabel)`
  padding-right: 110px;
`;
