import { useLocalSearchParams, useRouter } from "expo-router";
import { act, renderHook } from "@testing-library/react-native";
import { useChatMessages, useChats, useSendMessage } from "@/hooks/useChats";
import { useUploadImage } from "@/hooks/useUploads";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/stores/ui.store";
import { useChatScreen } from "../useChatScreen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/useChats", () => ({
  useChatMessages: jest.fn(),
  useChats: jest.fn(),
  useSendMessage: jest.fn(),
}));
jest.mock("@/hooks/useUploads", () => ({ useUploadImage: jest.fn() }));
jest.mock("@/stores/auth.store", () => ({ useAuthStore: jest.fn() }));
jest.mock("@/stores/ui.store", () => ({ useToast: jest.fn() }));
jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock("../useChatSocket", () => ({
  useChatSocket: () => ({ isOtherTyping: false, notifyTyping: jest.fn() }),
}));

const mockSend = jest.fn();
const mockBack = jest.fn();
const mockUpload = jest.fn();
const mockShowWarning = jest.fn();
const mockShowError = jest.fn();

const MESSAGES = [
  {
    id: "m2",
    sender_id: "other",
    content: "Hola",
    created_at: "2026-06-14T14:18:00Z",
  },
  {
    id: "m1",
    sender_id: "c1",
    content: "Quiero reservar",
    created_at: "2026-06-14T14:15:00Z",
  },
];

const buildCounterpart = (overrides = {}) => ({
  id: "comm1",
  first_name: "",
  last_name: "",
  photo_url: "https://cdn/avatar.jpg",
  business_name: "Verdulería Natura",
  ...overrides,
});

const setup = ({
  messages = MESSAGES,
  counterpart = buildCounterpart(),
  isPending = false,
}: {
  messages?: typeof MESSAGES;
  counterpart?: ReturnType<typeof buildCounterpart> | null;
  isPending?: boolean;
} = {}) => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ orderId: "order-1" });
  (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
  (useChatMessages as jest.Mock).mockReturnValue({
    data: { messages },
    isLoading: false,
  });
  (useChats as jest.Mock).mockReturnValue({
    data: counterpart ? [{ order_id: "order-1", counterpart }] : [],
  });
  (useSendMessage as jest.Mock).mockReturnValue({
    mutate: mockSend,
    isPending,
  });
  (useUploadImage as jest.Mock).mockReturnValue({ mutateAsync: mockUpload });
  (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) =>
    selector({ user: { id: "c1" } }),
  );
  (useToast as jest.Mock).mockReturnValue({
    showWarning: mockShowWarning,
    showError: mockShowError,
  });
};

beforeEach(() => jest.clearAllMocks());

describe("useChatScreen", () => {
  it("sorts messages ascending by date and flags ownership", () => {
    setup();
    const { result } = renderHook(() => useChatScreen());
    expect(result.current.messages.map((m) => m.id)).toEqual(["m1", "m2"]);
    expect(result.current.messages[0].isMine).toBe(true);
    expect(result.current.messages[1].isMine).toBe(false);
  });

  it("exposes the counterpart name, initials and avatar", () => {
    setup();
    const { result } = renderHook(() => useChatScreen());
    expect(result.current.counterpartName).toBe("Verdulería Natura");
    expect(result.current.counterpartInitials).toBe("VN");
    expect(result.current.counterpartPhotoUrl).toBe("https://cdn/avatar.jpg");
  });

  it("falls back to 'Chat' when no matching chat exists", () => {
    setup({ counterpart: null });
    const { result } = renderHook(() => useChatScreen());
    expect(result.current.counterpartName).toBe("Chat");
  });

  it("flags cloudinary image messages with an imageUrl", () => {
    setup({
      messages: [
        {
          id: "img1",
          sender_id: "c1",
          content: "https://res.cloudinary.com/x/image/upload/v1/p.jpg",
          created_at: "2026-06-14T14:20:00Z",
        },
      ],
    });
    const { result } = renderHook(() => useChatScreen());
    expect(result.current.messages[0].imageUrl).toBe(
      "https://res.cloudinary.com/x/image/upload/v1/p.jpg",
    );
  });

  it("sends a trimmed message and clears the draft", () => {
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.onChangeDraft("  hola  "));
    act(() => result.current.handleSend());
    expect(mockSend).toHaveBeenCalledWith("hola");
    expect(result.current.draft).toBe("");
  });

  it("does not send an empty draft", () => {
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleSend());
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("does not send while a send is already pending", () => {
    setup({ isPending: true });
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.onChangeDraft("hola"));
    act(() => result.current.handleSend());
    expect(mockSend).not.toHaveBeenCalled();
  });
});
