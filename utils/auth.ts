import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "@/api/client";
import type { AuthUser } from "@/stores/auth.store";

export const persistSession = async (
  tokens: { access_token: string; refresh_token: string },
  user: AuthUser,
  setAccessToken: (token: string | null) => void,
  setUser: (user: AuthUser | null) => void,
): Promise<void> => {
  await SecureStore.setItemAsync("access_token", tokens.access_token);
  await SecureStore.setItemAsync("refresh_token", tokens.refresh_token);
  setAuthToken(tokens.access_token);
  setAccessToken(tokens.access_token);
  setUser(user);
};
