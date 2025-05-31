import styled from "styled-components";
import { V } from "../../../../styles/variables";

export const STitle = styled.h2`
    padding-left: ${V.mdSpacing};
`;

export const SContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    // padding-top: 0px;
    max-height: 530px;

    grid-template-columns: repeat(auto-fit, minmax(200px, 2fr));

    @media (max-width: 768px), handheld and (orientation: landscape) {
        display: grid;
    }
`;

export const SDataGridAno = styled.div`
    height: auto;
    width: 100%;

    @media screen {
        .MuiDataGrid-toolbarContainer .MuiInputBase-root {
            display: none !important; /* Oculta o campo de pesquisa */
        }
    }

    @media print {
        .MuiDataGrid-toolbarContainer, /* Oculta a Toolbar */
    .MuiButtonBase-root,           /* Oculta botões de exportação */
    .MuiTablePagination-root {
            /* Oculta paginação */
            display: none !important;
        }

        .MuiDataGrid-root {
            width: 100% !important;
            height: auto !important;
        }

        body {
            zoom: 80%;
        }
    }
`;

export const SDataGridMes = styled.div`
    height: auto;
    width: 100%;

    @media screen {
        .MuiDataGrid-toolbarContainer .MuiInputBase-root {
            display: none !important; /* Oculta o campo de pesquisa */
        }
    }

    @media print {
        .MuiDataGrid-toolbarContainer, /* Oculta a Toolbar */
    .MuiButtonBase-root,           /* Oculta botões de exportação */
    .MuiTablePagination-root {
            /* Oculta paginação */
            display: none !important;
        }

        .MuiDataGrid-root {
            width: 100% !important;
            height: 100% !important;
        }

        body {
            zoom: 80%;
        }
    }
`;
