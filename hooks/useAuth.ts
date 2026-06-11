import { useMutation } from "@tanstack/react-query";
import { authService } from "@/api/auth/auth.service";
import {
  ChangePasswordBody,
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
} from "@/api/auth/auth.types";

export const useRegister = () =>
  useMutation<RegisterResponse, Error, RegisterBody>({
    mutationFn: authService.register,
  });

export const useLogin = () =>
  useMutation<LoginResponse, Error, LoginBody>({
    mutationFn: authService.login,
  });

export const useLogout = () =>
  useMutation<void, Error>({
    mutationFn: authService.logout,
  });

export const useRefreshToken = () =>
  useMutation<{ access_token: string }, Error>({
    mutationFn: authService.refresh,
  });

export const useChangePassword = () =>
  useMutation<{ message: string }, Error, ChangePasswordBody>({
    mutationFn: authService.changePassword,
  });
