import { Link } from "react-router-dom";
import { SContainer, SCard, SCardIcon, SContent, STitle } from "./styles";

import { IoCashOutline } from "react-icons/io5";
import { IoReceiptOutline } from "react-icons/io5";
import { IoReceiptSharp } from "react-icons/io5";

export function Billing() {
    const cardLinks = [
        {
            label: "Emissão RPS",
            icon: <IoReceiptOutline size={64} />,
            to: "/cobranca/notafiscal",
        },
        {
            label: "Importa Nota Fiscal",
            icon: <IoReceiptSharp size={64} />,
            to: "/cobranca/AtualizaNF",
        },
        {
            label: "Recebimento",
            icon: <IoCashOutline size={64} />,
            to: "/cobranca/recebimento",
        },
    ];
    return (
        <>
            <STitle>Cobrança</STitle>
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
