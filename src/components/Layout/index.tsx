import { SLayout } from "./styles";
import { Sidebar } from "../Sidebar";
import { SCardContainer } from "../CardContainer";
import { LayoutProps } from "./types";



export function Layout({ children }: LayoutProps) {
  return (
    <SLayout>
      <Sidebar />

      <SCardContainer>{children}</SCardContainer>
    </SLayout>
  );
}
