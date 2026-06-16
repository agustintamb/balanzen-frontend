import ChatScreen from "@/components/ChatScreen";
import ChatRoute from "../[orderId]";

jest.mock("@/components/ChatScreen", () => ({
  __esModule: true,
  default: () => null,
}));

describe("chat/[orderId] route", () => {
  it("re-exports the ChatScreen component", () => {
    expect(ChatRoute).toBe(ChatScreen);
  });
});
