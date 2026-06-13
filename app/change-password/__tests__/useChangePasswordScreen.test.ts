import { act, renderHook } from "@testing-library/react-native";
import { useForm } from "react-hook-form";
import { useChangePassword } from "@/hooks/useAuth";
import { useToast } from "@/stores/ui.store";
import useChangePasswordDefaultExport, {
  changePasswordSchema,
  useChangePasswordScreen,
} from "../useChangePasswordScreen";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useForm: jest.fn(),
}));

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: jest.fn(() => jest.fn()),
}));

jest.mock("@/hooks/useAuth", () => ({
  useChangePassword: jest.fn(),
}));

jest.mock("@/stores/ui.store", () => ({
  useToast: jest.fn(),
}));

const VALID_VALUES = {
  current_password: "OldPass1",
  new_password: "NewPass1a",
  confirm_password: "NewPass1a",
};

const mockBack = jest.fn();
const mockMutateAsync = jest.fn();
const mockShowSuccess = jest.fn();
let capturedSubmitCb: ((v: typeof VALID_VALUES) => Promise<void>) | undefined;

const setupMocks = ({ isValid = true, isSubmitting = false } = {}) => {
  capturedSubmitCb = undefined;
  const mockHandleSubmit = jest.fn((cb: typeof capturedSubmitCb) => {
    capturedSubmitCb = cb;
    return jest.fn();
  });
  (useForm as jest.Mock).mockReturnValue({
    control: {},
    handleSubmit: mockHandleSubmit,
    formState: { isValid, isSubmitting },
  });
  (useChangePassword as jest.Mock).mockReturnValue({
    mutateAsync: mockMutateAsync,
  });
  (useToast as jest.Mock).mockReturnValue({ showSuccess: mockShowSuccess });
  const { useRouter } = require("expo-router");
  (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

describe("useChangePasswordScreen", () => {
  describe("initial state", () => {
    it("exposes control, isValid, isSubmitting, handleBack and handleSave", () => {
      const { result } = renderHook(() => useChangePasswordScreen());
      expect(result.current.control).toBeDefined();
      expect(result.current.isValid).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.handleBack).toBeTruthy();
      expect(result.current.handleSave).toBeTruthy();
    });

    it("reflects isValid=false when form is invalid", () => {
      setupMocks({ isValid: false });
      const { result } = renderHook(() => useChangePasswordScreen());
      expect(result.current.isValid).toBe(false);
    });
  });

  describe("handleBack", () => {
    it("calls router.back()", () => {
      const { result } = renderHook(() => useChangePasswordScreen());
      act(() => {
        result.current.handleBack();
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleSave — submit callback", () => {
    it("calls changePassword with the form values on success path", async () => {
      mockMutateAsync.mockResolvedValueOnce(undefined);
      renderHook(() => useChangePasswordScreen());
      await act(async () => {
        await capturedSubmitCb!(VALID_VALUES);
      });
      expect(mockMutateAsync).toHaveBeenCalledWith(VALID_VALUES);
    });

    it("shows success toast after changePassword resolves", async () => {
      mockMutateAsync.mockResolvedValueOnce(undefined);
      renderHook(() => useChangePasswordScreen());
      await act(async () => {
        await capturedSubmitCb!(VALID_VALUES);
      });
      expect(mockShowSuccess).toHaveBeenCalledWith("Contraseña actualizada");
    });

    it("navigates back after changePassword resolves", async () => {
      mockMutateAsync.mockResolvedValueOnce(undefined);
      renderHook(() => useChangePasswordScreen());
      await act(async () => {
        await capturedSubmitCb!(VALID_VALUES);
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("does not navigate back when changePassword throws", async () => {
      mockMutateAsync.mockRejectedValueOnce(new Error("Wrong password"));
      renderHook(() => useChangePasswordScreen());
      await act(async () => {
        await capturedSubmitCb!(VALID_VALUES);
      });
      expect(mockBack).not.toHaveBeenCalled();
      expect(mockShowSuccess).not.toHaveBeenCalled();
    });
  });

  describe("default export", () => {
    it("returns null — Expo Router required dummy export", () => {
      expect(useChangePasswordDefaultExport()).toBeNull();
    });
  });
});

describe("changePasswordSchema", () => {
  it("accepts valid data with matching passwords", () => {
    const result = changePasswordSchema.safeParse({
      current_password: "OldPass1",
      new_password: "NewPass1a",
      confirm_password: "NewPass1a",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when new_password and confirm_password do not match", () => {
    const result = changePasswordSchema.safeParse({
      current_password: "OldPass1",
      new_password: "NewPass1a",
      confirm_password: "Different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("confirm_password");
    }
  });
});
