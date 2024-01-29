import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider/useAuth";
import { useEffect } from "react";

export function Logout() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      auth.logout();
      navigate("/login");
    };

    handleLogout();
  }, []);

  return (
    <div>
      <p>Fazendo logout...</p>
    </div>
  );
}
