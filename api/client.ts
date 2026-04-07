import envConfig from "@/config/env";
import axios from "axios";

const apiClient = axios.create({
  baseURL: envConfig.API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
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
