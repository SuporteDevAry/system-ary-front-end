import styled from "styled-components";
import { V } from "../../../../styles/variables";

export const STitle = styled.h2``;

export const SContainer = styled.div`
  width: 100%;
`;

export const SContainerSearchAndButton = styled.div`
  display: flex;
  gap: ${V.mdSpacing};
  flex-direction: row;
  padding-top: ${V.smSpacing};
  padding-bottom: ${V.mdSpacing};
  margin-left: -16px;
`;

export const SCustomTableWrapper = styled.div`
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 8px;
  }

  /* Exemplo: alinhar colunas numéricas à direita */
  td:nth-child(5),
  td:nth-child(6),
  td:nth-child(7),
  td:nth-child(8) {
    text-align: right;
  }

  /* Cabeçalhos das mesmas colunas também */
  th:nth-child(5),
  th:nth-child(6),
  th:nth-child(7),
  th:nth-child(8) {
    text-align: right;
  }
`;
