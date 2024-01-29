import { ReactNode } from "react";
import { CardContainer } from "./styles";
import CardContent from "@mui/material/CardContent";

export function SCardContainer({ children }: { children: ReactNode }) {
  return (
    <CardContainer>
      <CardContent>{children}</CardContent>
    </CardContainer>
  );
}
