import { createContext, useContext } from "react";
import { IUserProvider } from "./types";
import { Api } from "../../services/api";

interface IUserContext {
  listUsers: () => Promise<any>;
  createUser: (userData: ICreateUserData) => Promise<any>;
  updateUsers: (userId: string, updateUserData: any) => void;
  deleteUser: (userId: string) => void;
}

interface ICreateUserData {
  name: string;
  email: string;
  password: string;
}

interface IUpdateUserData {
  name: string;
  email: string;
}

const newContext = createContext<IUserContext>({
  listUsers: () => Promise.resolve([]),
  createUser: () => Promise.resolve(),
  updateUsers: () => {},
  deleteUser: () => {},
});

export const UserProvider = ({ children }: IUserProvider) => {
  async function listUsers(): Promise<any> {
    try {
      const response = await Api.get("/users");
      return response;
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  }

  async function createUser(userData: ICreateUserData): Promise<any> {
    try {
      const response = await Api.post("/user", userData);

      return response;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async function updateUsers(userId: string, updateUserData: IUpdateUserData) {
    try {
      const response = await Api.patch(`/user/${userId}`, updateUserData);
      return response;
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  async function deleteUser(userId: string) {
    try {
      const response = await Api.delete(`/user/${userId}`);

      return response;
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  return (
    <newContext.Provider
      value={{ listUsers, createUser, updateUsers, deleteUser }}
    >
      {children}
    </newContext.Provider>
  );
};

export const UserContext = () => {
  const context = useContext(newContext);

  return context;
};
