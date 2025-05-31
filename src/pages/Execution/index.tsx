import { Link } from "react-router-dom";
import { SContainer, SCard, SCardIcon, SContent, STitle } from "./styles";

import { IoFileTrayStackedOutline } from "react-icons/io5";
import { RiMailSendLine } from "react-icons/ri";
import { IoClipboardOutline } from "react-icons/io5";

export function Execution() {
    const cardLinks = [
        {
            label: "Enviar Contratos",
            icon: <RiMailSendLine size={64} />,
            to: "/execucao/enviar-contratos",
        },
        {
            label: "Histórico de Contratos",
            icon: <IoFileTrayStackedOutline size={64} />,
            to: "/execucao/historico",
        },
        {
            label: "Controle de Contratos",
            icon: <IoClipboardOutline size={64} />,
            to: "/execucao/controle",
        },
    ];
    return (
        <>
            <STitle>Execução</STitle>
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
