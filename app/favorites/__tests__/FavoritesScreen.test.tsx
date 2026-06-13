import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import FavoritesScreen from "../index";
import { useFavoritesScreen } from "../useFavoritesScreen";

jest.mock("../useFavoritesScreen", () => ({
  useFavoritesScreen: jest.fn(),
}));

jest.mock("../FavoriteCard", () => () => null);
jest.mock("../FavoritesEmptyState", () => () => null);
jest.mock("@/components/ui/ActionSheet", () => () => null);
jest.mock("@/components/ui/Icon", () => () => null);
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

const BASE_HOOK = {
  favorites: [],
  total: 0,
  isLoading: false,
  isRefetching: false,
  isRemoving: false,
  pendingRemoveId: null,
  refetch: jest.fn(),
  handleBack: jest.fn(),
  handleRemove: jest.fn(),
  handleRemoveConfirm: jest.fn(),
  handleRemoveCancel: jest.fn(),
};

const setup = (overrides = {}) => {
  (useFavoritesScreen as jest.Mock).mockReturnValue({
    ...BASE_HOOK,
    ...overrides,
  });
};

describe("FavoritesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("renders the title", () => {
    const { getByText } = render(<FavoritesScreen />);
    expect(getByText("Mis favoritos")).toBeTruthy();
  });

  it("shows loading indicator when isLoading is true", () => {
    setup({ isLoading: true });
    const { UNSAFE_getByType } = render(<FavoritesScreen />);
    const { ActivityIndicator } = require("react-native");
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("calls handleBack when back button is pressed", () => {
    const handleBack = jest.fn();
    setup({ handleBack });
    const { getByTestId } = render(<FavoritesScreen />);
    fireEvent.press(getByTestId("btn-back"));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("shows total badge when total > 0", () => {
    setup({ total: 7 });
    const { getByText } = render(<FavoritesScreen />);
    expect(getByText("7")).toBeTruthy();
  });

  it("renders FlatList body when favorites exist", () => {
    setup({
      favorites: [
        {
          id: "fav1",
          publication: { id: "pub1", title: "Pizza margherita" },
        } as any,
      ],
      total: 1,
    });
    const { toJSON } = render(<FavoritesScreen />);
    expect(toJSON()).not.toBeNull();
  });
});
