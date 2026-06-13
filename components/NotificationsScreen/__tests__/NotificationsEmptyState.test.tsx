import React from "react";
import { render } from "@testing-library/react-native";
import NotificationsEmptyState from "../NotificationsEmptyState";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

describe("NotificationsEmptyState", () => {
  it("renders the empty state heading", () => {
    const { getByText } = render(<NotificationsEmptyState />);
    expect(getByText("Sin notificaciones")).toBeTruthy();
  });

  it("renders the descriptive hint text", () => {
    const { getByText } = render(<NotificationsEmptyState />);
    expect(getByText("Cuando tengas novedades aparecerán aquí.")).toBeTruthy();
  });
});
