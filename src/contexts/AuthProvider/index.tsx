import { createContext, useContext, useEffect, useState } from "react";
import { IAuthProvider, IContext, IUser } from "./types";
import { LoginRequest, getUserLocalStorage, setUserLocalStorage } from "./util";

export const AuthContext = createContext<IContext>({} as IContext);

export const AuthProvider = ({ children }: IAuthProvider) => {
  const [user, setUser] = useState<IUser | null>();

  const loadUser = () => {
    const user = getUserLocalStorage();
    if (user) {
      setUser(user);
    }
  };

  useEffect(loadUser, []);

  async function authenticate(
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      const response = await LoginRequest(email, password);

      const payload = { token: response?.token, email: response?.email };

      setUser(payload);
      setUserLocalStorage(payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  function logout() {
    setUser(null);
    setUserLocalStorage(null);
  }

  return (
    <AuthContext.Provider value={{ ...user, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  return context;
};
