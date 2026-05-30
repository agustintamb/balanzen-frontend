import axios from "axios";
import envConfig from "@/config/env";

let _authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  _authToken = token;
};

const apiClient = axios.create({
  baseURL: envConfig.API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (_authToken) config.headers.Authorization = `Bearer ${_authToken}`;
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Error desconocido";
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
