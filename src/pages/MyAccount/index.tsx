import { FiUser } from "react-icons/fi";
import { SContainer, SMain, SName, STitle, SValue } from "./styles";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import { useEffect, useState } from "react";
import { getDataUserFromToken } from "../../contexts/AuthProvider/util";
import { IUserDataFromToken } from "../../contexts/AuthProvider/types";

export const MyAccount: React.FC = () => {
  const [user, setUser] = useState<IUserDataFromToken | null>();

  useEffect(() => {
    const userInfo = getDataUserFromToken();
    setUser(userInfo);
  }, []);

  return (
    <SContainer>
      <STitle>Minha Conta</STitle>

      <SMain>
        <FiUser size={100} />

        <SName>
          Olá,<SValue>{user?.name}</SValue>
        </SName>

        <SName>
          E-mail: <SValue>{user?.email}</SValue>
        </SName>

        <SName>Permissões: </SName>

        <Stack direction="row" spacing={1}>
          {user?.permissions?.map((i) => (
            <Chip key={i} label={i} size="small" variant="outlined" />
          ))}
        </Stack>
      </SMain>
    </SContainer>
  );
};
