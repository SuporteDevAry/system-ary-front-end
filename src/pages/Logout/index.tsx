import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { toast } from "react-toastify";

export function Logout() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await auth.logout();
        navigate("/login");
      } catch (error) {
        toast.error(
          `Erro ao tentar sair do sistema, contacte o administrador do sistema ${error}`
        );
      }
    };

    handleLogout();
  }, [auth, navigate]);

  return (
    <div>
      <div>Fazendo logout...</div>
    </div>
  );
}
