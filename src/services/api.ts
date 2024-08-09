import axios from "axios";
import axiosRetry from "axios-retry";
import {
  getUserLocalStorage,
  setUserLocalStorage,
} from "../contexts/AuthProvider/util";
import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

    if (error.response && error.response.status === 401) {
      setUserLocalStorage(null);

      navigate("/login");
    }

    return Promise.reject(error);
  }
);
