import PublicationDetailScreen from "@/components/PublicationDetailScreen";
import PublicationRoute from "../[id]";

jest.mock("@/components/PublicationDetailScreen", () => ({
  __esModule: true,
  default: () => null,
}));

describe("publication/[id] route", () => {
  it("re-exports the PublicationDetailScreen component", () => {
    expect(PublicationRoute).toBe(PublicationDetailScreen);
  });
});
