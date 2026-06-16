import { fireEvent, render } from "@testing-library/react-native";
import type { Publication } from "@/api/publications/publications.types";
import OrderDetailScreen from "../index";
import { useOrderDetailScreen } from "../useOrderDetailScreen";

jest.mock("../useOrderDetailScreen", () => ({
  useOrderDetailScreen: jest.fn(),
}));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));

const publication = {
  id: "pub-1",
  title: "Pack de Medialunas",
  description: "Frescas",
  original_price: 1600,
  final_price: 800,
  discount_pct: 50,
  expiry_date: "2026-12-31T23:59:00Z",
  category: { id: "c", name: "Panadería" },
  photos: ["https://img/1.jpg"],
  status: "RESERVED",
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
  showFavoriteShare: false,
  isFavorite: false,
  counterpart: {
    title: "María Alejandra",
    initials: "MA",
    avatarUrl: null,
    chatEnabled: true,
  },
  infoItems: [{ label: "Cliente", value: "María Alejandra" }],
  footerKind: "commerce-actions" as const,
  isCancelling: false,
  isDelivering: false,
  isRefetching: false,
  cancelVisible: false,
  deliverVisible: false,
  successVisible: false,
  handleBack: jest.fn(),
  handleRefresh: jest.fn(),
  handleChat: jest.fn(),
  handleToggleFavorite: jest.fn(),
  handleShare: jest.fn(),
  handleCancelPress: jest.fn(),
  handleCloseCancel: jest.fn(),
  confirmCancel: jest.fn(),
  handleDeliverPress: jest.fn(),
  handleCloseDeliver: jest.fn(),
  confirmDeliver: jest.fn(),
  handleSuccessDone: jest.fn(),
};

type VM = ReturnType<typeof useOrderDetailScreen>;

const mockHook = (overrides: Partial<VM> = {}) =>
  (useOrderDetailScreen as jest.Mock).mockReturnValue({
    ...baseVM,
    ...overrides,
  });

beforeEach(() => jest.clearAllMocks());

describe("OrderDetailScreen", () => {
  it("renders a spinner while loading", () => {
    mockHook({ isLoading: true });
    const { queryByText } = render(<OrderDetailScreen />);
    expect(queryByText("Pack de Medialunas")).toBeNull();
  });

  it("renders the consumer and commerce actions for the commerce", () => {
    mockHook();
    const { getAllByText, getByText, getByTestId } = render(
      <OrderDetailScreen />,
    );
    expect(getAllByText("María Alejandra").length).toBeGreaterThan(0);
    expect(getByText("Cliente")).toBeTruthy();
    expect(getByTestId("btn-deliver")).toBeTruthy();
    expect(getByTestId("btn-cancel")).toBeTruthy();
  });

  it("wires deliver and chat actions", () => {
    mockHook();
    const { getByTestId } = render(<OrderDetailScreen />);
    fireEvent.press(getByTestId("btn-deliver"));
    expect(baseVM.handleDeliverPress).toHaveBeenCalled();
    fireEvent.press(getByTestId("btn-chat"));
    expect(baseVM.handleChat).toHaveBeenCalled();
  });

  it("renders the delivery success overlay when successVisible", () => {
    mockHook({ successVisible: true });
    const { getByText } = render(<OrderDetailScreen />);
    expect(getByText("¡Pedido entregado!")).toBeTruthy();
  });

  it("renders only a cancel action for the consumer", () => {
    mockHook({
      footerKind: "consumer-cancel",
      showFavoriteShare: true,
      counterpart: {
        title: "Verdulería Natura",
        subtitle: "Comercio",
        chatEnabled: true,
      },
    });
    const { getByTestId, queryByTestId } = render(<OrderDetailScreen />);
    expect(getByTestId("btn-cancel")).toBeTruthy();
    expect(queryByTestId("btn-deliver")).toBeNull();
    expect(getByTestId("btn-favorite")).toBeTruthy();
  });

  it("renders no footer for a terminal order", () => {
    mockHook({ footerKind: "none" });
    const { queryByTestId } = render(<OrderDetailScreen />);
    expect(queryByTestId("btn-cancel")).toBeNull();
    expect(queryByTestId("btn-deliver")).toBeNull();
  });
});
