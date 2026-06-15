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

const publication = {
  id: "pub-1",
  title: "Mix de Verduras",
  description: "Frescas",
  original_price: 2400,
  final_price: 1200,
  discount_pct: 50,
  expiry_date: "2026-12-31T23:59:00Z",
  category: { id: "c", name: "Verduras" },
  photos: ["https://img/1.jpg", "https://img/2.jpg"],
  status: "ACTIVE",
  is_donation: false,
  commerce: {
    id: "comm1",
    business_name: "Verdulería Natura",
    selected_address: {
      formatted_address: "Av. Santa Fe 2150",
      lat: 0,
      lng: 0,
    },
  },
  created_at: "2026-01-01T00:00:00Z",
} as Publication;

const baseVM = {
  isLoading: false,
  publication,
  showFavoriteShare: true,
  isFavorite: false,
  counterpart: {
    title: "Verdulería Natura",
    initials: "VN",
    chatEnabled: false,
  },
  infoItems: [
    { label: "Comercio", value: "Verdulería Natura" },
    { label: "Dirección", value: "Av. Santa Fe 2150", block: true },
  ],
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
    const { queryByText } = render(<PublicationDetailScreen />);
    expect(queryByText("Mix de Verduras")).toBeNull();
  });

  it("renders the publication and reserve CTA for a consumer", () => {
    mockHook();
    const { getByText, getByTestId } = render(<PublicationDetailScreen />);
    expect(getByText("Mix de Verduras")).toBeTruthy();
    expect(getByText("Ahorrás $1.200")).toBeTruthy();
    expect(getByTestId("btn-reserve")).toBeTruthy();
    expect(getByTestId("btn-favorite")).toBeTruthy();
  });

  it("calls handleReservePress when the reserve button is pressed", () => {
    mockHook();
    const { getByTestId } = render(<PublicationDetailScreen />);
    fireEvent.press(getByTestId("btn-reserve"));
    expect(baseVM.handleReservePress).toHaveBeenCalled();
  });

  it("renders edit and delete actions for the commerce owner", () => {
    mockHook({
      footerKind: "commerce",
      showFavoriteShare: false,
      counterpart: {
        title: "Sin reserva aún",
        subtitle: "Esta publicación está disponible",
        leftIcon: "shopping-bag",
        chatEnabled: false,
      },
    });
    const { getByTestId, getByText } = render(<PublicationDetailScreen />);
    expect(getByText("Sin reserva aún")).toBeTruthy();
    fireEvent.press(getByTestId("btn-edit"));
    expect(baseVM.handleEdit).toHaveBeenCalled();
    fireEvent.press(getByTestId("btn-delete"));
    expect(baseVM.handleDeletePress).toHaveBeenCalled();
  });

  it("renders no footer for a terminal status", () => {
    mockHook({ footerKind: "none" });
    const { queryByTestId } = render(<PublicationDetailScreen />);
    expect(queryByTestId("btn-reserve")).toBeNull();
  });
});
