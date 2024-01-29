import { useAuth } from "../../contexts/AuthProvider/useAuth";

export const ProtectedLayout = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth();
  console.log(auth);
  //Pegar as permissões e validar de acordo com as mesmas!!

  if (!auth.token) {
    return <h1>Que pena! Você não tem acesso a essa página!</h1>;
  }

  return children;
};
