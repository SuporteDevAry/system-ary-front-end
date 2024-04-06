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

import CustomButton from "../../components/CustomButton";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import CustomInput from "../../components/CustomInput";
import { ModalUsers } from "./components/ModalUsers";
import { UserContext } from "../../contexts/UserContext";

// icons
import {
  AiOutlineIdcard,
  AiOutlineTeam,
  AiOutlineHome,
  AiOutlineSetting,
} from "react-icons/ai";
import { LiaUserShieldSolid, LiaFileContractSolid } from "react-icons/lia";
import { toast } from "react-toastify";

interface IPermissions {
  [key: string]: boolean;
}

export function Permissions() {
  const userContext = UserContext();
  const [isUserModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const [permissionsToken, setPermissionsToken] = useState([]);
  const [permissionId, setPermissionId] = useState<string>();

  const permissionsLinks = [
    {
      label: "Dashboard",
      icon: <AiOutlineHome size={40} />,
      key: "DASHBOARD",
    },
    {
      label: "Contratos",
      icon: <LiaFileContractSolid size={40} />,
      key: "CONTRATOS",
    },
    {
      label: "Clientes",
      icon: <AiOutlineTeam size={40} />,
      key: "CLIENTES",
    },
    {
      label: "Contatos",
      icon: <AiOutlineIdcard size={40} />,
      key: "CONTATOS",
    },
    {
      label: "Admin",
      icon: <AiOutlineSetting size={40} />,
      key: "ADMIN",
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
    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [permission]: !prevPermissions[permission],
    }));
  };

  const fetchData = async () => {
    try {
      if (formData.email) {
        const response = await userContext.listUserPermissionsByEmail(
          formData.email
        );
        setPermissionId(response.data.id);
        setPermissionsToken(response.data.rules);
      }
    } catch (error) {
      toast.error(`Error fetching permissions by email:  ${error}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formData.email]);

  useEffect(() => {
    if (permissionsToken.length > 0) {
      const updatedPermissions = { ...initialPermissions };
      permissionsToken?.forEach((permission) => {
        if (permission in updatedPermissions) {
          updatedPermissions[permission] = true;
        }
      });
      setPermissions(updatedPermissions);
    }
  }, [permissionsToken]);

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

  const handleUpdatePermissions = async () => {
    if (!permissionId) {
      toast.error("ID da permissão não definido, para realizar atualização!");
      return;
    }

    try {
      const updatedRules = Object.entries(permissions)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      await userContext.updateUserPermissions(permissionId, updatedRules);

      toast.success(
        `Permissões do usuário ${formData.name} atualizado com sucesso!`
      );
    } catch (error) {
      toast.error(`Erro ao atualizar permissões: ${error}`);
    }
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
