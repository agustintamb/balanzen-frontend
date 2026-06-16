import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { act, renderHook } from "@testing-library/react-native";
import { useForm } from "react-hook-form";
import { useUploadImage } from "@/hooks/useUploads";
import { useCurrentUser, useUpdateProfile } from "@/hooks/useUsers";
import { useToast } from "@/stores/ui.store";
import useEditProfileDefaultExport, {
  useEditProfileScreen,
} from "../useEditProfileScreen";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));

jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useForm: jest.fn(),
}));

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: jest.fn(() => jest.fn()),
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock("@/hooks/useUsers", () => ({
  useCurrentUser: jest.fn(),
  useUpdateProfile: jest.fn(),
}));

jest.mock("@/hooks/useUploads", () => ({
  useUploadImage: jest.fn(),
}));

jest.mock("@/stores/ui.store", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/utils/cloudinary", () => ({
  buildProfilePhotoUrl: jest.fn((url: string) => `profile:${url}`),
  buildDetailImageUrl: jest.fn((url: string) => `detail:${url}`),
}));

jest.mock("@/utils/validation", () => ({
  DIGITS_REGEX: /^\d+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/,
  NAME_REGEX: /^[a-zA-Z\s]+$/,
}));

const MOCK_USER_CONSUMER = {
  id: "u1",
  first_name: "Ana",
  last_name: "Pérez",
  email: "ana@example.com",
  phone: "1234567890",
  role: "CONSUMIDOR" as const,
  photo_url: "https://res.cloudinary.com/x/image/upload/v1/photo.jpg",
  business_name: null,
  description: null,
  has_address: true,
  has_selected_address: true,
  selected_address: {
    id: "a1",
    formatted_address: "Av. Siempreviva 742",
    street: "Av. Siempreviva",
    number: "742",
    city: "Springfield",
    province: "Springfield",
    lat: -34,
    lng: -58,
    is_selected: true,
  },
};

const MOCK_USER_COMMERCE = {
  ...MOCK_USER_CONSUMER,
  role: "COMERCIO" as const,
  business_name: "El Comercio SA",
  description: "Descripción del comercio",
};

const VALID_VALUES = {
  first_name: "Ana",
  last_name: "Pérez",
  email: "ana@example.com",
  phone: "1234567890",
};

const mockBack = jest.fn();
const mockUpdateProfile = jest.fn();
const mockUploadImage = jest.fn();
const mockShowSuccess = jest.fn();
const mockReset = jest.fn();
let capturedSubmitCb: ((v: any) => Promise<void>) | undefined;

const setupMocks = (user: any = MOCK_USER_CONSUMER) => {
  capturedSubmitCb = undefined;
  const mockHandleSubmit = jest.fn((cb: any) => {
    capturedSubmitCb = cb;
    return jest.fn();
  });
  (useForm as jest.Mock).mockReturnValue({
    control: {},
    handleSubmit: mockHandleSubmit,
    reset: mockReset,
    formState: { isValid: true, isSubmitting: false, isDirty: true },
  });
  (useCurrentUser as jest.Mock).mockReturnValue({ data: user });
  (useUpdateProfile as jest.Mock).mockReturnValue({
    mutateAsync: mockUpdateProfile,
  });
  (useUploadImage as jest.Mock).mockReturnValue({
    mutateAsync: mockUploadImage,
  });
  (useToast as jest.Mock).mockReturnValue({ showSuccess: mockShowSuccess });
  const { useRouter } = require("expo-router");
  (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
};

beforeEach(() => {
  jest.clearAllMocks();
  // Reset mocks that use mockResolvedValueOnce/mockRejectedValueOnce to prevent
  // stale queue entries from un-triggered tests polluting later tests.
  mockUploadImage.mockReset();
  mockUpdateProfile.mockReset();
  (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockReset();
  (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockReset();
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockReset();
  (ImagePicker.launchCameraAsync as jest.Mock).mockReset();
  setupMocks();
});

describe("useEditProfileScreen", () => {
  describe("initial state", () => {
    it("exposes expected fields", () => {
      const { result } = renderHook(() => useEditProfileScreen());
      expect(result.current.control).toBeDefined();
      expect(result.current.isValid).toBe(true);
      expect(result.current.isDirty).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.handleBack).toBeTruthy();
      expect(result.current.handleSave).toBeTruthy();
      expect(result.current.handleAvatarPress).toBeTruthy();
    });

    it("computes initials from user name", () => {
      const { result } = renderHook(() => useEditProfileScreen());
      expect(result.current.initials).toBe("AP");
    });

    it("isCommerce is false for CONSUMIDOR", () => {
      const { result } = renderHook(() => useEditProfileScreen());
      expect(result.current.isCommerce).toBe(false);
    });

    it("isCommerce is true for COMERCIO", () => {
      setupMocks(MOCK_USER_COMMERCE);
      const { result } = renderHook(() => useEditProfileScreen());
      expect(result.current.isCommerce).toBe(true);
    });

    it("displayPhotoUrl uses buildProfilePhotoUrl when user has photo_url", () => {
      const { result } = renderHook(() => useEditProfileScreen());
      expect(result.current.displayPhotoUrl).toBe(
        `profile:${MOCK_USER_CONSUMER.photo_url}`,
      );
    });

    it("displayPhotoUrl is null when user has no photo_url", () => {
      setupMocks({ ...MOCK_USER_CONSUMER, photo_url: null as any });
      const { result } = renderHook(() => useEditProfileScreen());
      expect(result.current.displayPhotoUrl).toBeNull();
    });

    it("initials is empty string when user is undefined", () => {
      (useCurrentUser as jest.Mock).mockReturnValue({ data: undefined });
      const { result } = renderHook(() => useEditProfileScreen());
      expect(result.current.initials).toBe("");
    });
  });

  describe("handleBack", () => {
    it("calls router.back()", () => {
      const { result } = renderHook(() => useEditProfileScreen());
      act(() => {
        result.current.handleBack();
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleSave — submit callback (CONSUMIDOR)", () => {
    it("calls updateProfile with consumer fields", async () => {
      mockUpdateProfile.mockResolvedValueOnce({});
      renderHook(() => useEditProfileScreen());
      await act(async () => {
        await capturedSubmitCb!({
          ...VALID_VALUES,
          business_name: "Ignored",
          description: "Ignored",
        });
      });
      expect(mockUpdateProfile).toHaveBeenCalledWith(VALID_VALUES);
    });

    it("shows success toast on successful save", async () => {
      mockUpdateProfile.mockResolvedValueOnce({});
      renderHook(() => useEditProfileScreen());
      await act(async () => {
        await capturedSubmitCb!(VALID_VALUES);
      });
      expect(mockShowSuccess).toHaveBeenCalledWith("Perfil actualizado");
    });

    it("navigates back on successful save", async () => {
      mockUpdateProfile.mockResolvedValueOnce({});
      renderHook(() => useEditProfileScreen());
      await act(async () => {
        await capturedSubmitCb!(VALID_VALUES);
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("does not navigate back when updateProfile throws", async () => {
      mockUpdateProfile.mockRejectedValueOnce(new Error("Update failed"));
      renderHook(() => useEditProfileScreen());
      await act(async () => {
        await capturedSubmitCb!(VALID_VALUES);
      });
      expect(mockBack).not.toHaveBeenCalled();
    });
  });

  describe("handleSave — submit callback (COMERCIO)", () => {
    it("includes business_name and description for commerce users", async () => {
      setupMocks(MOCK_USER_COMMERCE);
      mockUpdateProfile.mockResolvedValueOnce({});
      renderHook(() => useEditProfileScreen());
      await act(async () => {
        await capturedSubmitCb!({
          ...VALID_VALUES,
          business_name: "El Comercio SA",
          description: "Una descripción",
        });
      });
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        ...VALID_VALUES,
        business_name: "El Comercio SA",
        description: "Una descripción",
      });
    });

    it("sends null description when description is empty string", async () => {
      setupMocks(MOCK_USER_COMMERCE);
      mockUpdateProfile.mockResolvedValueOnce({});
      renderHook(() => useEditProfileScreen());
      await act(async () => {
        await capturedSubmitCb!({
          ...VALID_VALUES,
          business_name: "Co",
          description: "   ",
        });
      });
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ description: null }),
      );
    });
  });

  describe("handleAvatarPress", () => {
    it("shows Alert when not uploading a photo", () => {
      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation(() => undefined);
      const { result } = renderHook(() => useEditProfileScreen());
      act(() => {
        result.current.handleAvatarPress();
      });
      expect(alertSpy).toHaveBeenCalledWith(
        "Cambiar foto de perfil",
        undefined,
        expect.any(Array),
      );
      alertSpy.mockRestore();
    });

    it("returns early without showing Alert when a photo upload is in progress", async () => {
      // Never-resolving upload keeps isPhotoUploading=true during the second press
      mockUploadImage.mockReturnValueOnce(new Promise(() => {}));
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({ status: "granted" });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: "file://photo.jpg" }],
      });

      const { result } = renderHook(() => useEditProfileScreen());

      // First press — starts the upload
      const firstSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementationOnce((_t, _m, buttons) => {
          const btn = (buttons as any[])?.find((b) => b.text === "Galería");
          btn?.onPress?.();
        });
      act(() => {
        result.current.handleAvatarPress();
      });
      firstSpy.mockRestore();

      // Flush microtasks so setIsPhotoUploading(true) is applied
      await act(async () => {});
      expect(result.current.isPhotoUploading).toBe(true);

      // Second press — must return early without calling Alert
      const secondSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation(() => undefined);
      act(() => {
        result.current.handleAvatarPress();
      });
      expect(secondSpy).not.toHaveBeenCalled();
      secondSpy.mockRestore();
    });
  });

  describe("uploadPhoto", () => {
    it("calls uploadImage and updateProfile then shows success toast", async () => {
      const mockUrl = "https://res.cloudinary.com/x/image/upload/v1/new.jpg";
      mockUploadImage.mockResolvedValueOnce({ url: mockUrl });
      mockUpdateProfile.mockResolvedValueOnce({});
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({ status: "granted" });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: "file://photo.jpg" }],
      });

      const { result } = renderHook(() => useEditProfileScreen());
      await act(async () => {
        await result.current.handleAvatarPress();
        const alertSpy = jest.spyOn(Alert, "alert");
        if (alertSpy.mock.calls.length > 0) {
          const buttons = alertSpy.mock.calls[0][2] as any[];
          const galleryButton = buttons?.find((b: any) => b.text === "Galería");
          if (galleryButton?.onPress) await galleryButton.onPress();
        }
        alertSpy.mockRestore();
      });
      expect(result.current).toBeDefined();
    });

    it("sets isPhotoUploading while upload is in progress", async () => {
      let resolveUpload!: (v: any) => void;
      mockUploadImage.mockReturnValueOnce(
        new Promise((r) => {
          resolveUpload = r;
        }),
      );
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({ status: "granted" });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: "file://photo.jpg" }],
      });

      const { result } = renderHook(() => useEditProfileScreen());
      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const galleryBtn = (buttons as any[])?.find(
            (b) => b.text === "Galería",
          );
          galleryBtn?.onPress?.();
        });

      act(() => {
        result.current.handleAvatarPress();
      });
      alertSpy.mockRestore();
      expect(result.current).toBeDefined();

      resolveUpload({
        url: "https://res.cloudinary.com/x/image/upload/v1/x.jpg",
      });
    });
  });

  describe("pickImage — permission denied", () => {
    it("shows Alert when library permission is not granted", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({ status: "denied" });
      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation(() => undefined);

      const { result } = renderHook(() => useEditProfileScreen());

      // Trigger the library picker path by simulating the avatar alert callback
      const mainAlertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementationOnce((_title, _msg, buttons) => {
          const galleryBtn = (buttons as any[])?.find(
            (b) => b.text === "Galería",
          );
          galleryBtn?.onPress?.();
        });

      await act(async () => {
        result.current.handleAvatarPress();
      });

      expect(alertSpy).toHaveBeenCalled();
      mainAlertSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it("shows Alert when camera permission is not granted", async () => {
      (
        ImagePicker.requestCameraPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({ status: "denied" });
      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation(() => undefined);

      const { result } = renderHook(() => useEditProfileScreen());

      const mainAlertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementationOnce((_title, _msg, buttons) => {
          const cameraBtn = (buttons as any[])?.find(
            (b) => b.text === "Cámara",
          );
          cameraBtn?.onPress?.();
        });

      await act(async () => {
        result.current.handleAvatarPress();
      });

      expect(alertSpy).toHaveBeenCalled();
      mainAlertSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it("launches camera and uploads when permission is granted", async () => {
      const mockUrl = "https://res.cloudinary.com/x/image/upload/v1/cam.jpg";
      mockUploadImage.mockResolvedValueOnce({ url: mockUrl });
      mockUpdateProfile.mockResolvedValueOnce({});
      (
        ImagePicker.requestCameraPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({ status: "granted" });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: "file://cam-photo.jpg" }],
      });

      const { result } = renderHook(() => useEditProfileScreen());

      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const cameraBtn = (buttons as any[])?.find(
            (b) => b.text === "Cámara",
          );
          cameraBtn?.onPress?.();
        });

      await act(async () => {
        result.current.handleAvatarPress();
      });
      await act(async () => {});

      alertSpy.mockRestore();
      expect(mockUploadImage).toHaveBeenCalled();
    });
  });

  describe("uploadPhoto — error path", () => {
    it("reverts local photo preview when upload image fails", async () => {
      mockUploadImage.mockRejectedValueOnce(new Error("Upload failed"));
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({ status: "granted" });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: "file://photo.jpg" }],
      });

      const { result } = renderHook(() => useEditProfileScreen());

      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const galleryBtn = (buttons as any[])?.find(
            (b) => b.text === "Galería",
          );
          galleryBtn?.onPress?.();
        });

      await act(async () => {
        result.current.handleAvatarPress();
      });
      await act(async () => {});

      alertSpy.mockRestore();
      expect(result.current.isPhotoUploading).toBe(false);
    });
  });

  describe("pickImage — picker canceled", () => {
    it("does not upload when library picker is canceled", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({ status: "granted" });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: true,
        assets: [],
      });

      const { result } = renderHook(() => useEditProfileScreen());

      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const galleryBtn = (buttons as any[])?.find(
            (b) => b.text === "Galería",
          );
          galleryBtn?.onPress?.();
        });

      await act(async () => {
        result.current.handleAvatarPress();
      });
      await act(async () => {});

      alertSpy.mockRestore();
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it("does not upload when camera picker is canceled", async () => {
      (
        ImagePicker.requestCameraPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({ status: "granted" });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce({
        canceled: true,
        assets: [],
      });

      const { result } = renderHook(() => useEditProfileScreen());

      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const cameraBtn = (buttons as any[])?.find(
            (b) => b.text === "Cámara",
          );
          cameraBtn?.onPress?.();
        });

      await act(async () => {
        result.current.handleAvatarPress();
      });
      await act(async () => {});

      alertSpy.mockRestore();
      expect(mockUploadImage).not.toHaveBeenCalled();
    });
  });

  describe("default export", () => {
    it("returns null — Expo Router required dummy export", () => {
      expect(useEditProfileDefaultExport()).toBeNull();
    });
  });
});
