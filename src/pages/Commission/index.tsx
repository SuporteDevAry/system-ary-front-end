import { Link } from "react-router-dom";
import { AiOutlineDollar, AiOutlineFileText } from "react-icons/ai";
import { SContainer, SCard, SCardIcon, SContent, STitle } from "./styles";

export function Commission() {
  const cardLinks = [
    {
      label: "Broker",
      icon: <AiOutlineDollar size={64} />,
      to: "/commission/broker",
      disabled: false,
    },
    {
      label: "Relatório de Comissão",
      icon: <AiOutlineFileText size={64} />,
      to: "/commission/report",
      disabled: false,
    },
  ];

  return (
    <>
      <STitle>Comissão</STitle>
      <SContainer>
        {cardLinks.map(({ icon, label, to, disabled }) => {
          if (disabled) {
            return (
              <div key={label} aria-disabled="true" role="link" tabIndex={-1}>
                <SCard disabled>
                  <SCardIcon>{icon}</SCardIcon>
                  <SContent>{label}</SContent>
                </SCard>
              </div>
            );
          }

          return (
            <Link to={to} key={label}>
              <SCard>
                <SCardIcon>{icon}</SCardIcon>
                <SContent>{label}</SContent>
              </SCard>
            </Link>
          );
        })}
      </SContainer>
    </>
  );
}
