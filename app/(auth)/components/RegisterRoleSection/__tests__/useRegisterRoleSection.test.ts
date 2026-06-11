import { act, renderHook } from "@testing-library/react-native";
import type { UserRole } from "@/api/users/users.types";
import RoleDefault, { useRegisterRoleSection } from "../useRegisterRoleSection";

afterEach(() => {
  jest.clearAllMocks();
});

describe("useRegisterRoleSection", () => {
  describe("initial state", () => {
    it("should initialize selectedRole as null", () => {
      const { result } = renderHook(() => useRegisterRoleSection());

      expect(result.current.selectedRole).toBeNull();
    });

    it("should expose setSelectedRole as a function", () => {
      const { result } = renderHook(() => useRegisterRoleSection());

      expect(typeof result.current.setSelectedRole).toBe("function");
    });
  });

  describe("selectRole — CONSUMIDOR", () => {
    it("should set selectedRole to CONSUMIDOR when called with CONSUMIDOR", () => {
      const { result } = renderHook(() => useRegisterRoleSection());

      act(() => {
        result.current.setSelectedRole("CONSUMIDOR");
      });

      expect(result.current.selectedRole).toBe("CONSUMIDOR");
    });

    it("should keep selectedRole as CONSUMIDOR after multiple calls with the same value", () => {
      const { result } = renderHook(() => useRegisterRoleSection());

      act(() => {
        result.current.setSelectedRole("CONSUMIDOR");
      });
      act(() => {
        result.current.setSelectedRole("CONSUMIDOR");
      });

      expect(result.current.selectedRole).toBe("CONSUMIDOR");
    });
  });

  describe("selectRole — COMERCIO", () => {
    it("should set selectedRole to COMERCIO when called with COMERCIO", () => {
      const { result } = renderHook(() => useRegisterRoleSection());

      act(() => {
        result.current.setSelectedRole("COMERCIO");
      });

      expect(result.current.selectedRole).toBe("COMERCIO");
    });
  });

  describe("role switching", () => {
    it("should update selectedRole from CONSUMIDOR to COMERCIO", () => {
      const { result } = renderHook(() => useRegisterRoleSection());

      act(() => {
        result.current.setSelectedRole("CONSUMIDOR");
      });
      act(() => {
        result.current.setSelectedRole("COMERCIO");
      });

      expect(result.current.selectedRole).toBe("COMERCIO");
    });

    it("should update selectedRole from COMERCIO to CONSUMIDOR", () => {
      const { result } = renderHook(() => useRegisterRoleSection());

      act(() => {
        result.current.setSelectedRole("COMERCIO");
      });
      act(() => {
        result.current.setSelectedRole("CONSUMIDOR");
      });

      expect(result.current.selectedRole).toBe("CONSUMIDOR");
    });
  });

  describe("reset to null", () => {
    it("should allow resetting selectedRole back to null after a role was selected", () => {
      const { result } = renderHook(() => useRegisterRoleSection());

      act(() => {
        result.current.setSelectedRole("CONSUMIDOR");
      });
      act(() => {
        result.current.setSelectedRole(null);
      });

      expect(result.current.selectedRole).toBeNull();
    });
  });

  describe("type safety", () => {
    it("should accept any valid UserRole value", () => {
      const { result } = renderHook(() => useRegisterRoleSection());
      const validRoles: UserRole[] = ["CONSUMIDOR", "COMERCIO"];

      validRoles.forEach((role) => {
        act(() => {
          result.current.setSelectedRole(role);
        });
        expect(result.current.selectedRole).toBe(role);
      });
    });
  });

  describe("state isolation between hook instances", () => {
    it("should not share state between two separate hook instances", () => {
      const { result: instanceA } = renderHook(() => useRegisterRoleSection());
      const { result: instanceB } = renderHook(() => useRegisterRoleSection());

      act(() => {
        instanceA.current.setSelectedRole("CONSUMIDOR");
      });

      expect(instanceA.current.selectedRole).toBe("CONSUMIDOR");
      expect(instanceB.current.selectedRole).toBeNull();
    });
  });

  describe("default export", () => {
    it("should return null (Expo Router compatibility shim)", () => {
      expect(RoleDefault()).toBeNull();
    });
  });
});
