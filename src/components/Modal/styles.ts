import styled from "styled-components";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { V } from "../../styles/variables";

export const SDialogContent = styled(DialogContent)`
  &.MuiDialogContent-root {
    padding-bottom: ${V.mdSpacing};
  }
`;

export const SDialogActions = styled(DialogActions)`
  &.MuiDialogActions-root {
    padding-right: ${V.lgSpacing};
    padding-bottom: ${V.mdSpacing};
    padding-top: ${V.smSpacing};
    gap: ${V.smSpacing};
  }
`;
