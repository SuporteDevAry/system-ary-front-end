import styled from "styled-components";
import Card from "@mui/material/Card";
import { V } from "../../styles/variables";


export const STitle = styled.h1`
  padding-left: ${V.mdSpacing};
`;

export const SContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 30px;

  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

  @media (max-width: 768px), handheld and (orientation: landscape) {
    display: grid;
  }
`;

export const SCard = styled(Card)`
  height: 200px;
  width: 300px;
  padding: ${V.mdSpacing};
  margin: ${V.mdSpacing};

  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  }

  &.MuiCard-root {
    background-color: ${(props) => props.theme["yellow-200"]};
  }

  @media (max-width: 420px), handheld and (orientation: landscape) {

    height: 100px;
    width: 100px;
  }
`;

export const SCardIcon = styled.div`
  display: flex;
`;

export const SContent = styled.div`
  display: flex;
  padding: 30px 0px 0px 0px;
  font-weight: bold;
  letter-spacing: 2px;
`;
