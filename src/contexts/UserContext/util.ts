import { Api } from "../../services/api";
import { ICreateUserData } from "./types";

interface IUpdateUserData {
  name: string;
  email: string;
}

export const addUser = async (userData: ICreateUserData) => {
  try {
    const response = await Api.post("/api/user", userData);
    return response;
  } catch (error) {
    console.error("Error adding user:", error);
  }
};

export const updateUser = async (
  userId: string,
  updateUserData: IUpdateUserData
) => {
  try {
    const response = await Api.patch(`/api/user/${userId}`, updateUserData);
    return response;
  } catch (error) {
    console.error("Error updating user:", error);
  }
};
