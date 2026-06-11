import { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import type { UserRole } from "@/api/users/users.types";

export type AuthMode =
  | "login"
  | "register-role"
  | "register-personal"
  | "register-commerce";

export const useAuthScreen = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleContinue = (role: UserRole) => {
    setSelectedRole(role);
    setMode("register-personal");
  };

  const handlePersonalBack = () => setMode("register-role");
  const handlePersonalContinue = () => setMode("register-commerce");
  const handleCommerceBack = () => setMode("register-personal");

  const handleGoToLogin = () => {
    setSelectedRole(null);
    setMode("login");
  };

  const handleGoToRegister = () => setMode("register-role");

  // Intercepta el botón físico de retroceso (Android) para navegar entre modos
  // en lugar de salir de la pantalla
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (mode === "register-personal") {
        handlePersonalBack();
        return true;
      }
      if (mode === "register-commerce") {
        handleCommerceBack();
        return true;
      }
      if (mode === "register-role") {
        handleGoToLogin();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [mode]);

  return {
    mode,
    selectedRole,
    handleRoleContinue,
    handlePersonalBack,
    handlePersonalContinue,
    handleCommerceBack,
    handleGoToLogin,
    handleGoToRegister,
  };
};

// Expo Router requires a default export in app/ — this file is a hook, not a screen
export default function _() {
  return null;
}
