import { fireEvent, render } from "@testing-library/react-native";
import MessageBubble from "../MessageBubble";
import type { ChatBubble } from "../useChatScreen";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

const build = (overrides: Partial<ChatBubble> = {}): ChatBubble => ({
  id: "m1",
  content: "Hola",
  isMine: false,
  time: "14:15",
  ...overrides,
});

describe("MessageBubble", () => {
  it("renders a text message from the counterpart", () => {
    const { getByText } = render(<MessageBubble message={build()} />);
    expect(getByText("Hola")).toBeTruthy();
    expect(getByText("14:15")).toBeTruthy();
  });

  it("renders a sent (mine) text message", () => {
    const { getByText } = render(
      <MessageBubble message={build({ isMine: true, content: "Listo" })} />,
    );
    expect(getByText("Listo")).toBeTruthy();
  });

  it("renders an image message and opens the fullscreen viewer on press", () => {
    const { getByTestId, queryByText } = render(
      <MessageBubble
        message={build({
          content: "https://res.cloudinary.com/x/p.jpg",
          imageUrl: "https://res.cloudinary.com/x/p.jpg",
        })}
      />,
    );
    expect(queryByText("https://res.cloudinary.com/x/p.jpg")).toBeNull();
    fireEvent.press(getByTestId("message-image"));
    const close = getByTestId("btn-close-gallery");
    expect(close).toBeTruthy();
    fireEvent.press(close);
  });
});
