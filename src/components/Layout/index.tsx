import { SLayout } from "./styles";
import { Sidebar } from "../Sidebar";
import { SCardContainer } from "../CardContainer";
import { LayoutProps } from "./types";
import { NotificationCenter } from "../NotificationCenter";

export function Layout({ children }: LayoutProps) {
    return (
        <SLayout>
            <Sidebar />
            <SCardContainer>{children}</SCardContainer>
            <NotificationCenter></NotificationCenter>
        </SLayout>
    );
}
