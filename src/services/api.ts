import axios from "axios";
import { getUserLocalStorage } from "../contexts/AuthProvider/util";

export const Api = axios.create({
  baseURL: process.env.URL_API_NODE,
});

Api.interceptors.request.use(
  (config) => {
    const user = getUserLocalStorage();

    config.headers.Authorization = user?.token;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
