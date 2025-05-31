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
import { SContainer, SDataGridAno } from "./styles";
import { Typography } from "@mui/material";
import { toast } from "react-toastify";

export function Invoicing() {
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

    const currentDate = new Date(); // Obtém a data atual
    const currentYear = currentDate.getFullYear(); // Ano atual

    const contratosAnoAtual = listcontracts.filter((contrato) => {
        return (
            new Date(contrato.contract_emission_date).getFullYear() ===
            currentYear
        );
    });

    const columnsContract: GridColDef[] = [
        { field: "contract_emission_date", headerName: "DATA", width: 100 },
        { field: "product", headerName: "SIGLA", width: 70 },
        { field: "number_contract", headerName: "CONTRATO", width: 130 },
        {
            field: "seller",
            headerName: "VENDEDOR",
            width: 200,
            valueFormatter: (params: object) => {
                const value = (params as any).name;
                return value;
            },
        },
        {
            field: "buyer",
            headerName: "COMPRADOR",
            width: 200,
            valueFormatter: (params: object) => {
                const value = (params as any).name;
                return value;
            },
        },
        {
            field: "quantity",
            headerName: "QUANTIDADE",
            width: 130,
            valueFormatter: (params: any) => {
                const value = Number(params).toLocaleString("pt-BR");
                return value;
            },
            headerAlign: "right",
            align: "right",
        },
    ];

    const CustomToolbar = () => (
        <GridToolbarContainer>
            <GridToolbarFilterButton />
            <GridToolbarExport />
        </GridToolbarContainer>
    );

    return (
        <>
            <SContainer>
                <SDataGridAno>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Faturamento - Ano {currentYear}
                    </Typography>
                    <DataGrid
                        localeText={{
                            toolbarFilters: "Filtros",
                            toolbarExport: "Exportar",
                            toolbarExportCSV: "Exportar em CSV",
                            toolbarExportPrint: "Imprimir",
                        }}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 15 } },
                        }}
                        sortingOrder={[]} // impede o usuário de mudar a ordenação
                        autosizeOnMount
                        //disableColumnFilter
                        disableColumnSelector
                        disableDensitySelector
                        disableColumnSorting={true}
                        disableColumnMenu={true}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                            },
                        }}
                        rows={contratosAnoAtual}
                        columns={columnsContract}
                        rowHeight={25}
                        slots={{ toolbar: CustomToolbar }}
                        //components={{ Toolbar: CustomToolbar }}
                        //autoHeight
                    />
                </SDataGridAno>
            </SContainer>
        </>
    );
}
