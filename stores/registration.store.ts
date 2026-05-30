import { create } from "zustand";

export interface PersonalData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dni: string;
}

interface RegistrationState {
  personalData: PersonalData | null;
  setPersonalData: (data: PersonalData) => void;
  clear: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  personalData: null,
  setPersonalData: (personalData) => set({ personalData }),
  clear: () => set({ personalData: null }),
}));
