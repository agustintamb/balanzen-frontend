import { fireEvent, render } from "@testing-library/react-native";
import PublishProductScreen from "../index";
import { usePublishProductScreen } from "../usePublishProductScreen";

jest.mock("../usePublishProductScreen", () => ({
  usePublishProductScreen: jest.fn(),
}));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
  KeyboardAwareScrollView: ({ children }: any) => children,
}));
jest.mock("@/components/ui/Button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ children, onPress, disabled, testID }: any) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} testID={testID}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
});
jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return ({ name }: any) => <View testID={`icon-${name}`} />;
});
jest.mock("../Step1Info", () => {
  const { View, Text } = require("react-native");
  return ({ photos }: any) => (
    <View testID="step1">
      <Text>Step1 photos={photos.length}</Text>
    </View>
  );
});
jest.mock("../Step2Price", () => {
  const { View, Text } = require("react-native");
  return () => (
    <View testID="step2">
      <Text>Step2</Text>
    </View>
  );
});
jest.mock("../StepIndicator", () => {
  const { View } = require("react-native");
  return ({ currentStep }: any) => (
    <View testID={`step-indicator-${currentStep}`} />
  );
});
jest.mock("../PublishSuccess", () => {
  const { View, Text } = require("react-native");
  return ({ visible, onDone }: any) =>
    visible ? (
      <View testID="publish-success">
        <Text onPress={onDone}>Done</Text>
      </View>
    ) : null;
});

type VM = ReturnType<typeof usePublishProductScreen>;

const baseVM: VM = {
  headerTitle: "Nueva publicación",
  control: {} as any,
  step: 1,
  photos: [],
  sortedCategories: [],
  selectedCategoryId: "",
  expiryDate: null,
  isDonation: false,
  isUploadingPhotos: false,
  isSubmitting: false,
  showSuccess: false,
  ctaLabel: "Continuar",
  ctaDisabled: false,
  onCtaPress: jest.fn(),
  handleBack: jest.fn(),
  handlePickPhoto: jest.fn(),
  handleRemovePhoto: jest.fn(),
  handleSelectCategory: jest.fn(),
  handleSelectDate: jest.fn(),
  handleToggleDonation: jest.fn(),
  handleChangeFinalPrice: jest.fn(),
  handleChangeOriginalPrice: jest.fn(),
  handleSuccessDone: jest.fn(),
};

const mockHook = (overrides: Partial<VM> = {}) =>
  (usePublishProductScreen as jest.Mock).mockReturnValue({
    ...baseVM,
    ...overrides,
  });

beforeEach(() => jest.clearAllMocks());

describe("PublishProductScreen", () => {
  it("renders header title and step indicator for step 1", () => {
    mockHook();
    const { getByText, getByTestId } = render(<PublishProductScreen />);
    expect(getByText("Nueva publicación")).toBeTruthy();
    expect(getByTestId("step-indicator-1")).toBeTruthy();
  });

  it("renders Step1Info when step === 1", () => {
    mockHook({ step: 1 });
    const { getByTestId, queryByTestId } = render(<PublishProductScreen />);
    expect(getByTestId("step1")).toBeTruthy();
    expect(queryByTestId("step2")).toBeNull();
  });

  it("renders Step2Price when step === 2", () => {
    mockHook({ step: 2 });
    const { getByTestId, queryByTestId } = render(<PublishProductScreen />);
    expect(getByTestId("step2")).toBeTruthy();
    expect(queryByTestId("step1")).toBeNull();
  });

  it("calls handleBack when back button is pressed", () => {
    mockHook();
    const { getByTestId } = render(<PublishProductScreen />);
    fireEvent.press(getByTestId("btn-back"));
    expect(baseVM.handleBack).toHaveBeenCalled();
  });

  it("calls onCtaPress when CTA button is pressed", () => {
    mockHook();
    const { getByTestId } = render(<PublishProductScreen />);
    fireEvent.press(getByTestId("btn-cta"));
    expect(baseVM.onCtaPress).toHaveBeenCalled();
  });

  it("shows PublishSuccess when showSuccess is true", () => {
    mockHook({ showSuccess: true });
    const { getByTestId } = render(<PublishProductScreen />);
    expect(getByTestId("publish-success")).toBeTruthy();
  });

  it("does not show PublishSuccess when showSuccess is false", () => {
    mockHook({ showSuccess: false });
    const { queryByTestId } = render(<PublishProductScreen />);
    expect(queryByTestId("publish-success")).toBeNull();
  });

  it("CTA button is disabled when ctaDisabled is true", () => {
    mockHook({ ctaDisabled: true });
    const { getByTestId } = render(<PublishProductScreen />);
    expect(getByTestId("btn-cta").props.accessibilityState?.disabled).toBe(
      true,
    );
  });

  it("renders 'Nueva publicación' as header title", () => {
    mockHook({ headerTitle: "Nueva publicación" });
    const { getByText } = render(<PublishProductScreen />);
    expect(getByText("Nueva publicación")).toBeTruthy();
  });
});
