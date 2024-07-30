import { ApiCustom } from "../../services/api";
import { IUser, IUserDataFromToken, Token } from "./types";

export function setUserLocalStorage(user: IUser | null) {
  localStorage.setItem("#u", JSON.stringify(user));
}

export function getUserLocalStorage() {
  const json = localStorage.getItem("#u");

  if (!json) {
    return null;
  }

  const user = JSON.parse(json);

  return user ?? null;
}

export async function LoginRequest(
  email: string,
  password: string
): Promise<IUser> {
  try {
    const request = await ApiCustom.post("/login", { email, password });
    return request.data;
  } catch (error) {
    throw error;
  }
}

export function getPermissionsFromToken(): string[] | null {
  const user = getUserLocalStorage();

  if (user && user.token) {
    try {
      const token = JSON.parse(atob(user.token.split(".")[1])) as Token;
      return token.permissions || [];
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  }

  return null;
}

export function getDataUserFromToken(): IUserDataFromToken | null {
  const user = getUserLocalStorage();

  if (user && user.token) {
    try {
      const token = JSON.parse(atob(user.token.split(".")[1]));
      return token;
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  }

  return null;
}
