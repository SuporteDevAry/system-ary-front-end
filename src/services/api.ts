import axios from "axios";
import axiosRetry from "axios-retry";
import {
  deleteUserLocalStorage,
  getUserLocalStorage,
  setUserLocalStorage,
} from "../contexts/AuthProvider/util";

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
    return Promise.reject(error);
  }
);

Api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      setUserLocalStorage(null);

      window.location.href = "/login";
    }

    /* Toda vem que der algum erro de aplicação, exemplo: token expirar, ele limpa o token do localstorage
     * Isso será melhorado com um valida token, futuramente
     */
    // if (error.response && error.response.status === 500) {
    //   deleteUserLocalStorage();
    // }

    return Promise.reject(error);
  }
);
