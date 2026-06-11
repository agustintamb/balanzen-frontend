import { BackHandler } from "react-native";
import { act, renderHook } from "@testing-library/react-native";
import type { UserRole } from "@/api/users/users.types";
import useAuthScreenDefaultExport, {
  useAuthScreen,
} from "@/app/(auth)/useAuthScreen";

beforeEach(() => {
  jest
    .spyOn(BackHandler, "addEventListener")
    .mockReturnValue({ remove: jest.fn() } as ReturnType<
      typeof BackHandler.addEventListener
    >);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// Helper to extract and invoke the registered hardwareBackPress callback
const getBackPressCallback = (): (() => boolean) => {
  const calls = (BackHandler.addEventListener as jest.Mock).mock.calls;
  const lastCall = calls[calls.length - 1];
  return lastCall[1] as () => boolean;
};

describe("useAuthScreen", () => {
  describe("initial state", () => {
    it("should start in login mode", () => {
      const { result } = renderHook(() => useAuthScreen());

      expect(result.current.mode).toBe("login");
    });

    it("should have selectedRole as null initially", () => {
      const { result } = renderHook(() => useAuthScreen());

      expect(result.current.selectedRole).toBeNull();
    });
  });

  describe("handleGoToRegister", () => {
    it("should change mode to register-role when handleGoToRegister is called", () => {
      const { result } = renderHook(() => useAuthScreen());

      act(() => {
        result.current.handleGoToRegister();
      });

      expect(result.current.mode).toBe("register-role");
    });
  });

  describe("handleRoleContinue", () => {
    it("should set selectedRole and change mode to register-personal when handleRoleContinue is called with CONSUMIDOR", () => {
      const { result } = renderHook(() => useAuthScreen());
      const role: UserRole = "CONSUMIDOR";

      act(() => {
        result.current.handleRoleContinue(role);
      });

      expect(result.current.selectedRole).toBe("CONSUMIDOR");
      expect(result.current.mode).toBe("register-personal");
    });

    it("should set selectedRole and change mode to register-personal when handleRoleContinue is called with COMERCIO", () => {
      const { result } = renderHook(() => useAuthScreen());
      const role: UserRole = "COMERCIO";

      act(() => {
        result.current.handleRoleContinue(role);
      });

      expect(result.current.selectedRole).toBe("COMERCIO");
      expect(result.current.mode).toBe("register-personal");
    });
  });

  describe("handleGoToLogin", () => {
    it("should change mode to login and clear selectedRole when handleGoToLogin is called", () => {
      const { result } = renderHook(() => useAuthScreen());

      act(() => {
        result.current.handleRoleContinue("COMERCIO");
      });

      act(() => {
        result.current.handleGoToLogin();
      });

      expect(result.current.mode).toBe("login");
      expect(result.current.selectedRole).toBeNull();
    });
  });

  describe("hardwareBackPress handling", () => {
    it("should register a hardwareBackPress listener on mount", () => {
      renderHook(() => useAuthScreen());

      expect(BackHandler.addEventListener).toHaveBeenCalledWith(
        "hardwareBackPress",
        expect.any(Function),
      );
    });

    it("should remove the hardwareBackPress listener on unmount", () => {
      const remove = jest.fn();
      (BackHandler.addEventListener as jest.Mock).mockReturnValue({ remove });

      const { unmount } = renderHook(() => useAuthScreen());
      unmount();

      expect(remove).toHaveBeenCalledTimes(1);
    });

    it("should return false and not change mode when back is pressed in login mode", () => {
      const { result } = renderHook(() => useAuthScreen());

      const callback = getBackPressCallback();
      let handled: boolean | undefined;
      act(() => {
        handled = callback();
      });

      expect(handled).toBe(false);
      expect(result.current.mode).toBe("login");
    });

    it("should navigate to login and return true when back is pressed in register-role mode", () => {
      const { result } = renderHook(() => useAuthScreen());

      act(() => {
        result.current.handleGoToRegister();
      });

      const callback = getBackPressCallback();
      let handled: boolean | undefined;
      act(() => {
        handled = callback();
      });

      expect(handled).toBe(true);
      expect(result.current.mode).toBe("login");
    });

    it("should navigate to register-role and return true when back is pressed in register-personal mode", () => {
      const { result } = renderHook(() => useAuthScreen());

      act(() => {
        result.current.handleRoleContinue("CONSUMIDOR");
      });

      const callback = getBackPressCallback();
      let handled: boolean | undefined;
      act(() => {
        handled = callback();
      });

      expect(handled).toBe(true);
      expect(result.current.mode).toBe("register-role");
    });

    it("should navigate to register-personal and return true when back is pressed in register-commerce mode", () => {
      const { result } = renderHook(() => useAuthScreen());

      act(() => {
        result.current.handleRoleContinue("COMERCIO");
      });
      act(() => {
        result.current.handlePersonalContinue();
      });

      const callback = getBackPressCallback();
      let handled: boolean | undefined;
      act(() => {
        handled = callback();
      });

      expect(handled).toBe(true);
      expect(result.current.mode).toBe("register-personal");
    });
  });

  describe("full registration flow — mode transitions", () => {
    it("should traverse the full commerce registration flow in order", () => {
      const { result } = renderHook(() => useAuthScreen());

      expect(result.current.mode).toBe("login");

      act(() => {
        result.current.handleGoToRegister();
      });
      expect(result.current.mode).toBe("register-role");

      act(() => {
        result.current.handleRoleContinue("COMERCIO");
      });
      expect(result.current.mode).toBe("register-personal");
      expect(result.current.selectedRole).toBe("COMERCIO");

      act(() => {
        result.current.handlePersonalContinue();
      });
      expect(result.current.mode).toBe("register-commerce");
    });

    it("should go back to login from register-commerce via back press chain", () => {
      const { result } = renderHook(() => useAuthScreen());

      act(() => {
        result.current.handleRoleContinue("COMERCIO");
      });
      act(() => {
        result.current.handlePersonalContinue();
      });
      expect(result.current.mode).toBe("register-commerce");

      act(() => {
        result.current.handleCommerceBack();
      });
      expect(result.current.mode).toBe("register-personal");

      act(() => {
        result.current.handlePersonalBack();
      });
      expect(result.current.mode).toBe("register-role");

      act(() => {
        result.current.handleGoToLogin();
      });
      expect(result.current.mode).toBe("login");
    });
  });

  describe("default export", () => {
    it("should return null — Expo Router required dummy export", () => {
      expect(useAuthScreenDefaultExport()).toBeNull();
    });
  });
});
