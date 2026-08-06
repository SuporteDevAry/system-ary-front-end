import { Link } from "react-router-dom";
import { SContainer, SCard, SCardIcon, SContent, STitle } from "./styles";

import { IoCashOutline } from "react-icons/io5";
import {
    TbFileInvoice,
    TbFileSearch,
    TbMapDollar,
    TbReceipt,
} from "react-icons/tb";
import { IoTodayOutline } from "react-icons/io5";
import { TbReceipt2 } from "react-icons/tb";
import { FaFileInvoiceDollar } from "react-icons/fa";

export function Billing() {
    const cardLinks1 = [
        {
            label: "Cadastro RPS",
            icon: <TbFileInvoice size={64} />,
            to: "/cobranca/RPS",
            disabled: false,
        },
        {
            label: "Emissão NFSe",
            icon: <FaFileInvoiceDollar size={64} />,
            to: "/cobranca/notafiscal",
            disabled: false,
        },
        {
            label: "Consulta NFSe",
            icon: <TbFileSearch size={64} />,
            to: "/cobranca/consulta-nfse",
        },
        {
            label: "Listagem NFSe",
            icon: <TbReceipt size={64} />,
            to: "/cobranca/listagem-nfse",
            disabled: false,
        },
        // {
        //     label: "Importação de NF",
        //     icon: <IoReceiptSharp size={64} />,
        //     to: "/cobranca/AtualizaNF",
        //     disabled: true,
        // },
    ];
    const cardLinks2 = [
        {
            label: "Contratos por Vencimento",
            icon: <IoTodayOutline size={64} />,
            to: "/cobranca/contrato-vencto",
        },
        {
            label: "Contratos Recebidos",
            icon: <TbReceipt2 size={64} />,
            to: "/cobranca/contratos-receb",
        },
        {
            label: "Recebimentos",
            icon: <IoCashOutline size={64} />,
            to: "/cobranca/recebimento",
        },
        {
            label: "Mapa de Recebimento",
            icon: <TbMapDollar size={64} />,
            to: "/cobranca/mapa-recebimento",
            disabled: false,
        },
    ];
    return (
        <>
            <STitle>Cobrança</STitle>
            <SContainer>
                {cardLinks1.map(({ icon, label, to, disabled }) => {
                    if (disabled) {
                        return (
                            <div
                                key={label}
                                aria-disabled="true"
                                role="link"
                                tabIndex={-1}
                            >
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

            <SContainer>
                {cardLinks2.map(({ icon, label, to, disabled }) => {
                    if (disabled) {
                        return (
                            <div
                                key={label}
                                aria-disabled="true"
                                role="link"
                                tabIndex={-1}
                            >
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
