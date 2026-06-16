import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { act, renderHook } from "@testing-library/react-native";
import { useChatMessages, useChats, useSendMessage } from "@/hooks/useChats";
import { useUploadImage } from "@/hooks/useUploads";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/stores/ui.store";
import { useChatScreen } from "../useChatScreen";

const mockNotifyTyping = jest.fn();

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
  useChatSocket: () => ({
    isOtherTyping: false,
    notifyTyping: mockNotifyTyping,
  }),
}));

const mockSend = jest.fn();
const mockBack = jest.fn();
const mockUpload = jest.fn();
const mockRefetch = jest.fn().mockResolvedValue(undefined);
const mockShowWarning = jest.fn();
const mockShowError = jest.fn();
const mockRequestCamera =
  ImagePicker.requestCameraPermissionsAsync as jest.Mock;
const mockRequestLibrary =
  ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const mockLaunchCamera = ImagePicker.launchCameraAsync as jest.Mock;
const mockLaunchLibrary = ImagePicker.launchImageLibraryAsync as jest.Mock;

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
    refetch: mockRefetch,
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

const grantedPick = (uri = "file:///tmp/p.jpg") => {
  mockRequestCamera.mockResolvedValue({ status: "granted" });
  mockRequestLibrary.mockResolvedValue({ status: "granted" });
  mockLaunchCamera.mockResolvedValue({ canceled: false, assets: [{ uri }] });
  mockLaunchLibrary.mockResolvedValue({ canceled: false, assets: [{ uri }] });
};

const pressAttachButton = async (index: number) => {
  const buttons = (Alert.alert as jest.Mock).mock.calls.at(-1)?.[2];
  await act(async () => {
    buttons[index].onPress?.();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
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

  it("sends a trimmed message, clears the draft and stops typing", () => {
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.onChangeDraft("  hola  "));
    act(() => result.current.handleSend());
    expect(mockSend).toHaveBeenCalledWith("hola");
    expect(result.current.draft).toBe("");
    expect(mockNotifyTyping).toHaveBeenCalledWith(false);
  });

  it("does not send an empty draft", () => {
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleSend());
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("navigates back", () => {
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleBack());
    expect(mockBack).toHaveBeenCalled();
  });

  it("does not send while a send is already pending", () => {
    setup({ isPending: true });
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.onChangeDraft("hola"));
    act(() => result.current.handleSend());
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("notifies typing on change and stops after the idle timeout", () => {
    jest.useFakeTimers();
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.onChangeDraft("ho"));
    expect(mockNotifyTyping).toHaveBeenCalledWith(true);
    act(() => jest.advanceTimersByTime(2500));
    expect(mockNotifyTyping).toHaveBeenCalledWith(false);
    jest.useRealTimers();
  });

  it("clears the typing timer on unmount", () => {
    jest.useFakeTimers();
    const clearSpy = jest.spyOn(globalThis, "clearTimeout");
    setup();
    const { result, unmount } = renderHook(() => useChatScreen());
    act(() => result.current.onChangeDraft("ho"));
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
    jest.useRealTimers();
  });

  it("refreshes messages via pull-to-refresh", async () => {
    setup();
    const { result } = renderHook(() => useChatScreen());
    await act(async () => {
      await result.current.handleRefresh();
    });
    expect(mockRefetch).toHaveBeenCalled();
    expect(result.current.isRefreshing).toBe(false);
  });

  it("opens an action sheet to attach a photo", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleAttach());
    expect(alertSpy).toHaveBeenCalledWith(
      "Enviar foto",
      undefined,
      expect.any(Array),
    );
    alertSpy.mockRestore();
  });

  it("uploads and sends a photo taken with the camera", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    grantedPick();
    mockUpload.mockResolvedValue({ url: "https://res.cloudinary.com/c/p.jpg" });
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleAttach());
    await pressAttachButton(0);
    expect(mockUpload).toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalledWith("https://res.cloudinary.com/c/p.jpg");
  });

  it("uploads and sends a photo from the gallery", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    grantedPick();
    mockUpload.mockResolvedValue({ url: "https://res.cloudinary.com/g/p.jpg" });
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleAttach());
    await pressAttachButton(1);
    expect(mockSend).toHaveBeenCalledWith("https://res.cloudinary.com/g/p.jpg");
  });

  it("warns when camera permission is denied", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockRequestCamera.mockResolvedValue({ status: "denied" });
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleAttach());
    await pressAttachButton(0);
    expect(mockShowWarning).toHaveBeenCalled();
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("does nothing when the picker is canceled", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockRequestLibrary.mockResolvedValue({ status: "granted" });
    mockLaunchLibrary.mockResolvedValue({ canceled: true });
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleAttach());
    await pressAttachButton(1);
    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("shows an error when the upload fails", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    grantedPick();
    mockUpload.mockRejectedValue(new Error("boom"));
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleAttach());
    await pressAttachButton(0);
    expect(mockShowError).toHaveBeenCalled();
  });

  it("warns when gallery permission is denied", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockRequestLibrary.mockResolvedValue({ status: "denied" });
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleAttach());
    await pressAttachButton(1);
    expect(mockShowWarning).toHaveBeenCalled();
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("does nothing when the picker returns no asset", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockRequestCamera.mockResolvedValue({ status: "granted" });
    mockLaunchCamera.mockResolvedValue({ canceled: false, assets: [] });
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleAttach());
    await pressAttachButton(0);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("ignores a second attach while one is in progress", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockRequestCamera.mockResolvedValue({ status: "granted" });
    mockLaunchCamera.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///p.jpg" }],
    });
    mockUpload.mockReturnValue(new Promise(() => {}));
    setup();
    const { result } = renderHook(() => useChatScreen());
    act(() => result.current.handleAttach());
    await pressAttachButton(0);
    expect(result.current.isAttaching).toBe(true);
    act(() => result.current.handleAttach());
    expect(alertSpy).toHaveBeenCalledTimes(1);
  });

  it("falls back to an empty order id when the param is missing", () => {
    setup();
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    const { result } = renderHook(() => useChatScreen());
    expect(result.current.counterpartName).toBe("Chat");
  });

  it("builds the counterpart name from first/last when there is no business name", () => {
    setup({
      counterpart: buildCounterpart({
        business_name: undefined,
        first_name: "Juan",
        last_name: "Pérez",
      }),
    });
    const { result } = renderHook(() => useChatScreen());
    expect(result.current.counterpartName).toBe("Juan Pérez");
    expect(result.current.counterpartInitials).toBe("JP");
  });

  it("returns an empty message list when there is no data", () => {
    setup();
    (useChatMessages as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      refetch: mockRefetch,
    });
    const { result } = renderHook(() => useChatScreen());
    expect(result.current.messages).toEqual([]);
  });

  it("classifies message content as image or text", () => {
    setup({
      messages: [
        {
          id: "a",
          sender_id: "x",
          content: "Hola",
          created_at: "2026-06-14T14:10:00Z",
        },
        {
          id: "b",
          sender_id: "x",
          content: "https://cdn.x/p.png",
          created_at: "2026-06-14T14:11:00Z",
        },
        {
          id: "c",
          sender_id: "x",
          content: "https://cdn.x/page",
          created_at: "2026-06-14T14:12:00Z",
        },
      ],
    });
    const { result } = renderHook(() => useChatScreen());
    const byId = Object.fromEntries(
      result.current.messages.map((m) => [m.id, m]),
    );
    expect(byId.a.imageUrl).toBeUndefined();
    expect(byId.b.imageUrl).toBe("https://cdn.x/p.png");
    expect(byId.c.imageUrl).toBeUndefined();
  });
});
