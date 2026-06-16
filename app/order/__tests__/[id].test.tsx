import OrderDetailScreen from "@/components/OrderDetailScreen";
import OrderRoute from "../[id]";

jest.mock("@/components/OrderDetailScreen", () => ({
  __esModule: true,
  default: () => null,
}));

describe("order/[id] route", () => {
  it("re-exports the OrderDetailScreen component", () => {
    expect(OrderRoute).toBe(OrderDetailScreen);
  });
});
