import styled from "styled-components";
import { Link } from "react-router-dom";
import { V, btnReset } from "../../styles/variables";

interface isOpenProps {
  isOpen: boolean;
}

interface isActiveProps {
  isActive: boolean;
}

export const SSidebar = styled.div<isOpenProps>`
  width: ${(isOpen) => (!isOpen ? `auto` : V.sidebarWidth)};
  background: ${({ theme }) => theme["white-100"]};

  height: 100vh;
  padding: ${V.mdSpacing};

  position: relative;
`;

export const SSidebarButton = styled.button<isOpenProps>`
  ${btnReset};
  position: absolute;
  top: ${V.xxlSpacing};
  right: ${(isOpen) => (isOpen ? `-16px` : `-40px`)};
  width: 32px;
  height: 32px;
  border-radius: ${V.borderRadiusMid};
  background: ${({ theme }) => theme["white-100"]};
  box-shadow: 0 0 4px ${({ theme }) => theme["gray-200"]},
    0 0 7px ${({ theme }) => theme["gray-300"]};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  transform: ${(isOpen) => (!isOpen ? `rotate(180deg)` : `initial`)};
`;

export const SLogo = styled.div`
  width: 52px;

  img {
    max-width: 100%;
    height: auto;
  }
  cursor: pointer;

  margin-bottom: ${V.lgSpacing};
`;

export const SDivider = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme["gray-100"]};
  margin: ${V.lgSpacing} 0;
`;

export const SLinkContainer = styled.div<isActiveProps>`
  background: ${({ theme, isActive }) =>
    !isActive ? `transparent` : theme["gray-300"]};
  border-radius: ${V.borderRadius};
  margin: 8px 0;

  &:hover {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme["gray-300"]};
  }
`;

export const SLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  font-size: 16px;
  padding: calc(${V.smSpacing} - 2px) 0;
`;

export const SLinkIcon = styled.div`
  padding: ${V.smSpacing} ${V.mdSpacing};
  display: flex;

  svg {
    font-size: 20px;
  }
`;

export const SLinkLabel = styled.span`
  display: block;
  flex: 1;
  margin-left: ${V.smSpacing};
`;

export const SLinkNotification = styled.div`
  font-size: 14px;
  padding: calc(${V.smSpacing} / 2) ${V.smSpacing};
  border-radius: calc(${V.borderRadius} / 2);
  background: ${({ theme }) => theme["yellow-100"]};
  color: black;

  margin-right: ${V.mdSpacing};
`;
