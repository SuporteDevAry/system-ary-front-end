import { useEffect, useState } from "react";
import { getDataUserFromToken } from "../../contexts/AuthProvider/util";
import { IUserDataFromToken } from "../../contexts/AuthProvider/types";
import { ModalEditUser } from "../Users/components/ModalEditUser";
import CustomButton from "../../components/CustomButton";
import { IListUser } from "../../contexts/UserContext/types";
import { UserContext } from "../../contexts/UserContext";
import { SContainer, SMain, SName, STitle, SValue } from "./styles";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { toast } from "react-toastify";

export function MyAccount(): JSX.Element {
  const userContext = UserContext();
  const [tokenUser, setTokenUser] = useState<IUserDataFromToken | null>(null);
  const [fullUser, setFullUser] = useState<IListUser | null>(null);
  const [isEditUserModalOpen, setEditUserModalOpen] = useState(false);

  useEffect(() => {
    const userInfo = getDataUserFromToken();
    setTokenUser(userInfo);
  }, []);

  useEffect(() => {
    const fetchFullUser = async () => {
      if (tokenUser?.email) {
        try {
          const response = await userContext.listUsers();
          const found = response.data.find(
            (u: IListUser) => u.email === tokenUser.email
          );
          if (found) {
            setFullUser(found);
          } else {
            toast.error("Usuário completo não encontrado.");
          }
        } catch (error) {
          toast.error("Erro ao buscar dados completos do usuário.");
        }
      }
    };

    fetchFullUser();
  }, [tokenUser]);

  const handleCloseEditUserModal = () => {
    setEditUserModalOpen(false);
  };

  const handleOpenEditUserModal = () => {
    if (fullUser) {
      setEditUserModalOpen(true);
    } else {
      toast.error("Não foi possível carregar os dados do usuário.");
    }
  };

  return (
    <>
      <SContainer>
        <STitle>Minha Conta</STitle>

        <SMain>
          <SName>
            Olá,<SValue>{tokenUser?.name}</SValue>
          </SName>

          <SName>
            E-mail: <SValue>{tokenUser?.email}</SValue>
          </SName>

          <SName>
            Permissões:
            <Stack direction="row" spacing={1}>
              {tokenUser?.permissions?.map((i) => (
                <Chip key={i} label={i} size="small" variant="outlined" />
              ))}
            </Stack>
          </SName>
        </SMain>

        <SMain>
          <CustomButton
            $variant={"success"}
            width="120px"
            onClick={handleOpenEditUserModal}
          >
            Alterar Senha
          </CustomButton>
        </SMain>
      </SContainer>

      {fullUser && (
        <ModalEditUser
          open={isEditUserModalOpen}
          onClose={handleCloseEditUserModal}
          user={fullUser}
          readOnly
          titleText="Alterar Senha"
        />
      )}
    </>
  );
}
