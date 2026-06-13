import React from "react";
import { render } from "@testing-library/react-native";
import FavoritesEmptyState from "../FavoritesEmptyState";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

describe("FavoritesEmptyState", () => {
  it("renders the empty state heading", () => {
    const { getByText } = render(<FavoritesEmptyState />);
    expect(getByText("Todavía no tenés favoritos")).toBeTruthy();
  });

  it("renders the descriptive hint text", () => {
    const { getByText } = render(<FavoritesEmptyState />);
    expect(
      getByText(
        "Guardá publicaciones que te interesen para encontrarlas fácilmente.",
      ),
    ).toBeTruthy();
  });
});
