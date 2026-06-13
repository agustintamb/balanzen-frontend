import React from "react";
import { render } from "@testing-library/react-native";
import NotificationsErrorState from "../NotificationsErrorState";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

describe("NotificationsErrorState", () => {
  it("renders the error heading", () => {
    const { getByText } = render(<NotificationsErrorState />);
    expect(getByText("Error al cargar")).toBeTruthy();
  });

  it("renders the error description", () => {
    const { getByText } = render(<NotificationsErrorState />);
    expect(
      getByText("No se pudieron obtener las notificaciones."),
    ).toBeTruthy();
  });
});
