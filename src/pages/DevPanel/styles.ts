import styled from "styled-components";
import { V } from "../../styles/variables";

export const STitle = styled.h2`
  padding-left: ${V.mdSpacing};
`;

export const SContainer = styled.div`
  padding: 0 ${V.mdSpacing};
`;

export const SChartContainer = styled.div`
  width: 100%;
  padding: 16px 0 32px;
`;

export const SPre = styled.pre`
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

export const SOnlineStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const SOnlineDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00a335;
  box-shadow: 0 0 0 3px rgba(0, 163, 53, 0.2);
`;

export const SUpdatedAt = styled.div`
  padding-left: ${V.mdSpacing};
  padding-bottom: 8px;
  font-size: 12px;
  opacity: 0.7;
`;
