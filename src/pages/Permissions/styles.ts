import styled from "styled-components";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import { V } from "../../styles/variables";
import Box from "@mui/material/Box";

export const SContainer = styled.div`
  width: 100%;
  display: flex;
  margin: 0px auto;
  flex: 1;
`;

export const SDisplayContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 32px;
  gap: 8px;
`;

export const SPermissionsContainer = styled(Box)`
  width: 50%;
  display: flex;
  flex-wrap: wrap;
  padding-left: 32px;
`;

export const SCardContainer = styled(Box)``;

export const SCard = styled(Card)`
  height: 130px;
  width: 180px;
  padding: ${V.mdSpacing};
  margin: ${V.mdSpacing};
  border-radius: 8px;

  &.MuiCard-root {
    background-color: ${(props) => props.theme["gray-100"]};
  }

  gap: 16px;
  align-content: space-between;
`;

export const SCardIcon = styled.div`
  display: flex;
`;

export const SCardContent = styled.div`
  display: inline-flex;
  padding-top: 8px;
`;

export const SToogle = styled(Switch)`
  float: right;

  span {
    &.MuiSwitch-switchBase.Mui-checked {
      color: ${(props) => props.theme["green-300"]};
    }

    &.Mui-checked + .MuiSwitch-track {
      background-color: ${(props) => props.theme["green-300"]};
    }
  }
`;

export const SBoxButton = styled(Box)`
  padding-left: 60px;
`;

export const SBoxImage = styled(Box)`
  padding-left: 30px;
`;

export const SBoxPermissionButton = styled(Box)`
  /* display: flex;
  justify-content: center;
  padding-left: 95px;
  padding-top: 32px; */
  padding-left: 60px;
`;
