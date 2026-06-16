import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { useCategories } from "@/hooks/useCategories";
import {
  useCreatePublication,
  usePublication,
  useUpdatePublication,
} from "@/hooks/usePublications";
import { useUploadImage } from "@/hooks/useUploads";
import { useToast } from "@/stores/ui.store";
import PublishProductScreen from "../index";

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
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return { Image: () => <View /> };
});
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
  KeyboardAwareScrollView: ({ children }: any) => children,
}));
jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return ({ name }: any) => <View testID={`icon-${name}`} />;
});
jest.mock("@/components/ui/Button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ children, onPress, disabled, testID }: any) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} testID={testID}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
});
jest.mock("@react-native-community/datetimepicker", () => {
  const { TouchableOpacity, View } = require("react-native");
  return function MockDateTimePicker({ onChange }: any) {
    return (
      <TouchableOpacity
        testID="date-picker"
        onPress={() => onChange({ type: "set" }, new Date(2027, 0, 1))}
      >
        <View />
      </TouchableOpacity>
    );
  };
});

const mockNavigate = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockUpload = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowWarning = jest.fn();
const mockShowError = jest.fn();

const setup = () => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({});
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

  const ImagePicker = require("expo-image-picker");
  ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
    status: "granted",
  });
  ImagePicker.launchImageLibraryAsync.mockResolvedValue({
    canceled: false,
    assets: [{ uri: "file://photo.jpg" }],
  });
  mockUpload.mockResolvedValue({ url: "https://img/1.jpg" });
};

const addPhoto = async (screen: ReturnType<typeof render>) => {
  const alertSpy = jest
    .spyOn(Alert, "alert")
    .mockImplementation((_title, _msg, buttons) => {
      const gallery = (buttons as any[])?.find((b) => b.text === "Galería");
      gallery?.onPress?.();
    });
  await act(async () => {
    fireEvent.press(screen.getByTestId("photo-add"));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
  alertSpy.mockRestore();
};

const completeStep1AndContinue = async (
  screen: ReturnType<typeof render>,
) => {
  await addPhoto(screen);
  await act(async () => {
    fireEvent.changeText(
      screen.getByPlaceholderText("Nombre del producto"),
      "Mix de verduras",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Descripción"),
      "Verduras frescas de estación",
    );
  });
  await act(async () => {
    fireEvent.press(screen.getByTestId("category-chip-cat-1"));
  });
  await act(async () => {
    fireEvent.press(screen.getByTestId("expiry-date-field"));
  });
  await act(async () => {
    fireEvent.press(screen.getByTestId("date-picker"));
  });
  await waitFor(() => {
    expect(
      screen.getByTestId("btn-cta").props.accessibilityState?.disabled,
    ).toBeFalsy();
  });
  await act(async () => {
    fireEvent.press(screen.getByTestId("btn-cta"));
  });
};

const setupEdit = () => {
  setup();
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "pub-1" });
  (usePublication as jest.Mock).mockReturnValue({
    data: {
      id: "pub-1",
      title: "Pan integral",
      description: "Pan artesanal del día",
      expiry_date: "2027-03-01T00:00:00.000Z",
      category: { id: "cat-1", name: "Verduras" },
      is_donation: false,
      final_price: 500,
      original_price: 1000,
      photos: ["https://img/existing.jpg"],
    },
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCreate.mockResolvedValue({ id: "pub-new" });
  mockUpdate.mockResolvedValue({ id: "pub-1" });
});

describe("PublishProductScreen integration", () => {
  it("advances to step 2 after completing step 1 with a photo", async () => {
    setup();
    const screen = render(<PublishProductScreen />);
    await completeStep1AndContinue(screen);
    expect(screen.getByText("Publicar como donación")).toBeTruthy();
  });

  it("submits and shows the success modal when published as a donation", async () => {
    setup();
    const screen = render(<PublishProductScreen />);
    await completeStep1AndContinue(screen);

    await act(async () => {
      fireEvent(screen.getByTestId("donation-switch"), "valueChange", true);
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("btn-cta").props.accessibilityState?.disabled,
      ).toBeFalsy();
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId("btn-cta"));
    });

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
    expect(mockCreate.mock.calls[0][0]).toMatchObject({
      title: "Mix de verduras",
      original_price: 0,
      final_price: 0,
      photos: ["https://img/1.jpg"],
    });
  });

  it("shows a validation error when final price exceeds the original", async () => {
    setup();
    const screen = render(<PublishProductScreen />);
    await completeStep1AndContinue(screen);

    await act(async () => {
      fireEvent.changeText(
        screen.getByPlaceholderText("Precio original ($)"),
        "500",
      );
    });
    await act(async () => {
      fireEvent.changeText(
        screen.getByPlaceholderText("Precio de venta ($)"),
        "1000",
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("No puede superar al precio original"),
      ).toBeTruthy();
    });
  });

  it("returns to step 1 when back is pressed on step 2", async () => {
    setup();
    const screen = render(<PublishProductScreen />);
    await completeStep1AndContinue(screen);
    expect(screen.getByText("Publicar como donación")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("btn-back"));
    });

    expect(screen.getByPlaceholderText("Nombre del producto")).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("updates the publication and navigates back in edit mode", async () => {
    setupEdit();
    const screen = render(<PublishProductScreen />);

    expect(screen.getByText("Editar publicación")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Nombre del producto").props.value).toBe(
        "Pan integral",
      );
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("btn-cta").props.accessibilityState?.disabled,
      ).toBeFalsy();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("btn-cta"));
    });

    expect(screen.getByText("Guardar cambios")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("btn-cta"));
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
    expect(mockUpdate.mock.calls[0][0]).toMatchObject({
      id: "pub-1",
      body: expect.objectContaining({ title: "Pan integral" }),
    });
    expect(mockShowSuccess).toHaveBeenCalledWith("Publicación actualizada");
    expect(mockBack).toHaveBeenCalled();
  });
});
