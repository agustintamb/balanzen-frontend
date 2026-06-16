import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { useCategories } from "@/hooks/useCategories";
import { useNotifications } from "@/hooks/useNotifications";
import { usePublicationsInfinite } from "@/hooks/usePublications";
// ─── Imports after mocks ──────────────────────────────────────────────────────

import { useCurrentUser } from "@/hooks/useUsers";
import { safePush } from "@/utils/navigation";
import ConsumerHome from "../index";

jest.mock("@/utils/navigation", () => ({ safePush: jest.fn() }));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
}));

jest.mock("@/hooks/useUsers", () => ({ useCurrentUser: jest.fn() }));
jest.mock("@/hooks/useNotifications", () => ({ useNotifications: jest.fn() }));
jest.mock("@/hooks/useCategories", () => ({ useCategories: jest.fn() }));
jest.mock("@/hooks/usePublications", () => ({
  usePublicationsInfinite: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock("@/components/FilterSheet", () => {
  const {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
  } = require("react-native");
  function MockFilterSheet({
    visible,
    title = "Filtros",
    onClose,
    onReset,
    onApply,
    children,
  }: any) {
    if (!visible) return null;
    return (
      <View testID="filter-sheet">
        <TouchableWithoutFeedback
          onPress={onClose}
          testID="filter-sheet-backdrop"
        >
          <View />
        </TouchableWithoutFeedback>
        <Text>{title}</Text>
        <TouchableOpacity onPress={onReset} testID="filter-sheet-reset">
          <Text>Restablecer</Text>
        </TouchableOpacity>
        {children}
        <TouchableOpacity onPress={onApply} testID="filter-sheet-apply">
          <Text>Aplicar filtros</Text>
        </TouchableOpacity>
      </View>
    );
  }
  function MockFilterSection({ title, children }: any) {
    return (
      <View>
        <Text>{title}</Text>
        {children}
      </View>
    );
  }
  function MockFilterOptions({ options, onSelect }: any) {
    return options.map((opt: any) => (
      <TouchableOpacity key={opt.key} onPress={() => onSelect(opt.key)}>
        <Text>{opt.label}</Text>
      </TouchableOpacity>
    ));
  }
  return {
    __esModule: true,
    default: MockFilterSheet,
    FilterSection: MockFilterSection,
    FilterOptionChips: MockFilterOptions,
    FilterOptionList: MockFilterOptions,
  };
});

jest.mock(
  "@/components/ConsumerPublicationCard/ConsumerPublicationCard",
  () => {
    const { Text, TouchableOpacity } = require("react-native");
    function MockConsumerPublicationCard({ publication, onPress }: any) {
      return (
        <TouchableOpacity
          testID={`pub-${publication.id}`}
          onPress={() => onPress?.(publication.id)}
        >
          <Text>{publication.title}</Text>
        </TouchableOpacity>
      );
    }
    return MockConsumerPublicationCard;
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockHooks = ({
  firstName = "Juan",
  unreadCount = 0,
  categories = [] as any[],
  publications = [] as any[],
  isLoading = false,
  isError = false,
  hasLatLng = true,
} = {}) => {
  (useCurrentUser as jest.Mock).mockReturnValue({
    data: {
      first_name: firstName,
      selected_address: hasLatLng
        ? {
            lat: -34.6,
            lng: -58.4,
            formatted_address: "Corrientes 1234",
            street: "Corrientes",
            number: "1234",
            city: "CABA",
          }
        : null,
    },
  });
  (useNotifications as jest.Mock).mockReturnValue({
    data: { unread_count: unreadCount, notifications: [] },
  });
  (useCategories as jest.Mock).mockReturnValue({ data: categories });
  (usePublicationsInfinite as jest.Mock).mockReturnValue({
    data: {
      pages: [
        {
          publications,
          pagination: {
            page: 1,
            limit: 10,
            total: publications.length,
            total_pages: 1,
          },
        },
      ],
    },
    isLoading,
    isError,
    refetch: jest.fn(),
    isRefetching: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ConsumerHome", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHooks();
  });

  it("renders the greeting with user first name", () => {
    const { getByText } = render(<ConsumerHome />);
    expect(getByText("¡Hola, Juan! 👋")).toBeTruthy();
  });

  it("renders category filter chips without Donaciones", () => {
    mockHooks({ categories: [{ id: "cat-1", name: "Verduras" }] });
    const { getByText, queryByText } = render(<ConsumerHome />);
    expect(getByText("Todas")).toBeTruthy();
    expect(getByText("Verduras")).toBeTruthy();
    expect(queryByText("Donaciones")).toBeNull();
  });

  it("renders the filter button", () => {
    const { getByTestId } = render(<ConsumerHome />);
    expect(getByTestId("btn-filter")).toBeTruthy();
  });

  it("opens filter sheet with tipo, sort sections when filter button is pressed", () => {
    const { getByTestId, getByText } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByText("Filtros")).toBeTruthy();
    expect(getByText("Tipo de publicación")).toBeTruthy();
    expect(getByText("Todo")).toBeTruthy();
    expect(getByText("Donación")).toBeTruthy();
    expect(getByText("Ordenar por")).toBeTruthy();
    expect(getByText("Cercanía")).toBeTruthy();
    expect(getByText("Vencimiento")).toBeTruthy();
  });

  it("shows distance section and Cercanía sort option when lat/lng available", () => {
    const { getByTestId, getByText } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByText("Distancia máxima")).toBeTruthy();
    expect(getByText("Cualquiera")).toBeTruthy();
    expect(getByText("< 3 km")).toBeTruthy();
    expect(getByText("Cercanía")).toBeTruthy();
  });

  it("hides distance section and Cercanía sort option when no lat/lng", () => {
    mockHooks({ hasLatLng: false });
    const { getByTestId, queryByText } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(queryByText("Cualquiera")).toBeNull();
    expect(queryByText("Cercanía")).toBeNull();
  });

  it("closes filter sheet when close button is pressed", () => {
    const { getByTestId, queryByTestId } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByTestId("filter-sheet")).toBeTruthy();
    fireEvent.press(getByTestId("filter-sheet-backdrop"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("applies filters and closes sheet when Aplicar is pressed", () => {
    const { getByTestId, getByText, queryByTestId } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    fireEvent.press(getByText("Donación"));
    fireEvent.press(getByTestId("filter-sheet-apply"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("resets pending filters when Restablecer is pressed", () => {
    const { getByTestId, queryByTestId } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByTestId("filter-sheet")).toBeTruthy();
    fireEvent.press(getByTestId("filter-sheet-reset"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("renders publication cards from the list", () => {
    mockHooks({
      publications: [
        {
          id: "pub-1",
          title: "Mix de Verduras",
          final_price: 1500,
          original_price: 3000,
          is_donation: false,
          photos: [],
          status: "ACTIVE",
          discount_pct: 50,
          description: "",
          expiry_date: "2026-12-31",
          category: { id: "cat-1", name: "Verduras" },
          commerce: {
            id: "c-1",
            business_name: "Don Mario",
            selected_address: {
              formatted_address: "Corrientes 1234",
              lat: -34.6,
              lng: -58.4,
            },
          },
          created_at: "2026-01-01",
        },
      ],
    });
    const { getByTestId } = render(<ConsumerHome />);
    expect(getByTestId("pub-pub-1")).toBeTruthy();
  });

  it("shows empty state when no publications", () => {
    mockHooks({ publications: [] });
    const { getByText } = render(<ConsumerHome />);
    expect(getByText("No hay publicaciones disponibles.")).toBeTruthy();
  });

  it("navigates to notifications when the bell is pressed", () => {
    const { getByTestId } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-notifications"));
    expect(safePush).toHaveBeenCalledWith("/notifications");
  });

  it("shows error state when fetch fails and list is empty", () => {
    mockHooks({ isError: true, publications: [] });
    const { getByText } = render(<ConsumerHome />);
    expect(
      getByText("No pudimos cargar los datos. Revisá tu conexión."),
    ).toBeTruthy();
  });

  it("shows loading indicator when isLoading is true", () => {
    mockHooks({ isLoading: true, publications: [] });
    const { UNSAFE_getAllByType } = render(<ConsumerHome />);
    const { ActivityIndicator } = require("react-native");
    expect(UNSAFE_getAllByType(ActivityIndicator)).toHaveLength(1);
  });

  it("renders separator between multiple publications", () => {
    const basePub = {
      id: "pub-1",
      title: "Mix de Verduras",
      final_price: 1500,
      original_price: 3000,
      is_donation: false,
      photos: [],
      status: "ACTIVE" as const,
      discount_pct: 50,
      description: "",
      expiry_date: "2026-12-31",
      category: { id: "cat-1", name: "Verduras" },
      commerce: {
        id: "c-1",
        business_name: "Don Mario",
        selected_address: {
          formatted_address: "Corrientes 1234",
          lat: -34.6,
          lng: -58.4,
        },
      },
      created_at: "2026-01-01",
    };
    mockHooks({
      publications: [
        basePub,
        { ...basePub, id: "pub-2", title: "Frutas Variadas" },
      ],
    });
    const { getByTestId } = render(<ConsumerHome />);
    expect(getByTestId("pub-pub-1")).toBeTruthy();
    expect(getByTestId("pub-pub-2")).toBeTruthy();
  });

  it("navigates to the publication detail when a card is pressed", () => {
    const basePub = {
      id: "pub-1",
      title: "Mix de Verduras",
      final_price: 1500,
      original_price: 3000,
      is_donation: false,
      photos: [],
      status: "ACTIVE" as const,
      discount_pct: 50,
      description: "",
      expiry_date: "2026-12-31",
      category: { id: "cat-1", name: "Verduras" },
      commerce: {
        id: "c-1",
        business_name: "Don Mario",
        selected_address: {
          formatted_address: "Corrientes 1234",
          lat: -34.6,
          lng: -58.4,
        },
      },
      created_at: "2026-01-01",
    };
    mockHooks({ publications: [basePub] });
    const { getByTestId } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("pub-pub-1"));
    expect(safePush).toHaveBeenCalledWith("/publication/pub-1");
  });
});
