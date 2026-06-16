import { fireEvent, render } from "@testing-library/react-native";
import type { Publication } from "@/api/publications/publications.types";
import PublicationDetailScreen from "../index";
import { usePublicationDetailScreen } from "../usePublicationDetailScreen";

jest.mock("../usePublicationDetailScreen", () => ({
  usePublicationDetailScreen: jest.fn(),
}));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));
jest.mock("@/components/ProductDetail/ProductDetailLayout", () => {
  const { View } = require("react-native");
  return ({ counterpart, footer, children, headerActions }: any) => (
    <View testID="layout">
      {headerActions}
      {counterpart}
      {footer}
      {children}
    </View>
  );
});
jest.mock("@/components/ProductDetail/DetailCounterpartRow", () => {
  const { View, Text } = require("react-native");
  return ({ title, onChatPress }: any) => (
    <View>
      <Text>{title}</Text>
    </View>
  );
});
jest.mock("@/components/ProductDetail/DetailHeaderActions", () => {
  const { View } = require("react-native");
  return () => <View testID="header-actions" />;
});
jest.mock("@/components/ui/ActionSheet", () => {
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ visible, title, confirmLabel, onConfirm, onCancel }: any) =>
    visible ? (
      <View testID="action-sheet">
        <Text>{title}</Text>
        <TouchableOpacity testID="btn-confirm" onPress={onConfirm}>
          <Text>{confirmLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="btn-action-cancel" onPress={onCancel}>
          <Text>Cancelar</Text>
        </TouchableOpacity>
      </View>
    ) : null;
});
jest.mock("@/components/ui/Button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ testID, onPress, children }: any) => (
    <TouchableOpacity testID={testID} onPress={onPress}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
});
jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return ({ name }: any) => <View testID={`icon-${name}`} />;
});

const publication = {
  id: "pub-1",
  title: "Mix de Verduras",
  description: "Frescas",
  original_price: 1600,
  final_price: 800,
  discount_pct: 50,
  expiry_date: "2026-12-31T23:59:00Z",
  category: { id: "c", name: "Panadería" },
  photos: ["https://img/1.jpg"],
  status: "ACTIVE",
  is_donation: false,
  commerce: {
    id: "comm1",
    business_name: "Verdulería Natura",
    selected_address: { formatted_address: "Av. Santa Fe 2150", lat: 0, lng: 0 },
  },
  created_at: "2026-01-01T00:00:00Z",
} as Publication;

const baseVM = {
  isLoading: false,
  publication,
  showFavoriteShare: false,
  isFavorite: false,
  counterpart: {
    title: "Verdulería Natura",
    initials: undefined,
    leftIcon: "store" as const,
    chatEnabled: false,
  },
  infoItems: [{ label: "Comercio", value: "Verdulería Natura" }],
  footerKind: "reserve" as const,
  isReserving: false,
  isDeleting: false,
  isRefetching: false,
  reserveVisible: false,
  deleteVisible: false,
  handleBack: jest.fn(),
  handleRefresh: jest.fn(),
  handleToggleFavorite: jest.fn(),
  handleShare: jest.fn(),
  handleReservePress: jest.fn(),
  handleCloseReserve: jest.fn(),
  confirmReserve: jest.fn(),
  handleDeletePress: jest.fn(),
  handleCloseDelete: jest.fn(),
  confirmDelete: jest.fn(),
  handleEdit: jest.fn(),
};

type VM = ReturnType<typeof usePublicationDetailScreen>;

const mockHook = (overrides: Partial<VM> = {}) =>
  (usePublicationDetailScreen as jest.Mock).mockReturnValue({
    ...baseVM,
    ...overrides,
  });

beforeEach(() => jest.clearAllMocks());

describe("PublicationDetailScreen", () => {
  it("renders a spinner while loading", () => {
    mockHook({ isLoading: true });
    const { queryByTestId } = render(<PublicationDetailScreen />);
    expect(queryByTestId("layout")).toBeNull();
  });

  it("renders a spinner when publication is null", () => {
    mockHook({ publication: undefined });
    const { queryByTestId } = render(<PublicationDetailScreen />);
    expect(queryByTestId("layout")).toBeNull();
  });

  it("renders a spinner when counterpart is null", () => {
    mockHook({ counterpart: undefined });
    const { queryByTestId } = render(<PublicationDetailScreen />);
    expect(queryByTestId("layout")).toBeNull();
  });

  it("renders ProductDetailLayout when data is ready", () => {
    mockHook();
    const { getByTestId } = render(<PublicationDetailScreen />);
    expect(getByTestId("layout")).toBeTruthy();
  });

  it("shows reserve button when footerKind is reserve", () => {
    mockHook({ footerKind: "reserve" });
    const { getByTestId } = render(<PublicationDetailScreen />);
    expect(getByTestId("btn-reserve")).toBeTruthy();
  });

  it("calls handleReservePress when reserve button is pressed", () => {
    mockHook({ footerKind: "reserve" });
    const { getByTestId } = render(<PublicationDetailScreen />);
    fireEvent.press(getByTestId("btn-reserve"));
    expect(baseVM.handleReservePress).toHaveBeenCalled();
  });

  it("shows delete and edit buttons when footerKind is commerce", () => {
    mockHook({ footerKind: "commerce" });
    const { getByTestId } = render(<PublicationDetailScreen />);
    expect(getByTestId("btn-delete")).toBeTruthy();
    expect(getByTestId("btn-edit")).toBeTruthy();
  });

  it("calls handleDeletePress when delete button is pressed", () => {
    mockHook({ footerKind: "commerce" });
    const { getByTestId } = render(<PublicationDetailScreen />);
    fireEvent.press(getByTestId("btn-delete"));
    expect(baseVM.handleDeletePress).toHaveBeenCalled();
  });

  it("calls handleEdit when edit button is pressed", () => {
    mockHook({ footerKind: "commerce" });
    const { getByTestId } = render(<PublicationDetailScreen />);
    fireEvent.press(getByTestId("btn-edit"));
    expect(baseVM.handleEdit).toHaveBeenCalled();
  });

  it("shows no footer when footerKind is none", () => {
    mockHook({ footerKind: "none" });
    const { queryByTestId } = render(<PublicationDetailScreen />);
    expect(queryByTestId("btn-reserve")).toBeNull();
    expect(queryByTestId("btn-delete")).toBeNull();
    expect(queryByTestId("btn-edit")).toBeNull();
  });

  it("shows reserve ActionSheet when reserveVisible is true", () => {
    mockHook({ reserveVisible: true });
    const { getByTestId, getByText } = render(<PublicationDetailScreen />);
    expect(getByTestId("action-sheet")).toBeTruthy();
    expect(getByText("Confirmar reserva")).toBeTruthy();
  });

  it("calls confirmReserve when ActionSheet confirm is pressed", () => {
    mockHook({ reserveVisible: true });
    const { getByTestId } = render(<PublicationDetailScreen />);
    fireEvent.press(getByTestId("btn-confirm"));
    expect(baseVM.confirmReserve).toHaveBeenCalled();
  });

  it("calls handleCloseReserve when ActionSheet cancel is pressed", () => {
    mockHook({ reserveVisible: true });
    const { getByTestId } = render(<PublicationDetailScreen />);
    fireEvent.press(getByTestId("btn-action-cancel"));
    expect(baseVM.handleCloseReserve).toHaveBeenCalled();
  });

  it("shows delete ActionSheet when deleteVisible is true", () => {
    mockHook({ deleteVisible: true, footerKind: "none" });
    const { getByTestId, getByText } = render(<PublicationDetailScreen />);
    expect(getByTestId("action-sheet")).toBeTruthy();
    expect(getByText("¿Eliminar publicación?")).toBeTruthy();
  });

  it("calls confirmDelete when delete ActionSheet confirm is pressed", () => {
    mockHook({ deleteVisible: true, footerKind: "none" });
    const { getByTestId } = render(<PublicationDetailScreen />);
    fireEvent.press(getByTestId("btn-confirm"));
    expect(baseVM.confirmDelete).toHaveBeenCalled();
  });

  it("calls handleCloseDelete when delete ActionSheet cancel is pressed", () => {
    mockHook({ deleteVisible: true, footerKind: "none" });
    const { getByTestId } = render(<PublicationDetailScreen />);
    fireEvent.press(getByTestId("btn-action-cancel"));
    expect(baseVM.handleCloseDelete).toHaveBeenCalled();
  });

  it("renders counterpart title", () => {
    mockHook();
    const { getByText } = render(<PublicationDetailScreen />);
    expect(getByText("Verdulería Natura")).toBeTruthy();
  });

  it("renders header actions when showFavoriteShare is true", () => {
    mockHook({ showFavoriteShare: true });
    const { getByTestId } = render(<PublicationDetailScreen />);
    expect(getByTestId("header-actions")).toBeTruthy();
  });

  it("does not render header actions when showFavoriteShare is false", () => {
    mockHook({ showFavoriteShare: false });
    const { queryByTestId } = render(<PublicationDetailScreen />);
    expect(queryByTestId("header-actions")).toBeNull();
  });
});
