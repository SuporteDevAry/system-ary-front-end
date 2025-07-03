import { Link } from "react-router-dom";
import { SContainer, SCard, SCardIcon, SContent, STitle } from "./styles";

import { RiPrinterLine } from "react-icons/ri";

export function Reports() {
    const cardLinks = [
        {
            label: "Grãos Volume",
            icon: <RiPrinterLine size={64} />,
            to: "/relatorios/graos-volume",
        },
        {
            label: "Grãos Maiores",
            icon: <RiPrinterLine size={64} />,
            to: "/relatorios/graos-maiores",
        },
        {
            label: "Faturamento",
            icon: <RiPrinterLine size={64} />,
            to: "/relatorios/faturamento",
        },
    ];
    return (
        <>
            <STitle>Relatórios</STitle>
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
