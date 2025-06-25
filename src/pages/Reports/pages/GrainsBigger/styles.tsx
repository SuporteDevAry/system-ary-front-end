import styled from "styled-components";
import { V } from "../../../../styles/variables";

export const GridWrapper = styled.div`
    /* Estilos normais do grid, se quiser */

    @media print {
        /* Esconde a toolbar personalizada */
        .MuiDataGrid-toolbarContainer {
            display: none !important;
        }

        /* Esconde o rodapé com paginação */
        .MuiDataGrid-footerContainer {
            display: none !important;
        }

        /* Se tiver botões fora do DataGrid, selecione por classe/id */
        .no-print {
            display: none !important;
        }
    }
`;

export const STitle = styled.h2`
    padding-left: ${V.mdSpacing};
    display: flex;
    gap: 4;
    flex-direction: row;
`;

export const SContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    padding-top: 30px;
    max-height: 500px;

    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

    @media (max-width: 768px), handheld and (orientation: landscape) {
        display: grid;
    }
`;

export const SDataGridAno = styled.div`
    height: auto;
    width: 100%;

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
            zoom: 100%;
        }
    }
`;

export const SContainerSearchAndButton = styled.div`
    display: flex;
    gap: ${V.mdSpacing};
    flex-direction: row;
    padding-top: ${V.smSpacing};
    padding-bottom: ${V.mdSpacing};
    margin-left: -16px;
`;
