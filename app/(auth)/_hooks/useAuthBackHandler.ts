import { useEffect } from "react";
import { BackHandler } from "react-native";
import type { AuthMode } from "../useAuthScreen";

interface UseAuthBackHandlerParams {
  mode: AuthMode;
  onPersonalBack: () => void;
  onCommerceBack: () => void;
  onRoleBack: () => void;
}

export const useAuthBackHandler = ({
  mode,
  onPersonalBack,
  onCommerceBack,
  onRoleBack,
}: UseAuthBackHandlerParams): void => {
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (mode === "register-personal") {
        onPersonalBack();
        return true;
      }
      if (mode === "register-commerce") {
        onCommerceBack();
        return true;
      }
      if (mode === "register-role") {
        onRoleBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [mode, onPersonalBack, onCommerceBack, onRoleBack]);
};

export default function _() {
  return null;
}
