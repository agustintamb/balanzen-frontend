import { fireEvent, render } from "@testing-library/react-native";
import ChatScreen from "../index";
import { useChatScreen, type ChatBubble } from "../useChatScreen";

jest.mock("../useChatScreen", () => ({ useChatScreen: jest.fn() }));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
  useReanimatedKeyboardAnimation: () => ({ progress: { value: 0 } }),
}));
jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: { View },
    useAnimatedStyle: (fn: () => unknown) => fn(),
  };
});

const baseVM = {
  isLoading: false,
  isRefreshing: false,
  counterpartName: "Verdulería Natura",
  counterpartInitials: "VN",
  counterpartPhotoUrl: null,
  isOtherTyping: false,
  messages: [
    { id: "m1", content: "Hola", isMine: false, time: "14:15" },
    { id: "m2", content: "Quiero reservar", isMine: true, time: "14:20" },
  ] as ChatBubble[],
  draft: "",
  isSending: false,
  isAttaching: false,
  onChangeDraft: jest.fn(),
  handleSend: jest.fn(),
  handleAttach: jest.fn(),
  handleRefresh: jest.fn(),
  handleBack: jest.fn(),
};

const mockHook = (overrides: Partial<typeof baseVM> = {}) =>
  (useChatScreen as jest.Mock).mockReturnValue({ ...baseVM, ...overrides });

beforeEach(() => jest.clearAllMocks());

describe("ChatScreen", () => {
  it("renders the counterpart name and the messages", () => {
    mockHook();
    const { getByText } = render(<ChatScreen />);
    expect(getByText("Verdulería Natura")).toBeTruthy();
    expect(getByText("Hola")).toBeTruthy();
    expect(getByText("Quiero reservar")).toBeTruthy();
  });

  it("shows a spinner and no list while loading", () => {
    mockHook({ isLoading: true });
    const { queryByTestId } = render(<ChatScreen />);
    expect(queryByTestId("messages-list")).toBeNull();
    expect(queryByTestId("chat-input")).toBeTruthy();
  });

  it("goes back when the back button is pressed", () => {
    mockHook();
    const { getByTestId } = render(<ChatScreen />);
    fireEvent.press(getByTestId("btn-back"));
    expect(baseVM.handleBack).toHaveBeenCalled();
  });

  it("forwards typing to onChangeDraft", () => {
    mockHook();
    const { getByTestId } = render(<ChatScreen />);
    fireEvent.changeText(getByTestId("chat-input"), "hola");
    expect(baseVM.onChangeDraft).toHaveBeenCalledWith("hola");
  });

  it("sends when there is a draft", () => {
    mockHook({ draft: "hola" });
    const { getByTestId } = render(<ChatScreen />);
    fireEvent.press(getByTestId("btn-send"));
    expect(baseVM.handleSend).toHaveBeenCalled();
  });

  it("does not send with an empty draft (disabled button)", () => {
    mockHook({ draft: "   " });
    const { getByTestId } = render(<ChatScreen />);
    fireEvent.press(getByTestId("btn-send"));
    expect(baseVM.handleSend).not.toHaveBeenCalled();
  });

  it("disables the attach button while attaching", () => {
    mockHook({ isAttaching: true });
    const { getByTestId } = render(<ChatScreen />);
    fireEvent.press(getByTestId("btn-attach"));
    expect(baseVM.handleAttach).not.toHaveBeenCalled();
  });

  it("wires the attach button", () => {
    mockHook();
    const { getByTestId } = render(<ChatScreen />);
    fireEvent.press(getByTestId("btn-attach"));
    expect(baseVM.handleAttach).toHaveBeenCalled();
  });

  it("renders the typing bubble when the counterpart is typing", () => {
    mockHook({ isOtherTyping: true });
    const { getByTestId } = render(<ChatScreen />);
    expect(getByTestId("typing-bubble")).toBeTruthy();
  });

  it("renders an image message as an image, not text", () => {
    mockHook({
      messages: [
        {
          id: "img1",
          content: "https://res.cloudinary.com/x/p.jpg",
          isMine: true,
          time: "14:30",
          imageUrl: "https://res.cloudinary.com/x/p.jpg",
        },
      ],
    });
    const { queryByText } = render(<ChatScreen />);
    expect(queryByText("https://res.cloudinary.com/x/p.jpg")).toBeNull();
  });
});
