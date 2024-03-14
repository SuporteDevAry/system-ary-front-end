import { useEffect, useState } from "react";
import {
  SCard,
  SCardContent,
  SCardIcon,
  SContainer,
  SCardContainer,
  SFormContainer,
  SToogle,
  SPermissionsContainer,
  SNameInput,
  SEmailInput,
  SDisplayContainer,
} from "./styles";

import { FiCheckSquare } from "react-icons/fi";
import { LiaUserShieldSolid } from "react-icons/lia";
import { getPermissionsFromToken } from "../../contexts/AuthProvider/util";

interface IPermissions {
  [key: string]: boolean;
}

export function Permissions() {
  const permissionsLinks = [
    {
      label: "Admin",
      icon: <FiCheckSquare size={40} />,
      key: "ADMIN",
    },
    {
      label: "Dashboard",
      icon: <FiCheckSquare size={40} />,
      key: "DASHBOARD",
    },
    {
      label: "Clientes",
      icon: <FiCheckSquare size={40} />,
      key: "CLIENTES",
    },
    {
      label: "Contatos",
      icon: <FiCheckSquare size={40} />,
      key: "CONTATOS",
    },
    {
      label: "Financeiro",
      icon: <FiCheckSquare size={40} />,
      key: "FINANCEIRO",
    },
    {
      label: "Corretores",
      icon: <FiCheckSquare size={40} />,
      key: "CORRETORES",
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
    // name: user.name,
    // email: user.email,
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
    setFormData({
      //   name: user.name ?? "",
      //   email: user.email ?? "",
    });
  }, []);

  return (
    <>
      <SContainer>
        <SFormContainer>
          <SDisplayContainer>
            <LiaUserShieldSolid size={100} />
            <div>
              <label>Nome:</label>
              <SNameInput type="text" name="name" value={formData.name} />
            </div>
            <div>
              <label>E-mail:</label>
              <SEmailInput type="email" name="email" value={formData.email} />
            </div>
          </SDisplayContainer>
        </SFormContainer>

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
    </>
  );
}
