import apiClient from "@/api/client";
import {
  ChangePasswordBody,
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
} from "@/api/auth/auth.types";

export const authService = {
  register: (body: RegisterBody): Promise<RegisterResponse> =>
    apiClient.post("/auth/register", body),

  login: (body: LoginBody): Promise<LoginResponse> =>
    apiClient.post("/auth/login", body),

  refresh: (): Promise<{ access_token: string }> =>
    apiClient.post("/auth/refresh"),

  logout: (): Promise<void> => apiClient.post("/auth/logout"),

  changePassword: (body: ChangePasswordBody): Promise<{ message: string }> =>
    apiClient.put("/auth/password", body),
};
