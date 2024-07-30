import axios from "axios";
import axiosRetry from "axios-retry";
import { getUserLocalStorage } from "../contexts/AuthProvider/util";

export const ApiCustom = axios.create({
  baseURL: process.env.URL_API_NODE,
  headers: {
    "Cache-Control": "no-cache",
  },
});

export const Api = axios.create({
  baseURL: process.env.URL_API_NODE,
  headers: {
    "Cache-Control": "no-cache",
  },
});

axiosRetry(Api, { retries: 3 });

Api.interceptors.request.use(
  (config) => {
    const user = getUserLocalStorage();

    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);
