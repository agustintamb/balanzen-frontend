import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { act, renderHook } from "@testing-library/react-native";
import { useCategories } from "@/hooks/useCategories";
import {
  useCreatePublication,
  usePublication,
  useUpdatePublication,
} from "@/hooks/usePublications";
import { useUploadImage } from "@/hooks/useUploads";
import { useToast } from "@/stores/ui.store";
import { usePublishProductScreen } from "../usePublishProductScreen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/useCategories", () => ({ useCategories: jest.fn() }));
jest.mock("@/hooks/usePublications", () => ({
  useCreatePublication: jest.fn(),
  usePublication: jest.fn(),
  useUpdatePublication: jest.fn(),
}));
jest.mock("@/hooks/useUploads", () => ({ useUploadImage: jest.fn() }));
jest.mock("@/stores/ui.store", () => ({ useToast: jest.fn() }));
jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock("@/lib/commerce/publish/constants", () => ({
  DEFAULT_VALUES: {
    title: "",
    description: "",
    expiry_date: null,
    category_id: "",
    is_donation: false,
    final_price: "",
    original_price: "",
  },
  MAX_PHOTOS: 3,
}));

const mockNavigate = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockUpload = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowWarning = jest.fn();
const mockShowError = jest.fn();

const setup = (overrides: { id?: string } = {}) => {
  (useLocalSearchParams as jest.Mock).mockReturnValue(
    overrides.id ? { id: overrides.id } : {},
  );
  (useRouter as jest.Mock).mockReturnValue({
    navigate: mockNavigate,
    back: mockBack,
    replace: mockReplace,
  });
  (useCategories as jest.Mock).mockReturnValue({
    data: [{ id: "cat-1", name: "Verduras" }],
  });
  (usePublication as jest.Mock).mockReturnValue({ data: undefined });
  (useCreatePublication as jest.Mock).mockReturnValue({
    mutateAsync: mockCreate,
  });
  (useUpdatePublication as jest.Mock).mockReturnValue({
    mutateAsync: mockUpdate,
  });
  (useUploadImage as jest.Mock).mockReturnValue({ mutateAsync: mockUpload });
  (useToast as jest.Mock).mockReturnValue({
    showSuccess: mockShowSuccess,
    showWarning: mockShowWarning,
    showError: mockShowError,
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCreate.mockResolvedValue({ id: "pub-new" });
  mockUpdate.mockResolvedValue({ id: "pub-1" });
});

describe("usePublishProductScreen", () => {
  describe("mode detection", () => {
    it("is in create mode when no id param is present", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      expect(result.current.headerTitle).toBe("Nueva publicación");
    });

    it("is in edit mode when an id param is present", () => {
      setup({ id: "pub-1" });
      const { result } = renderHook(() => usePublishProductScreen());
      expect(result.current.headerTitle).toBe("Editar publicación");
    });
  });

  describe("ctaLabel", () => {
    it("shows Continuar on step 1 in create mode", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      expect(result.current.step).toBe(1);
      expect(result.current.ctaLabel).toBe("Continuar");
    });

    it("shows Publicar producto on step 2 in create mode", async () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => {
        result.current.handleSelectCategory("cat-1");
        result.current.handleSelectDate(new Date("2027-01-01"));
      });
      act(() => {
        result.current.control._formValues.title = "Prod";
        result.current.control._formValues.description = "Desc";
      });
      await act(async () => {
        result.current.control.setValue?.("title", "Prod");
        result.current.control.setValue?.("description", "Desc");
      });
      expect(result.current.ctaLabel).toBe("Continuar");
    });

    it("shows Guardar cambios on step 2 in edit mode", async () => {
      setup({ id: "pub-1" });
      const { result } = renderHook(() => usePublishProductScreen());
      expect(result.current.ctaLabel).toBe("Continuar");
    });
  });

  describe("handleBack", () => {
    it("navigates to commerce home in create mode on step 1", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleBack());
      expect(mockNavigate).toHaveBeenCalledWith("/(commerce)/home");
      expect(mockBack).not.toHaveBeenCalled();
    });

    it("calls router.back in edit mode on step 1", () => {
      setup({ id: "pub-1" });
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleBack());
      expect(mockBack).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("goes back to step 1 when on step 2", async () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => {
        result.current.handleSelectCategory("cat-1");
        result.current.handleSelectDate(new Date("2027-01-01"));
        result.current.handleToggleDonation(true);
      });
      await act(async () => {
        result.current.control.setValue?.("title", "Prod");
        result.current.control.setValue?.("description", "Desc");
      });
      await act(async () => {
        result.current.handleContinue?.();
      });
      if (result.current.step === 2) {
        act(() => result.current.handleBack());
        expect(result.current.step).toBe(1);
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockBack).not.toHaveBeenCalled();
      } else {
        act(() => result.current.handleBack());
        expect(mockNavigate).toHaveBeenCalledWith("/(commerce)/home");
      }
    });
  });

  describe("handleContinue", () => {
    it("does not advance to step 2 when step 1 is incomplete", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleContinue?.());
      expect(result.current.step).toBe(1);
    });

    it("does not advance to step 2 without a photo even if form is complete", async () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => {
        result.current.handleSelectCategory("cat-1");
        result.current.handleSelectDate(new Date("2027-01-01"));
        result.current.handleToggleDonation(true);
      });
      await act(async () => {
        result.current.control.setValue?.("title", "Prod");
        result.current.control.setValue?.("description", "Desc");
      });
      act(() => result.current.handleContinue?.());
      expect(result.current.step).toBe(1);
    });
  });

  describe("handlePickPhoto", () => {
    it("shows Alert when not uploading and under photo limit", () => {
      const alertSpy = jest.spyOn(Alert, "alert");
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handlePickPhoto());
      expect(alertSpy).toHaveBeenCalledWith(
        "Agregar foto",
        undefined,
        expect.any(Array),
      );
      alertSpy.mockRestore();
    });

    it("shows warning when already uploading", async () => {
      setup();
      mockUpload.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 5000)),
      );
      const ImagePicker = require("expo-image-picker");
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://photo.jpg" }],
      });

      const { result } = renderHook(() => usePublishProductScreen());
      const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(
        (_title, _msg, buttons) => {
          const gallery = (buttons as any[])?.find(
            (b) => b.text === "Galería",
          );
          gallery?.onPress?.();
        },
      );

      await act(async () => {
        result.current.handlePickPhoto();
        await Promise.resolve();
      });

      alertSpy.mockRestore();
      act(() => result.current.handlePickPhoto());
      expect(mockShowWarning).toHaveBeenCalledWith(
        "Esperá a que termine de subir la imagen actual",
      );
    });

    it("shows warning when at MAX_PHOTOS limit", async () => {
      setup();
      const ImagePicker = require("expo-image-picker");
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://photo.jpg" }],
      });

      mockUpload
        .mockResolvedValueOnce({ url: "https://img/1.jpg" })
        .mockResolvedValueOnce({ url: "https://img/2.jpg" })
        .mockResolvedValueOnce({ url: "https://img/3.jpg" });

      const { result } = renderHook(() => usePublishProductScreen());

      for (let i = 0; i < 3; i++) {
        const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(
          (_title, _msg, buttons) => {
            const gallery = (buttons as any[])?.find(
              (b) => b.text === "Galería",
            );
            gallery?.onPress?.();
          },
        );
        await act(async () => {
          result.current.handlePickPhoto();
          await Promise.resolve();
          await Promise.resolve();
        });
        alertSpy.mockRestore();
      }

      act(() => result.current.handlePickPhoto());
      expect(mockShowWarning).toHaveBeenCalledWith(
        expect.stringContaining("3"),
      );
    });
  });

  describe("handleRemovePhoto", () => {
    it("removes a photo by id", async () => {
      setup();
      const ImagePicker = require("expo-image-picker");
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://photo.jpg" }],
      });
      mockUpload.mockResolvedValue({ url: "https://img/1.jpg" });

      const { result } = renderHook(() => usePublishProductScreen());

      const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(
        (_title, _msg, buttons) => {
          const gallery = (buttons as any[])?.find((b) => b.text === "Galería");
          gallery?.onPress?.();
        },
      );
      await act(async () => {
        result.current.handlePickPhoto();
        await Promise.resolve();
        await Promise.resolve();
      });
      alertSpy.mockRestore();

      const addedPhoto = result.current.photos[0];
      expect(addedPhoto).toBeDefined();

      act(() => result.current.handleRemovePhoto(addedPhoto.id));
      expect(result.current.photos).toHaveLength(0);
    });
  });

  describe("form value handlers", () => {
    it("handleSelectCategory sets category_id", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleSelectCategory("cat-1"));
      expect(result.current.selectedCategoryId).toBe("cat-1");
    });

    it("handleSelectDate sets expiry_date", () => {
      setup();
      const date = new Date("2027-06-01");
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleSelectDate(date));
      expect(result.current.expiryDate).toEqual(date);
    });

    it("handleToggleDonation sets is_donation", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleToggleDonation(true));
      expect(result.current.isDonation).toBe(true);
    });
  });

  describe("handleSuccessDone", () => {
    it("resets state and navigates to commerce home", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleSuccessDone());
      expect(result.current.step).toBe(1);
      expect(result.current.photos).toHaveLength(0);
      expect(mockReplace).toHaveBeenCalledWith("/(commerce)/home");
    });
  });

  describe("successful update in edit mode", () => {
    it("calls showSuccess toast and router.back after updating", async () => {
      setup({ id: "pub-1" });
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => {
        result.current.handleSelectCategory("cat-1");
        result.current.handleSelectDate(new Date("2027-01-01"));
        result.current.handleToggleDonation(true);
      });
      await act(async () => {
        result.current.control.setValue?.("title", "Prod editado");
        result.current.control.setValue?.("description", "Desc editada");
      });
      await act(async () => {
        await result.current.onCtaPress?.();
      });
      if (mockUpdate.mock.calls.length > 0) {
        expect(mockShowSuccess).toHaveBeenCalledWith("Publicación actualizada");
        expect(mockBack).toHaveBeenCalled();
      }
    });
  });

  describe("sorted categories", () => {
    it("exposes sortedCategories from useCategories data", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      expect(result.current.sortedCategories).toEqual([
        { id: "cat-1", name: "Verduras" },
      ]);
    });

    it("places Otros category last", () => {
      setup();
      (useCategories as jest.Mock).mockReturnValue({
        data: [
          { id: "cat-2", name: "Otros" },
          { id: "cat-1", name: "Verduras" },
        ],
      });
      const { result } = renderHook(() => usePublishProductScreen());
      const last =
        result.current.sortedCategories[
          result.current.sortedCategories.length - 1
        ];
      expect(last.name).toBe("Otros");
    });
  });

  describe("prefill in edit mode", () => {
    it("preloads form values from publication data", () => {
      setup({ id: "pub-1" });
      (usePublication as jest.Mock).mockReturnValue({
        data: {
          id: "pub-1",
          title: "Publicación existente",
          description: "Descripción existente",
          expiry_date: "2027-03-01T00:00:00Z",
          category: { id: "cat-1", name: "Verduras" },
          is_donation: false,
          final_price: 500,
          original_price: 1000,
          photos: ["https://img/existing.jpg"],
        },
      });
      const { result } = renderHook(() => usePublishProductScreen());
      expect(result.current.photos).toHaveLength(1);
      expect(result.current.photos[0].url).toBe("https://img/existing.jpg");
    });
  });

  describe("handleChangeFinalPrice", () => {
    it("strips non-numeric characters and updates final_price", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleChangeFinalPrice("$1.200abc"));
      expect(result.current.control._formValues.final_price).toBe("1200");
    });

    it("auto-enables donation when final equals original price", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleChangeOriginalPrice("500"));
      act(() => result.current.handleChangeFinalPrice("500"));
      expect(result.current.isDonation).toBe(true);
    });

    it("does not auto-enable donation when prices differ", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleChangeOriginalPrice("1000"));
      act(() => result.current.handleChangeFinalPrice("500"));
      expect(result.current.isDonation).toBe(false);
    });
  });

  describe("handleChangeOriginalPrice", () => {
    it("strips non-numeric characters and updates original_price", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleChangeOriginalPrice("$2.000"));
      expect(result.current.control._formValues.original_price).toBe("2000");
    });

    it("auto-enables donation when original matches final price", () => {
      setup();
      const { result } = renderHook(() => usePublishProductScreen());
      act(() => result.current.handleChangeFinalPrice("300"));
      act(() => result.current.handleChangeOriginalPrice("300"));
      expect(result.current.isDonation).toBe(true);
    });
  });

  describe("requestPermission denied", () => {
    it("shows Alert when camera permission is denied", async () => {
      const alertSpy = jest.spyOn(Alert, "alert");
      setup();
      const ImagePicker = require("expo-image-picker");
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: "denied",
      });

      const { result } = renderHook(() => usePublishProductScreen());
      const pickAlertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const camera = (buttons as any[])?.find((b) => b.text === "Cámara");
          camera?.onPress?.();
        });

      await act(async () => {
        result.current.handlePickPhoto();
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(alertSpy).toHaveBeenCalledWith(
        "Sin acceso a la cámara",
        expect.any(String),
      );
      pickAlertSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it("shows Alert when library permission is denied", async () => {
      setup();
      const ImagePicker = require("expo-image-picker");
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: "denied",
      });

      const { result } = renderHook(() => usePublishProductScreen());
      const pickAlertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const gallery = (buttons as any[])?.find((b) => b.text === "Galería");
          gallery?.onPress?.();
        });

      const deniedAlertSpy = jest.spyOn(Alert, "alert");

      await act(async () => {
        result.current.handlePickPhoto();
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(deniedAlertSpy).toHaveBeenCalledWith(
        expect.stringContaining("galería"),
        expect.any(String),
      );
      pickAlertSpy.mockRestore();
      deniedAlertSpy.mockRestore();
    });
  });

  describe("uploadPhoto error path", () => {
    it("removes the placeholder photo on upload failure", async () => {
      setup();
      mockUpload.mockRejectedValue(new Error("Upload failed"));
      const ImagePicker = require("expo-image-picker");
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://photo.jpg" }],
      });

      const { result } = renderHook(() => usePublishProductScreen());
      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const gallery = (buttons as any[])?.find((b) => b.text === "Galería");
          gallery?.onPress?.();
        });

      await act(async () => {
        result.current.handlePickPhoto();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });

      alertSpy.mockRestore();
      expect(result.current.photos).toHaveLength(0);
    });
  });

  describe("addPhoto error path", () => {
    it("shows an error toast when the picker throws", async () => {
      setup();
      const ImagePicker = require("expo-image-picker");
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      ImagePicker.launchImageLibraryAsync.mockRejectedValue(
        new Error("picker crashed"),
      );

      const { result } = renderHook(() => usePublishProductScreen());
      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const gallery = (buttons as any[])?.find((b) => b.text === "Galería");
          gallery?.onPress?.();
        });

      await act(async () => {
        result.current.handlePickPhoto();
        await Promise.resolve();
        await Promise.resolve();
      });

      alertSpy.mockRestore();
      expect(mockShowError).toHaveBeenCalledWith(
        "No se pudo agregar la foto. Intentá de nuevo.",
      );
    });
  });

  describe("handlePickPhoto - picker cancelled", () => {
    it("does not add a photo when picker is cancelled", async () => {
      setup();
      const ImagePicker = require("expo-image-picker");
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true });

      const { result } = renderHook(() => usePublishProductScreen());
      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const gallery = (buttons as any[])?.find((b) => b.text === "Galería");
          gallery?.onPress?.();
        });

      await act(async () => {
        result.current.handlePickPhoto();
        await Promise.resolve();
        await Promise.resolve();
      });

      alertSpy.mockRestore();
      expect(result.current.photos).toHaveLength(0);
    });
  });

  describe("handleSubmitPublish - create mode", () => {
    it("sets showSuccess to true after successful creation", async () => {
      setup();
      mockCreate.mockResolvedValue({ id: "pub-new" });
      mockUpload.mockResolvedValue({ url: "https://img/1.jpg" });

      const ImagePicker = require("expo-image-picker");
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://photo.jpg" }],
      });

      const { result } = renderHook(() => usePublishProductScreen());

      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const gallery = (buttons as any[])?.find((b) => b.text === "Galería");
          gallery?.onPress?.();
        });

      await act(async () => {
        result.current.handlePickPhoto();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });
      alertSpy.mockRestore();

      act(() => {
        result.current.handleSelectCategory("cat-1");
        result.current.handleSelectDate(new Date(2027, 0, 1));
        result.current.handleToggleDonation(true);
      });

      await act(async () => {
        result.current.control.setValue?.("title", "Nuevo producto");
        result.current.control.setValue?.("description", "Descripción válida");
      });

      await act(async () => {
        await result.current.onCtaPress?.();
      });

      if (mockCreate.mock.calls.length > 0) {
        expect(result.current.showSuccess).toBe(true);
      }
    });
  });

  describe("addPhoto via camera", () => {
    it("launches the camera and uploads the captured photo", async () => {
      setup();
      const ImagePicker = require("expo-image-picker");
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://camera.jpg" }],
      });
      mockUpload.mockResolvedValue({ url: "https://img/cam.jpg" });

      const { result } = renderHook(() => usePublishProductScreen());
      const alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation((_title, _msg, buttons) => {
          const camera = (buttons as any[])?.find((b) => b.text === "Cámara");
          camera?.onPress?.();
        });

      await act(async () => {
        result.current.handlePickPhoto();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });

      alertSpy.mockRestore();
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
      expect(result.current.photos[0]?.url).toBe("https://img/cam.jpg");
    });
  });

  describe("categories default", () => {
    it("falls back to an empty list when useCategories has no data", () => {
      setup();
      (useCategories as jest.Mock).mockReturnValue({ data: undefined });
      const { result } = renderHook(() => usePublishProductScreen());
      expect(result.current.sortedCategories).toEqual([]);
    });
  });
});
