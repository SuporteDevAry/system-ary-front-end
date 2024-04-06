import { Link } from "react-router-dom";
import { SContainer, SCard, SCardIcon, SContent } from "./styles";
import { FiUsers } from "react-icons/fi";
import { GoShieldCheck } from "react-icons/go";

export function Admin() {
  const cardLinks = [
    {
      label: "Gerenciamento de Usuários",
      icon: <FiUsers size={64} />,
      to: "/admin/usuarios",
    },
    {
      label: "Permissões",
      icon: <GoShieldCheck size={64} />,
      to: "/admin/permissoes",
    },
  ];
  return (
    <>
      <h1>Administrador</h1>
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
