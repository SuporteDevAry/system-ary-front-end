import React from "react";

interface StatusIndicatorProps {
    status: string;
    text: string;
}

const statusColors: Record<string, string> = {
    "A CONFERIR": "#F5B301",
    VALIDADO: "blue",
    ENVIADO: "#00B37E",
    EDITADO: "#B2A5FF",
    "EM PAUSA": "#7C7C8A",
    DELETADO: "red",
    COBRANCA: "green",
};

export const CustomStatusIndicator: React.FC<StatusIndicatorProps> = ({
    status,
    text,
}) => {
    const statusColor = statusColors[status] || "gray";

    return (
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
                style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: statusColor,
                }}
            />
            <span>{text}</span>
        </span>
    );
};
