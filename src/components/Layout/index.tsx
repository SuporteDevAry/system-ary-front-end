import { SLayout } from "./styles";
import { Sidebar } from "../Sidebar";
import { SCardContainer } from "../CardContainer";
import { LayoutProps } from "./types";
import { NotificationCenter } from "../NotificationCenter";
// import { CustomBreadcrumbs } from "../CustomBreadCrumbs";
// import { breadcrumbMap } from "../CustomBreadCrumbs/breadcrumbMap";

export function Layout({ children }: LayoutProps) {
  return (
    <SLayout>
      <Sidebar />

      <SCardContainer>
        {/* <CustomBreadcrumbs map={breadcrumbMap} /> */}
        {children}
      </SCardContainer>
      <NotificationCenter></NotificationCenter>
    </SLayout>
  );
}
