import { useCallback, useEffect, useState } from "react";
import { ContractContext } from "../../../../contexts/ContractContext";
import { IContractData } from "../../../../contexts/ContractContext/types";
import {
    DataGrid,
    GridColDef,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { SContainer, SDataGridAno, STitle } from "./styles";
import { Typography } from "@mui/material";
import { toast } from "react-toastify";

export function GrainsBigger() {
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
        }
    }, [contractContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const contratosAnoAtual = listcontracts.filter((contrato) => {
        return (
            new Date(contrato.contract_emission_date).getFullYear() ===
            currentYear
        );
    });

    // Obtem compradores e produtos únicos
    const compradores = [
        ...new Set(contratosAnoAtual.map((c) => c.buyer?.name)),
    ];
    const produtos = [...new Set(contratosAnoAtual.map((c) => c.product))];

    // Cria dados no formato pivot
    const pivotData = compradores.map((comprador, index) => {
        const row: any = { id: index, comprador };

        produtos.forEach((produto) => {
            const contratos = contratosAnoAtual.filter(
                (c) => c.buyer?.name === comprador && c.product === produto
            );

            const total = contratos.reduce(
                (acc, cur) => acc + Number(cur.quantity),
                0
            );
            row[produto] = total > 0 ? total.toLocaleString("pt-BR") : "";
        });

        return row;
    });

    // Define colunas dinamicamente
    const pivotColumns: GridColDef[] = [
        { field: "comprador", headerName: "COMPRADOR", width: 200 },
        ...produtos.map((produto) => ({
            field: produto,
            headerName: produto,
            width: 120,
            align: "right",
            headerAlign: "right",
        })),
    ];

    const CustomToolbar = () => (
        <GridToolbarContainer>
            <GridToolbarFilterButton />
            <GridToolbarExport />
        </GridToolbarContainer>
    );

    return (
        <>
            <STitle>Grãos Maiores Compradores</STitle>
            <SContainer>
                <SDataGridAno>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Ano {currentYear}
                    </Typography>
                    <DataGrid
                        localeText={{
                            toolbarFilters: "Filtros",
                            toolbarExport: "Exportar",
                            toolbarExportCSV: "Exportar em CSV",
                            toolbarExportPrint: "Imprimir",
                        }}
                        rows={pivotData}
                        columns={pivotColumns}
                        //paginationModel={{ pageSize: 15 }}
                        rowHeight={25}
                        disableColumnSelector
                        disableColumnMenu
                        disableDensitySelector
                        slots={{ toolbar: CustomToolbar }}
                    />
                </SDataGridAno>
            </SContainer>
        </>
    );
}
