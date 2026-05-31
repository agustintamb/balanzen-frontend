import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "@/api/client";
import { usersService } from "@/api/users/users.service";
import { useAuthStore } from "@/stores/auth.store";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setAccessToken, setInitialized } = useAuthStore();

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          setAuthToken(token);
          setAccessToken(token);
          const user = await usersService.getMe();
          setUser({
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            has_address: user.has_address,
            has_selected_address: user.selected_address !== null,
            photo_url: user.photo_url,
          });
        }
      } catch {
        // Token inválido o expirado — limpiar
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        setAuthToken(null);
      } finally {
        setInitialized();
      }
    };
    loadAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};

export default AuthProvider;
