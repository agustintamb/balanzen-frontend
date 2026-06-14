import React from "react";
import { render } from "@testing-library/react-native";
import HomeListEmpty from "@/app/(consumer)/home/components/HomeListEmpty";

describe("HomeListEmpty", () => {
  it("renders the empty message when not loading", () => {
    const { getByText } = render(<HomeListEmpty isLoading={false} />);
    expect(getByText("No hay publicaciones disponibles.")).toBeTruthy();
  });

  it("renders nothing when isLoading is true", () => {
    const { queryByText } = render(<HomeListEmpty isLoading={true} />);
    expect(queryByText("No hay publicaciones disponibles.")).toBeNull();
  });
});
