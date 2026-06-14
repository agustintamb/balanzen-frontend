import ConsumerPublicationCard from "@/components/ConsumerPublicationCard";

jest.mock("@/utils/cloudinary", () => ({
  buildCardImageUrl: jest.fn((url: string) => `card:${url}`),
}));

describe("ConsumerPublicationCard barrel", () => {
  it("re-exports ConsumerPublicationCard as default", () => {
    expect(ConsumerPublicationCard).toBeDefined();
    expect(typeof ConsumerPublicationCard).toBe("function");
  });
});
