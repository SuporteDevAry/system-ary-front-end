import { Link } from "react-router-dom";
import { SContainer, SCard, SCardIcon, SContent, STitle } from "./styles";
import { FiUsers } from "react-icons/fi";
import { GoShieldCheck } from "react-icons/go";
import { FaSitemap } from "react-icons/fa";
import { FaSquareParking } from "react-icons/fa6";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import useUserPermissions from "../../hooks/useUserPermissions";

export function Admin() {
  const { canViewDevPanel } = useUserPermissions();

  const cardLinks = [
    {
      label: "Cadastro de Usuários",
      icon: <FiUsers size={64} />,
      to: "/admin/usuarios",
    },
    {
      label: "Controle de Acesso",
      icon: <GoShieldCheck size={64} />,
      to: "/admin/permissoes",
    },
    {
      label: "Cadastro de Produtos",
      icon: <FaSquareParking size={64} />,
      to: "/admin/produtos",
    },
    {
      label: "Cadastro de Mesas",
      icon: <FaSitemap size={64} />,
      to: "/admin/mesas",
    },
    ...(canViewDevPanel
      ? [
          {
            label: "Painel de Devs",
            icon: <MdOutlineAdminPanelSettings size={64} />,
            to: "/admin/dev-panel",
          },
        ]
      : []),
  ];
  return (
    <>
      <STitle>Administrador</STitle>
      <SContainer>
        {cardLinks.map(({ icon, label, to }) => (
          <Link to={to} key={label}>
            <SCard>
              <SCardIcon>{icon}</SCardIcon>
              <SContent>{label}</SContent>
            </SCard>
          </Link>
        ))}
      </SContainer>
    </>
  );
}
