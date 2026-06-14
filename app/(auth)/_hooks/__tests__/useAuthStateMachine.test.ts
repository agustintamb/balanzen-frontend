import { act, renderHook } from "@testing-library/react-native";
import useAuthStateMachineDefaultExport, {
  useAuthStateMachine,
} from "../useAuthStateMachine";

describe("useAuthStateMachine", () => {
  it("starts in login mode with no selected role", () => {
    const { result } = renderHook(() => useAuthStateMachine());
    expect(result.current.mode).toBe("login");
    expect(result.current.selectedRole).toBeNull();
  });

  it("handleGoToRegister transitions to register-role", () => {
    const { result } = renderHook(() => useAuthStateMachine());
    act(() => {
      result.current.handleGoToRegister();
    });
    expect(result.current.mode).toBe("register-role");
  });

  it("handleRoleContinue sets role and moves to register-personal", () => {
    const { result } = renderHook(() => useAuthStateMachine());
    act(() => {
      result.current.handleRoleContinue("CONSUMIDOR");
    });
    expect(result.current.selectedRole).toBe("CONSUMIDOR");
    expect(result.current.mode).toBe("register-personal");
  });

  it("handleRoleContinue works with COMERCIO role", () => {
    const { result } = renderHook(() => useAuthStateMachine());
    act(() => {
      result.current.handleRoleContinue("COMERCIO");
    });
    expect(result.current.selectedRole).toBe("COMERCIO");
    expect(result.current.mode).toBe("register-personal");
  });

  it("handlePersonalBack returns to register-role", () => {
    const { result } = renderHook(() => useAuthStateMachine());
    act(() => {
      result.current.handleRoleContinue("CONSUMIDOR");
    });
    act(() => {
      result.current.handlePersonalBack();
    });
    expect(result.current.mode).toBe("register-role");
  });

  it("handlePersonalContinue moves to register-commerce", () => {
    const { result } = renderHook(() => useAuthStateMachine());
    act(() => {
      result.current.handleRoleContinue("COMERCIO");
    });
    act(() => {
      result.current.handlePersonalContinue();
    });
    expect(result.current.mode).toBe("register-commerce");
  });

  it("handleCommerceBack returns to register-personal", () => {
    const { result } = renderHook(() => useAuthStateMachine());
    act(() => {
      result.current.handleRoleContinue("COMERCIO");
    });
    act(() => {
      result.current.handlePersonalContinue();
    });
    act(() => {
      result.current.handleCommerceBack();
    });
    expect(result.current.mode).toBe("register-personal");
  });

  it("handleGoToLogin resets role and returns to login", () => {
    const { result } = renderHook(() => useAuthStateMachine());
    act(() => {
      result.current.handleRoleContinue("CONSUMIDOR");
    });
    act(() => {
      result.current.handleGoToLogin();
    });
    expect(result.current.mode).toBe("login");
    expect(result.current.selectedRole).toBeNull();
  });

  it("default export returns null — Expo Router required dummy", () => {
    expect(useAuthStateMachineDefaultExport()).toBeNull();
  });
});
