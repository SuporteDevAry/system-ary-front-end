import React, { useCallback, useEffect, useState } from "react";
import {
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import { ContractContext } from "../../../contexts/ContractContext";
import { IContractData } from "../../../contexts/ContractContext/types";
import { toast } from "react-toastify";
import { SChartContainer, SContainer, SDashboardContainer } from "./styles";

const COLORS = [
    "#8884d8", // oleo
    "#A349A4", // sebo bovino
    "#B97A57", // farelo
];

export function DashMiOleo() {
    const contractContext = ContractContext();
    const [listcontracts, setListContracts] = useState<IContractData[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const response = await contractContext.listContracts();

            setListContracts(response.data);
        } catch (error) {
            toast.error(
                `Erro ao tentar ler contratos, contacte o administrador do sistema: ${error}`
            );
        } finally {
        }
    }, [contractContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const nameMonth = [
        "",
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
    ];

    // let data = produtos.filter(produto => produto.name_product === "SOJA em Grãos");

    // let totalSoja = produtos
    // .filter(produto => produto.name_product === "SOJA em Grãos") // Filtra apenas os produtos desejados
    // .reduce((acc, produto) => acc + produto.quantidade, 0); // Soma as quantidades

    const currentDate = new Date(); // Obtém a data atual

    // retirar comentario do +1 utilizei para pegar contratos de maio/25

    const currentMonth = currentDate.getMonth() + 1; // Mês atual (0 = Janeiro, 1 = Fevereiro, ..., 11 = Dezembro)
    const currentYear = currentDate.getFullYear(); // Ano atual

    // const contractYear = listcontracts.filter((contract) => {
    //     return (
    //         new Date(contract.contract_emission_date).getFullYear() ===
    //         currentYear
    //     );
    // });

    const contractYear = listcontracts;
    const contractMonth = listcontracts.filter((contract) => {
        let partes = contract.contract_emission_date.split("/");
        let mesEmissao = parseInt(partes[1], 10);

        return mesEmissao === currentMonth;
    });

    let totalYear = Math.round(
        contractYear
            .filter(
                (contract) =>
                    contract.name_product === "ÓLEO DE SOJA a Granel" ||
                    contract.name_product === "SEBO BOVINO" ||
                    contract.name_product === "FARELO DE SOJA a Granel"
            )
            .reduce((acc, contract) => acc + Number(contract.quantity), 0) /
            1000
    );

    var totalMes = Math.round(
        contractMonth
            .filter(
                (contract) =>
                    contract.name_product === "ÓLEO DE SOJA a Granel" ||
                    contract.name_product === "SEBO BOVINO" ||
                    contract.name_product === "FARELO DE SOJA a Granel"
            )
            .reduce((acc, contract) => acc + Number(contract.quantity), 0) /
            1000
    );

    // Total Gráfico Mês
    let monthOleo = Math.round(
        contractMonth
            .filter(
                (contract) => contract.name_product === "ÓLEO DE SOJA a Granel"
            )
            .reduce((acc, contract) => acc + Number(contract.quantity), 0) /
            1000
    );

    let monthSebo = Math.round(
        contractMonth
            .filter((contract) => contract.name_product === "SEBO BOVINO")
            .reduce((acc, contract) => acc + Number(contract.quantity), 0) /
            1000
    );

    let monthFarelo = Math.round(
        contractMonth
            .filter(
                (contract) =>
                    contract.name_product === "FARELO DE SOJA a Granel"
            )
            .reduce((acc, contract) => acc + Number(contract.quantity), 0) /
            1000
    );

    // Total Gráfico ANO
    let totalOleo = Math.round(
        contractYear
            .filter(
                (contract) => contract.name_product === "ÓLEO DE SOJA a Granel"
            )
            .reduce((acc, contract) => acc + Number(contract.quantity), 0) /
            1000
    );

    let totalSebo = Math.round(
        contractYear
            .filter((contract) => contract.name_product === "SEBO BOVINO")
            .reduce((acc, contract) => acc + Number(contract.quantity), 0) /
            1000
    );

    let totalFarelo = Math.round(
        contractYear
            .filter(
                (contract) =>
                    contract.name_product === "FARELO DE SOJA a Granel"
            )
            .reduce((acc, contract) => acc + Number(contract.quantity), 0) /
            1000
    );

    const dataYear = [
        { name: "Óleo", value: totalOleo },
        { name: "Sebo Bovino", value: totalSebo },
        { name: "Farelo", value: totalFarelo },
    ];
    const dataMonth = [
        { name: "Óleo", value: monthOleo },
        { name: "Sebo Bovino", value: monthSebo },
        { name: "Farelo", value: monthFarelo },
    ];

    const YearPieChartOleo: React.FC = () => {
        return (
            <SChartContainer>
                {/* <Typography variant="h6" align="center">
                    Acumulado por Produtos
                </Typography> */}
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart width={200} height={100}>
                        <Pie
                            data={dataYear}
                            //cx={50}
                            //cy={100}
                            innerRadius={70}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={1}
                            dataKey="value"
                        >
                            {dataYear.map((_entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <text
                            x="38%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={20}
                            fontWeight="bold"
                            fill="#333"
                        >
                            {currentYear}
                        </text>
                        <Tooltip />
                        {/* <Legend verticalAlign="bottom" height={50} /> */}
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                        />
                    </PieChart>
                </ResponsiveContainer>
            </SChartContainer>
        );
    };

    const MonthPieChartOleo: React.FC = () => {
        return (
            <SChartContainer>
                {/* <Typography variant="h6" align="center">
                    Mesa SOJA
                </Typography> */}
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart width={200} height={100}>
                        <Pie
                            data={dataMonth}
                            //cx={50}
                            //cy={100}
                            innerRadius={70}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={1}
                            dataKey="value"
                        >
                            {dataMonth.map((_entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <text
                            x="38%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={20}
                            fontWeight="bold"
                            fill="#333"
                        >
                            {nameMonth[currentMonth]}
                        </text>
                        <Tooltip />
                        {/* <Legend verticalAlign="bottom" height={50} /> */}
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                        />
                    </PieChart>
                </ResponsiveContainer>
            </SChartContainer>
        );
    };

    const DashFinanceOleo: React.FC = () => {
        return (
            <>
                <SContainer>
                    <SDashboardContainer>
                        <Typography variant="h4" align="center" gutterBottom>
                            Estatísticas de Contratos - MI - Óleo
                        </Typography>
                        <Typography variant="h6" align="center" gutterBottom>
                            (Em toneladas métricas)
                        </Typography>
                        <Grid container spacing={3}>
                            {/* Seção de contratos acumulados */}
                            <Grid item xs={6} sm={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">
                                            Quantidade acumulada em{" "}
                                            {currentYear}
                                        </Typography>
                                        <Typography variant="h4">
                                            {" "}
                                            {totalYear.toLocaleString(
                                                "pt-BR"
                                            )}{" "}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} sm={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">
                                            Quantidade acumulada em{" "}
                                            {nameMonth[currentMonth]}
                                        </Typography>
                                        <Typography variant="h4">
                                            {totalMes.toLocaleString("pt-BR")}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Gráfico PieChart */}
                            <Grid item xs={12} md={6}>
                                <YearPieChartOleo />
                            </Grid>
                            {/* Gráfico BarChart */}
                            <Grid item xs={12} md={6}>
                                <MonthPieChartOleo />
                            </Grid>
                        </Grid>
                    </SDashboardContainer>
                </SContainer>
            </>
        );
    };

    return (
        <>
            <DashFinanceOleo />
        </>
    );
}
