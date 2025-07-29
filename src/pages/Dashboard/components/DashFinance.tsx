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
    "#00A335", // soja
    "#413ea0", // milho
    "#D72735", // trigo
    "#ff7300", // sorgo
    "#8884d8", // oleo
    "#A349A4", // sebo bovino
    "#B97A57", // farelo
];

export function DashFinance() {
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

    const validProducts = ["O", "F", "OC", "OA", "SB", "EP"];

    let totalYear = contractYear.reduce((acc, contract) => {
        const quantity = validProducts.includes(contract.product)
            ? Number(contract.quantity)
            : Number(contract.quantity) / 1000;
        return acc + quantity;
    }, 0);

    let totalMes =
        /*Math.round(*/
        contractMonth.reduce((acc, contract) => {
            const quantity = validProducts.includes(contract.product)
                ? Number(contract.quantity)
                : Number(contract.quantity) / 1000;
            return acc + quantity;
        }, 0);
    3;
    /*)*/

    // Total Gráfico Mês
    let monthSoja = Math.round(
        contractMonth
            .filter((contract) => contract.name_product === "SOJA em Grãos")
            .reduce(
                (acc, contract) => acc + Number(contract.quantity) / 1000,
                0
            )
    );
    let monthMilho = Math.round(
        contractMonth
            .filter((contract) => contract.name_product === "MILHO em Grãos")
            .reduce(
                (acc, contract) => acc + Number(contract.quantity) / 1000,
                0
            )
    );
    let monthTrigo = Math.round(
        contractMonth
            .filter((contract) => contract.name_product === "TRIGO")
            .reduce(
                (acc, contract) => acc + Number(contract.quantity) / 1000,
                0
            )
    );
    let monthSorgo = Math.round(
        contractMonth
            .filter((contract) => contract.name_product === "SORGO")
            .reduce(
                (acc, contract) => acc + Number(contract.quantity) / 1000,
                0
            )
    );
    let monthOleo = Math.round(
        contractMonth
            .filter(
                (contract) => contract.name_product === "ÓLEO DE SOJA a Granel"
            )
            .reduce((acc, contract) => acc + Number(contract.quantity), 0)
    );
    let monthSebo = Math.round(
        contractMonth
            .filter((contract) => contract.name_product === "SEBO BOVINO")
            .reduce((acc, contract) => acc + Number(contract.quantity), 0)
    );
    let monthFarelo = Math.round(
        contractMonth
            .filter(
                (contract) =>
                    contract.name_product === "FARELO DE SOJA a Granel"
            )
            .reduce((acc, contract) => acc + Number(contract.quantity), 0)
    );

    // Total Gráfico ANO
    let totalSoja = Math.round(
        contractYear
            .filter((contract) => contract.name_product === "SOJA em Grãos")
            .reduce(
                (acc, contract) => acc + Number(contract.quantity) / 1000,
                0
            )
    );
    let totalMilho = Math.round(
        contractYear
            .filter((contract) => contract.name_product === "MILHO em Grãos")
            .reduce(
                (acc, contract) => acc + Number(contract.quantity) / 1000,
                0
            )
    );
    let totalTrigo = Math.round(
        contractYear
            .filter((contract) => contract.name_product === "TRIGO")
            .reduce(
                (acc, contract) => acc + Number(contract.quantity) / 1000,
                0
            )
    );
    let totalSorgo = Math.round(
        contractYear
            .filter((contract) => contract.name_product === "SORGO")
            .reduce(
                (acc, contract) => acc + Number(contract.quantity) / 1000,
                0
            )
    );
    let totalOleo = Math.round(
        contractYear
            .filter(
                (contract) => contract.name_product === "ÓLEO DE SOJA a Granel"
            )
            .reduce((acc, contract) => acc + Number(contract.quantity), 0)
    );
    let totalSebo = Math.round(
        contractYear
            .filter((contract) => contract.name_product === "SEBO BOVINO")
            .reduce((acc, contract) => acc + Number(contract.quantity), 0)
    );
    let totalFarelo = Math.round(
        contractYear
            .filter(
                (contract) =>
                    contract.name_product === "FARELO DE SOJA a Granel"
            )
            .reduce((acc, contract) => acc + Number(contract.quantity), 0)
    );

    const dataYear = [
        { name: "Soja", value: totalSoja },
        { name: "Milho", value: totalMilho },
        { name: "Trigo", value: totalTrigo },
        { name: "Sorgo", value: totalSorgo },
        { name: "Óleo", value: totalOleo },
        { name: "Sebo Bovino", value: totalSebo },
        { name: "Farelo", value: totalFarelo },
    ];
    const dataMonth = [
        { name: "Soja", value: monthSoja },
        { name: "Milho", value: monthMilho },
        { name: "Trigo", value: monthTrigo },
        { name: "Sorgo", value: monthSorgo },
        { name: "Óleo", value: monthOleo },
        { name: "Sebo Bovino", value: monthSebo },
        { name: "Farelo", value: monthFarelo },
    ];

    const YearPieChart: React.FC = () => {
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
                            x="39%"
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

    const MonthPieChart: React.FC = () => {
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
                            x="39%"
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

    const DashFinance: React.FC = () => {
        return (
            <>
                <SContainer>
                    <SDashboardContainer>
                        <Typography variant="h4" align="center" gutterBottom>
                            Estatísticas de Contratos - MI
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
                                <YearPieChart />
                            </Grid>
                            {/* Gráfico BarChart */}
                            <Grid item xs={12} md={6}>
                                <MonthPieChart />
                            </Grid>
                        </Grid>
                    </SDashboardContainer>
                </SContainer>
            </>
        );
    };

    return (
        <>
            <DashFinance />
        </>
    );
}
