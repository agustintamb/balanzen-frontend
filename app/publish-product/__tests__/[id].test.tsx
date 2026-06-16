import PublishProductScreen from "@/components/PublishProductScreen";
import PublishProductRoute from "../[id]";

jest.mock("@/components/PublishProductScreen", () => ({
  __esModule: true,
  default: () => null,
}));

describe("publish-product/[id] route", () => {
  it("re-exports the PublishProductScreen component", () => {
    expect(PublishProductRoute).toBe(PublishProductScreen);
  });
});
