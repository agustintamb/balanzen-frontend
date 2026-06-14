import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import HomeErrorBody from "@/components/HomeErrorBody";

describe("HomeErrorBody", () => {
  it("renders the error message", () => {
    const { getByText } = render(<HomeErrorBody onRetry={jest.fn()} />);
    expect(
      getByText("No pudimos cargar los datos. Revisá tu conexión."),
    ).toBeTruthy();
  });

  it("renders the retry button", () => {
    const { getByText } = render(<HomeErrorBody onRetry={jest.fn()} />);
    expect(getByText("Reintentar")).toBeTruthy();
  });

  it("calls onRetry when retry button is pressed", () => {
    const onRetry = jest.fn();
    const { getByText } = render(<HomeErrorBody onRetry={onRetry} />);
    fireEvent.press(getByText("Reintentar"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
