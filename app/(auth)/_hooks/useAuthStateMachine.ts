import { useState } from "react";
import type { UserRole } from "@/api/users/users.types";
import type { AuthMode } from "../useAuthScreen";

interface UseAuthStateMachineResult {
  mode: AuthMode;
  selectedRole: UserRole | null;
  handleRoleContinue: (role: UserRole) => void;
  handlePersonalBack: () => void;
  handlePersonalContinue: () => void;
  handleCommerceBack: () => void;
  handleGoToLogin: () => void;
  handleGoToRegister: () => void;
}

export const useAuthStateMachine = (): UseAuthStateMachineResult => {
  // ─── State ────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<AuthMode>("login");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // ─── Handlers ─────────────────────────────────────────────────────────────
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

export default function _() {
  return null;
}
