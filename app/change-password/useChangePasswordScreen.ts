import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useChangePassword } from "@/hooks/useAuth";
import { useToast } from "@/stores/ui.store";

export const useChangePasswordScreen = () => {
  const router = useRouter();
  const { mutateAsync: changePassword, isPending } = useChangePassword();
  const { showSuccess } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleBack = () => router.back();

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Completá todos los campos");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas nuevas no coinciden");
      return;
    }
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showSuccess("Contraseña actualizada");
      router.back();
    } catch {
      // Error manejado globalmente por QueryProvider
    }
  };

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isPending,
    handleBack,
    handleSave,
  };
};

// Expo Router requires a default export in app/ — this is a hook, not a screen
export default function _() {
  return null;
}