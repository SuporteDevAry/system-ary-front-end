import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthProvider";

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
