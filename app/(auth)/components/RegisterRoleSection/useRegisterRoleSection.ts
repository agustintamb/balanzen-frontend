import { useState } from "react";
import type { UserRole } from "@/api/users/users.types";

export const useRegisterRoleSection = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  return { selectedRole, setSelectedRole };
};

// Expo Router requires a default export in app/ — this file is a hook, not a screen
// eslint-disable-next-line import/no-default-export
export default function _() { return null; }
