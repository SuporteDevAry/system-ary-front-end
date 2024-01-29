import React from "react";
import { SLayout } from "./styles";
import { Sidebar } from "../Sidebar";
import { SCardContainer } from "../CardContainer";

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <SLayout>
      <Sidebar />

      <SCardContainer>{children}</SCardContainer>
    </SLayout>
  );
}
