import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    SDivider,
    SLink,
    SLinkContainer,
    SLinkIcon,
    SLinkLabel,
    SLinkNotification,
    SLogo,
    SSidebar,
    SSidebarButton,
} from "./styles";

import { FiUser } from "react-icons/fi";

import {
    AiOutlineIdcard,
    AiOutlineTeam,
    AiOutlineHome,
    AiOutlineLeft,
    AiOutlineRight,
    AiOutlineSetting,
    AiOutlineDollar,
} from "react-icons/ai";

import { LiaFileContractSolid } from "react-icons/lia";
import { MdLogout } from "react-icons/md";

import { iconAry } from "../../assets";
import { getPermissionsFromToken } from "../../contexts/AuthProvider/util";
import { RiPrinterLine } from "react-icons/ri";

export function Sidebar() {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
    const { pathname } = useLocation();

    const [menuItems, setMenuItens] = useState<string[] | null>([]);

    useEffect(() => {
        const permissions = getPermissionsFromToken();
        setMenuItens(permissions);
    }, []);

    // Verificar se os nomes da permissão estão corretos: src/pages/Permissions/index.tsx
    const linksArray = [
        {
            id: "DASHBOARD",
            label: "Dashboard",
            icon: <AiOutlineHome />,
            to: "/dashboard",
            notification: 0,
        },
        {
            id: "CONTRATOS",
            label: "Contratos",
            icon: <LiaFileContractSolid />,
            to: "/contratos",
            notification: 0,
        },
        {
            id: "CLIENTES",
            label: "Clientes",
            icon: <AiOutlineTeam />,
            to: "/clientes",
            notification: 0,
        },
        {
            id: "EXECUCAO",
            label: "Execução",
            icon: <AiOutlineIdcard />,
            to: "/execucao",
            notification: 0,
        },
        {
            id: "COBRANCA",
            label: "Cobrança",
            icon: <AiOutlineDollar />,
            to: "/cobranca",
            notification: 0,
        },
        {
            id: "RELATORIOS",
            label: "Relatórios",
            icon: <RiPrinterLine />,
            to: "/relatorios",
            notification: 0,
        },
    ];

    let secondaryLinksArray = [
        {
            id: "ADMIN",
            label: "Admin",
            icon: <AiOutlineSetting />,
            to: "/admin",
        },
        {
            id: "MINHA CONTA",
            label: "Minha Conta",
            icon: <FiUser />,
            to: "/minha-conta",
        },
        {
            id: "LOGOUT",
            label: "Logout",
            icon: <MdLogout />,
            to: "/logout",
        },
    ];

    const filteredLinksArray = linksArray.filter((link) =>
        menuItems?.includes(link.id)
    );

    const isAdminPresent = menuItems?.includes("ADMIN");
    if (!isAdminPresent) {
        secondaryLinksArray = secondaryLinksArray.filter(
            (link) => link.id !== "ADMIN"
        );
    }

    return (
        <SSidebar
            $isOpen={sidebarOpen}
            style={!sidebarOpen ? { width: `fit-content` } : {}}
        >
            <>
                <SSidebarButton
                    $isOpen={sidebarOpen}
                    onClick={() => setSidebarOpen((p) => !p)}
                >
                    {sidebarOpen ? <AiOutlineLeft /> : <AiOutlineRight />}
                </SSidebarButton>
            </>
            <SLogo>
                <img src={iconAry} alt="logo" />
            </SLogo>
            <SDivider />
            {filteredLinksArray.map(({ icon, label, notification, to }) => (
                <SLinkContainer key={label} $isActive={pathname === to}>
                    <SLink
                        to={to}
                        style={!sidebarOpen ? { width: `fit-content` } : {}}
                    >
                        <SLinkIcon>{icon}</SLinkIcon>
                        {sidebarOpen && (
                            <>
                                <SLinkLabel>{label}</SLinkLabel>
                                {!!notification && (
                                    <SLinkNotification>
                                        {notification}
                                    </SLinkNotification>
                                )}
                            </>
                        )}
                    </SLink>
                </SLinkContainer>
            ))}
            <SDivider />
            {secondaryLinksArray.map(({ icon, label, to, id }) => (
                <SLinkContainer key={id} $isActive={pathname === to}>
                    <SLink
                        to={to}
                        style={!sidebarOpen ? { width: `fit-content` } : {}}
                    >
                        <SLinkIcon>{icon}</SLinkIcon>
                        {sidebarOpen && <SLinkLabel>{label}</SLinkLabel>}
                    </SLink>
                </SLinkContainer>
            ))}
        </SSidebar>
    );
}
