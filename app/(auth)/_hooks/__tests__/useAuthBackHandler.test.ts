import { renderHook } from "@testing-library/react-native";
import { BackHandler } from "react-native";
import useAuthBackHandlerDefaultExport, {
  useAuthBackHandler,
} from "../useAuthBackHandler";

describe("useAuthBackHandler", () => {
  let capturedHandler: (() => boolean) | null = null;
  let removeMock: jest.Mock;

  beforeEach(() => {
    capturedHandler = null;
    removeMock = jest.fn();
    jest.spyOn(BackHandler, "addEventListener").mockImplementation((_, cb) => {
      capturedHandler = cb as () => boolean;
      return { remove: removeMock };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setup = (mode: string) => {
    const onPersonalBack = jest.fn();
    const onCommerceBack = jest.fn();
    const onRoleBack = jest.fn();
    const { unmount } = renderHook(() =>
      useAuthBackHandler({
        mode: mode as Parameters<typeof useAuthBackHandler>[0]["mode"],
        onPersonalBack,
        onCommerceBack,
        onRoleBack,
      }),
    );
    return { onPersonalBack, onCommerceBack, onRoleBack, unmount };
  };

  it("calls onPersonalBack and returns true in register-personal mode", () => {
    const { onPersonalBack } = setup("register-personal");
    expect(capturedHandler?.()).toBe(true);
    expect(onPersonalBack).toHaveBeenCalledTimes(1);
  });

  it("calls onCommerceBack and returns true in register-commerce mode", () => {
    const { onCommerceBack } = setup("register-commerce");
    expect(capturedHandler?.()).toBe(true);
    expect(onCommerceBack).toHaveBeenCalledTimes(1);
  });

  it("calls onRoleBack and returns true in register-role mode", () => {
    const { onRoleBack } = setup("register-role");
    expect(capturedHandler?.()).toBe(true);
    expect(onRoleBack).toHaveBeenCalledTimes(1);
  });

  it("returns false in login mode", () => {
    setup("login");
    expect(capturedHandler?.()).toBe(false);
  });

  it("removes the listener on unmount", () => {
    const { unmount } = setup("login");
    unmount();
    expect(removeMock).toHaveBeenCalledTimes(1);
  });

  it("default export returns null — Expo Router required dummy", () => {
    expect(useAuthBackHandlerDefaultExport()).toBeNull();
  });
});
