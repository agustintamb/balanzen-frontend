import PublishProductScreen from "@/components/PublishProductScreen";
import PublishRoute from "../index";

jest.mock("@/components/PublishProductScreen", () => ({
  __esModule: true,
  default: () => null,
}));

describe("(commerce)/publish/index route", () => {
  it("re-exports the PublishProductScreen component", () => {
    expect(PublishRoute).toBe(PublishProductScreen);
  });
});
