import { useAuthBackHandler } from "./_hooks/useAuthBackHandler";
import { useAuthStateMachine } from "./_hooks/useAuthStateMachine";

export type AuthMode =
  | "login"
  | "register-role"
  | "register-personal"
  | "register-commerce";

export const useAuthScreen = () => {
  const {
    mode,
    selectedRole,
    handleRoleContinue,
    handlePersonalBack,
    handlePersonalContinue,
    handleCommerceBack,
    handleGoToLogin,
    handleGoToRegister,
  } = useAuthStateMachine();

  useAuthBackHandler({
    mode,
    onPersonalBack: handlePersonalBack,
    onCommerceBack: handleCommerceBack,
    onRoleBack: handleGoToLogin,
  });

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
