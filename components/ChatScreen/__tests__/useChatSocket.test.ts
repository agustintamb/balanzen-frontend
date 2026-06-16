import { act, renderHook } from "@testing-library/react-native";
import createWrapper from "@/__test-utils__/createWrapper";
import { useSocket, useSocketEvent } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/auth.store";
import { useChatSocket } from "../useChatSocket";

jest.mock("@/hooks/useSocket", () => ({
  useSocket: jest.fn(),
  useSocketEvent: jest.fn(),
}));
jest.mock("@/stores/auth.store", () => ({ useAuthStore: jest.fn() }));

const mockUseSocket = useSocket as jest.Mock;
const mockUseSocketEvent = useSocketEvent as jest.Mock;

const makeSocket = () => ({ emit: jest.fn() });

const getHandler = (event: string) => {
  const call = mockUseSocketEvent.mock.calls.find(([e]) => e === event);
  return call?.[1] as (payload: unknown) => void;
};

const setup = (isConnected = true) => {
  const socket = makeSocket();
  mockUseSocket.mockReturnValue({ socket, isConnected });
  (useAuthStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: { user: { id: string } }) => unknown) =>
      selector({ user: { id: "me" } }),
  );
  const { wrapper, queryClient } = createWrapper();
  const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
  const view = renderHook(() => useChatSocket("order-1"), { wrapper });
  return { socket, invalidateSpy, ...view };
};

beforeEach(() => jest.clearAllMocks());

describe("useChatSocket", () => {
  it("joins the room on mount and leaves on unmount when connected", () => {
    const { socket, unmount } = setup(true);
    expect(socket.emit).toHaveBeenCalledWith("join_chat", {
      order_id: "order-1",
    });
    unmount();
    expect(socket.emit).toHaveBeenCalledWith("leave_chat", {
      order_id: "order-1",
    });
  });

  it("does not join when not connected", () => {
    const { socket } = setup(false);
    expect(socket.emit).not.toHaveBeenCalled();
  });

  it("invalidates message and chat queries on a matching new_message", () => {
    const { invalidateSpy } = setup(true);
    act(() => getHandler("new_message")({ order_id: "order-1" }));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["chats", "order-1", "messages"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["chats"] });
  });

  it("ignores new_message for another order", () => {
    const { invalidateSpy } = setup(true);
    act(() => getHandler("new_message")({ order_id: "other" }));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("reflects the counterpart typing state", () => {
    const { result } = setup(true);
    act(() =>
      getHandler("user_typing")({
        order_id: "order-1",
        user_id: "other",
        is_typing: true,
      }),
    );
    expect(result.current.isOtherTyping).toBe(true);
  });

  it("ignores own typing and other orders", () => {
    const { result } = setup(true);
    act(() =>
      getHandler("user_typing")({
        order_id: "order-1",
        user_id: "me",
        is_typing: true,
      }),
    );
    expect(result.current.isOtherTyping).toBe(false);
    act(() =>
      getHandler("user_typing")({
        order_id: "other",
        user_id: "other",
        is_typing: true,
      }),
    );
    expect(result.current.isOtherTyping).toBe(false);
  });

  it("emits typing when connected and skips when not", () => {
    const connected = setup(true);
    act(() => connected.result.current.notifyTyping(true));
    expect(connected.socket.emit).toHaveBeenCalledWith("typing", {
      order_id: "order-1",
      is_typing: true,
    });

    jest.clearAllMocks();
    const offline = setup(false);
    act(() => offline.result.current.notifyTyping(true));
    expect(offline.socket.emit).not.toHaveBeenCalled();
  });
});
