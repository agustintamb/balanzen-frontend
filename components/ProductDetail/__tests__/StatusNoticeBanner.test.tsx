import { render } from "@testing-library/react-native";
import StatusNoticeBanner from "../StatusNoticeBanner";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe("StatusNoticeBanner", () => {
  it("renders text with success tone", () => {
    const { getByText } = render(
      <StatusNoticeBanner
        icon="check-circle"
        tone="success"
        text="Pedido entregado."
      />,
    );
    expect(getByText("Pedido entregado.")).toBeTruthy();
  });

  it("renders text with error tone", () => {
    const { getByText } = render(
      <StatusNoticeBanner
        icon="x-circle"
        tone="error"
        text="Esta reserva fue cancelada."
      />,
    );
    expect(getByText("Esta reserva fue cancelada.")).toBeTruthy();
  });

  it("renders text with muted tone", () => {
    const { getByText } = render(
      <StatusNoticeBanner
        icon="clock"
        tone="muted"
        text="Esta publicación venció."
      />,
    );
    expect(getByText("Esta publicación venció.")).toBeTruthy();
  });
});
