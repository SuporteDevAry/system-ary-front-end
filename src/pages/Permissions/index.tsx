import { useEffect, useState } from "react";
import {
  SCard,
  SCardContent,
  SCardIcon,
  SContainer,
  SCardContainer,
  SToogle,
  SPermissionsContainer,
  SDisplayContainer,
  SBoxButton,
  SBoxImage,
  SBoxPermissionButton,
} from "./styles";

import { LiaUserShieldSolid } from "react-icons/lia";
import { getPermissionsFromToken } from "../../contexts/AuthProvider/util";
import CustomButton from "../../components/CustomButton";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import CustomInput from "../../components/CustomInput";

import { GrUserAdmin } from "react-icons/gr";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import { TiContacts } from "react-icons/ti";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { ModalUsers } from "./components/ModalUsers";

interface IPermissions {
  [key: string]: boolean;
}

export function Permissions() {
  const [isUserModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const permissionsLinks = [
    {
      label: "Admin",
      icon: <GrUserAdmin size={40} />,
      key: "ADMIN",
    },
    {
      label: "Dashboard",
      icon: <MdOutlineDashboardCustomize size={40} />,
      key: "DASHBOARD",
    },
    {
      label: "Clientes",
      icon: <IoIosPeople size={40} />,
      key: "CLIENTES",
    },
    {
      label: "Contatos",
      icon: <TiContacts size={40} />,
      key: "CONTATOS",
    },
    {
      label: "Financeiro",
      icon: <FaMoneyCheckDollar size={40} />,
      key: "FINANCEIRO",
    },
  ];

  const initialPermissions: IPermissions = permissionsLinks.reduce(
    (acc, { key }) => {
      acc[key] = false;
      return acc;
    },
    {} as IPermissions
  );
  const [permissions, setPermissions] =
    useState<IPermissions>(initialPermissions);

  const [formData, setFormData] = useState({
    name: selectedUser?.name,
    email: selectedUser?.email,
  });

  const handleToggle = (permission: string) => {
    console.log(permissions);
    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [permission]: !prevPermissions[permission],
    }));
  };

  useEffect(() => {
    const permissionsToken = getPermissionsFromToken();
    console.log(permissionsToken);
    // Atualizar o estado das permissões com base no token
    const updatedPermissions = { ...initialPermissions };
    permissionsToken?.forEach((permission) => {
      if (permission in updatedPermissions) {
        updatedPermissions[permission] = true;
      }
    });
    setPermissions(updatedPermissions);
  }, []);

  const handleCreate = (selectedUserData: { name: string; email: string }) => {
    setSelectedUser(selectedUserData);

    setFormData({
      name: selectedUserData.name,
      email: selectedUserData.email,
    });
  };

  const handleOpenUserModal = async () => {
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setUserModalOpen(false);
  };

  const handleUpdatePermissions = () => {
    alert("Oi, Olá!!");
  };

  return (
    <>
      <SContainer>
        <SDisplayContainer>
          <SBoxImage>
            <LiaUserShieldSolid size={100} />
          </SBoxImage>

          <Box>
            <CustomInput
              label="Nome:"
              type="text"
              name="name"
              value={formData.name}
              readOnly
            />
          </Box>
          <Box>
            <CustomInput
              type="email"
              label="E-mail:"
              name="email"
              value={formData.email}
              readOnly
            />
          </Box>
          <SBoxButton>
            <CustomButton
              variant="success"
              width="260px"
              onClick={handleOpenUserModal}
              disabled={!!formData.email}
            >
              Selecionar usuário
            </CustomButton>
          </SBoxButton>
          <SBoxPermissionButton>
            <CustomButton
              variant="success"
              width="260px"
              onClick={handleUpdatePermissions}
              disabled={!formData.email}
            >
              Atualizar permissões
            </CustomButton>
          </SBoxPermissionButton>
        </SDisplayContainer>

        <Divider orientation="vertical" flexItem />

        <SPermissionsContainer>
          {permissionsLinks.map(({ label, icon, key }) => (
            <SCardContainer key={key}>
              <SCard>
                <SCardIcon>{icon}</SCardIcon>
                <SCardContent>{label}</SCardContent>
                <SToogle
                  checked={permissions[key]}
                  onChange={() => handleToggle(key)}
                />
              </SCard>
            </SCardContainer>
          ))}
        </SPermissionsContainer>
      </SContainer>

      <ModalUsers
        open={isUserModalOpen}
        onClose={handleCloseUserModal}
        onConfirm={handleCreate}
      />
    </>
  );
}
