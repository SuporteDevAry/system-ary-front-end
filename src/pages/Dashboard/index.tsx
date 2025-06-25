import React from "react";
import { useUserPermissions } from "../../hooks";
import { SContainer } from "./styles";
import { DashFinance } from "./components/DashFinance";

export function Dashboard() {
    const { canDashFinance } = useUserPermissions();

    const DashCotacao: React.FC = () => {
        return (
            <>
                <h2>Dashboard</h2>
                <SContainer>
                    <iframe
                        title="Soja"
                        src="https://www.noticiasagricolas.com.br/widgets/cotacoes?id=23&fonte=Arial%2C%20Helvetica%2C%20sans-serif&tamanho=10pt&largura=400px&cortexto=333333&corcabecalho=B2C3C6&corlinha=DCE7E9&imagem=true"
                        width="420"
                        height="240"
                        frameBorder="0"
                        allowFullScreen
                    />

                    <iframe
                        title="Farelo de Soja"
                        src="https://www.noticiasagricolas.com.br/widgets/cotacoes?id=139&fonte=Arial%2C%20Helvetica%2C%20sans-serif&tamanho=10pt&largura=400px&cortexto=333333&corcabecalho=B2C3C6&corlinha=DCE7E9&imagem=true"
                        width="420"
                        height="240"
                        frameBorder="0"
                        allowFullScreen
                    />

                    <iframe
                        title="Milho"
                        src="https://www.noticiasagricolas.com.br/widgets/cotacoes?id=10&fonte=Arial%2C%20Helvetica%2C%20sans-serif&tamanho=10pt&largura=400px&cortexto=333333&corcabecalho=B2C3C6&corlinha=DCE7E9&imagem=true"
                        width="420"
                        height="240"
                        frameBorder="0"
                        allowFullScreen
                    />

                    <iframe
                        title="Dolar"
                        src="https://www.noticiasagricolas.com.br/widgets/cotacoes?id=232&fonte=Arial%2C%20Helvetica%2C%20sans-serif&tamanho=10pt&largura=400px&cortexto=333333&corcabecalho=B2C3C6&corlinha=DCE7E9&imagem=true"
                        width="420"
                        height="240"
                        frameBorder="0"
                        allowFullScreen
                    />
                </SContainer>
            </>
        );
    };

    return <>{canDashFinance ? <DashFinance /> : <DashCotacao />}</>;
}

/*
// Fazer endpoint no back-end
return {
quantityForYear: 159.738.010,
quantityForMounth: 3.000.000,
accumulateContractsForProductByYear: {
    { category: "Jan", value: totalOleo / 3 },
    { category: "Fev", value: totalOleo / 2 },
    { category: "Mar", value: totalOleo / 1 },
    { category: "Abr", value: 0 },
    { category: "Mai", value: 0 },
    { category: "Jun", value: 0 },
    { category: "Jul", value: 0 },
    { category: "Ago", value: 0 },
    { category: "Set", value: 0 },
    { category: "Out", value: 0 },
    { category: "Nov", value: 0 },
    { category: "Dez", value: 0 },

},
accumulateQuantityForBrokerByYear: {
    ????
}
}

*/
