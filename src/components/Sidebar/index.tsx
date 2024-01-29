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

import {
  AiOutlineApartment,
  AiOutlineHome,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineSetting,
} from "react-icons/ai";
import { MdLogout, MdOutlineAnalytics } from "react-icons/md";
import { BsPeople } from "react-icons/bs";

import { iconAry } from "../../assets";
import { getPermissionsFromToken } from "../../contexts/AuthProvider/util";

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const [menuItems, setMenuItens] = useState<string[] | null>([]);

  useEffect(() => {
    const permissions = getPermissionsFromToken();
    setMenuItens(permissions);
  }, []);

  const linksArray = [
    {
      id: "DASHBOARD",
      label: "Dashboard",
      icon: <AiOutlineHome />,
      to: "/dashboard",
      notification: 0,
    },
    {
      id: "FINANCEIRO",
      label: "Financeiro",
      icon: <MdOutlineAnalytics />,
      to: "/financeiro",
      notification: 0,
    },
    {
      id: "BACKOFFICE",
      label: "BackOffice",
      icon: <BsPeople />,
      to: "/back-office",
      notification: 0,
    },
    {
      id: "OPERACAO",
      label: "Operações",
      icon: <AiOutlineApartment />,
      to: "/diagrams",
      notification: 0,
    },
  ];

  const secondaryLinksArray = [
    {
      label: "Admin",
      icon: <AiOutlineSetting />,
      to: "/admin",
    },
    {
      label: "Logout",
      icon: <MdLogout />,
      to: "/logout",
    },
  ];

  const filteredLinksArray = linksArray.filter((link) =>
    menuItems?.includes(link.id)
  );

  return (
    <SSidebar
      isOpen={sidebarOpen}
      style={!sidebarOpen ? { width: `fit-content` } : {}}
    >
      <>
        <SSidebarButton
          isOpen={sidebarOpen}
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
        <SLinkContainer key={label} isActive={pathname === to}>
          <SLink to={to} style={!sidebarOpen ? { width: `fit-content` } : {}}>
            <SLinkIcon>{icon}</SLinkIcon>
            {sidebarOpen && (
              <>
                <SLinkLabel>{label}</SLinkLabel>
                {!!notification && (
                  <SLinkNotification>{notification}</SLinkNotification>
                )}
              </>
            )}
          </SLink>
        </SLinkContainer>
      ))}
      <SDivider />
      {secondaryLinksArray.map(({ icon, label, to }) => (
        <SLinkContainer key={label} isActive={pathname === to}>
          <SLink to={to} style={!sidebarOpen ? { width: `fit-content` } : {}}>
            <SLinkIcon>{icon}</SLinkIcon>
            {sidebarOpen && <SLinkLabel>{label}</SLinkLabel>}
          </SLink>
        </SLinkContainer>
      ))}
    </SSidebar>
  );
}
