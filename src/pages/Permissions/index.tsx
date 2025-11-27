import { useCallback, useEffect, useMemo, useState } from "react";
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
import { CustomInput } from "../../components/CustomInput";
import { ModalUsers } from "./components/ModalUsers";
import { UserContext } from "../../contexts/UserContext";

// icons
import {
  AiOutlineIdcard,
  AiOutlineTeam,
  AiOutlineHome,
  AiOutlineSetting,
  AiOutlineDollar,
} from "react-icons/ai";
import {
  LiaUserShieldSolid,
  LiaFileContractSolid,
  LiaDev,
} from "react-icons/lia";
import { BiSearchAlt2 } from "react-icons/bi";
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

  /*Para inserir um novo icone/menu de acordo com a tela de permissão: src/components/Sidebar/index.tsx
   * Para inserir um novo card apenas na tela permissão: add no permissionLinks
   */
  const permissionsLinks = useMemo(
    () => [
      {
        label: "Dashboard",
        icon: <AiOutlineHome size={40} />,
        key: "DASHBOARD",
      },
      {
        label: "Dashboard Financeiro",
        icon: <AiOutlineHome size={40} />,
        key: "DASHFINANCE",
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
        label: "Execução",
        icon: <AiOutlineIdcard size={40} />,
        key: "EXECUCAO",
      },
      {
        label: "Cobrança",
        icon: <AiOutlineDollar size={40} />,
        key: "COBRANCA",
      },
      {
        label: "Relatórios",
        icon: <AiOutlineIdcard size={40} />,
        key: "RELATORIOS",
      },
      {
        label: "Admin",
        icon: <AiOutlineSetting size={40} />,
        key: "ADMIN",
      },
      {
        label: "Consulta",
        icon: <BiSearchAlt2 size={40} />,
        key: "CONSULTA",
      },
      {
        label: "Desenvolvimento",
        icon: <LiaDev size={40} />,
        key: "DEV",
      },
    ],
    []
  );

  const initialPermissions: IPermissions = useMemo(
    () =>
      permissionsLinks.reduce((acc, { key }) => {
        acc[key] = false;
        return acc;
      }, {} as IPermissions),
    [permissionsLinks]
  );

  const [permissions, setPermissions] =
    useState<IPermissions>(initialPermissions);

  const [formData, setFormData] = useState({
    name: selectedUser?.name,
    email: selectedUser?.email,
  });

  const handleToggle = useCallback((permission: string) => {
    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [permission]: !prevPermissions[permission],
    }));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if (formData.email) {
        const response = await userContext.listUserPermissionsByEmail(
          formData.email
        );
        setPermissionId(response.data.id);
        setPermissionsToken(response.data.rules);
      }
    } catch (error) {
      toast.error(`Erro ao tentar ler permissões por email:  ${error}`);
    }
  }, [formData.email, userContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  }, [permissionsToken, initialPermissions]);

  const handleCreate = useCallback(
    (selectedUserData: { name: string; email: string }) => {
      setSelectedUser(selectedUserData);

      setFormData({
        name: selectedUserData.name,
        email: selectedUserData.email,
      });
    },
    []
  );

  const handleOpenUserModal = useCallback(() => {
    setUserModalOpen(true);
  }, []);

  const handleCloseUserModal = useCallback(() => {
    setUserModalOpen(false);
  }, []);

  const handleUpdatePermissions = useCallback(async () => {
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
  }, [permissionId, permissions]);

  const handleClearInput = useCallback(() => {
    setFormData({
      name: "",
      email: "",
    });
    setSelectedUser(null);
    setPermissions(initialPermissions);
    setPermissionsToken([]);
  }, [initialPermissions]);

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
              $labelPosition="left"
              value={formData.name}
              readOnly
            />
          </Box>
          <Box>
            <CustomInput
              type="email"
              label="E-mail:"
              name="email"
              $labelPosition="left"
              value={formData.email}
              readOnly
            />
          </Box>
          <SBoxButton>
            <CustomButton
              $variant="success"
              width="260px"
              onClick={handleOpenUserModal}
              disabled={!!formData.email}
            >
              Selecionar usuário
            </CustomButton>
          </SBoxButton>
          <SBoxPermissionButton>
            <CustomButton
              $variant="success"
              width="260px"
              onClick={handleUpdatePermissions}
              disabled={!formData.email}
            >
              Atualizar permissões
            </CustomButton>
          </SBoxPermissionButton>
          <SBoxPermissionButton>
            <CustomButton
              $variant="danger"
              width="260px"
              onClick={handleClearInput}
              disabled={!formData.email}
            >
              Limpar campos
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
