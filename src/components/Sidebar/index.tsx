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
 // AiOutlineApartment,
  AiOutlineIdcard ,
  AiOutlineUser,
  AiOutlineTeam ,
  AiOutlineCheckSquare,
  AiOutlineHome,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineSolution,
  //AiOutlineSetting,
} from "react-icons/ai";
import { MdLogout } from "react-icons/md";

import { iconAry } from "../../assets";
import { getPermissionsFromToken } from "../../contexts/AuthProvider/util";

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      id: "CLIENTES",
      label: "Clientes",
      icon: <AiOutlineTeam  />,
      to: "/clientes",
      notification: 0,
    },
    {
      id: "CONTATOS",
      label: "Contatos",
      icon: <AiOutlineIdcard />,
      to: "/contatos",
      notification: 0,
    },
    {
      id: "CORRETORES",
      label: "Corretores",
      icon: <AiOutlineSolution />,
      to: "/corretores",
      notification: 0,
    },
  ];

  const secondaryLinksArray = [
    {
      label: "Usuários",
      icon: <AiOutlineUser  />,
      to: "/Usuarios",
    },
    {
      label: "Permissões",
      icon: <AiOutlineCheckSquare />,
      to: "/Permissoes",
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
