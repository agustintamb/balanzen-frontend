import { create } from "zustand";
import type { UserRole } from "@/api/users/users.types";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  has_address: boolean;
  has_selected_address: boolean;
  photo_url?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isInitialized: boolean;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (token: string | null) => void;
  setHasAddress: (hasAddress: boolean) => void;
  setHasSelectedAddress: (val: boolean) => void;
  setInitialized: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setHasAddress: (hasAddress) =>
    set((state) => ({
      user: state.user ? { ...state.user, has_address: hasAddress } : null,
    })),
  setHasSelectedAddress: (val) =>
    set((state) => ({
      user: state.user ? { ...state.user, has_selected_address: val } : null,
    })),
  setInitialized: () => set({ isInitialized: true }),
  clear: () => set({ user: null, accessToken: null }),
}));
