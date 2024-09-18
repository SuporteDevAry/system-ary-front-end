import { Link } from "react-router-dom";
import { SContainer, SCard, SCardIcon, SContent, STitle } from "./styles";

import { IoFileTrayStackedOutline } from "react-icons/io5";
import { RxFileText } from "react-icons/rx";

export function Contract() {
  const cardLinks = [
    {
      label: "Novo Contrato",
      icon: <RxFileText size={64} />,
      to: "/contratos/novo-contrato",
    },
    {
      label: "Histórico de Contratos",
      icon: <IoFileTrayStackedOutline size={64} />,
      to: "/contratos/historico",
    },
  ];
  return (
    <>
      <STitle>Contratos</STitle>
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
