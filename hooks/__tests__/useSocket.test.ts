import { renderHook } from "@testing-library/react-native";
import { useSocket, useSocketEvent } from "@/hooks/useSocket";
import { useSocketContext } from "@/providers/SocketProvider";

jest.mock("@/providers/SocketProvider", () => ({
  useSocketContext: jest.fn(),
}));

const makeSocket = () => {
  const handlers: Record<string, (p: unknown) => void> = {};
  return {
    on: jest.fn((event: string, handler: (p: unknown) => void) => {
      handlers[event] = handler;
    }),
    off: jest.fn(),
    fire: (event: string, payload: unknown) => handlers[event]?.(payload),
  };
};

const mockContext = (value: { socket: unknown; isConnected?: boolean }) =>
  (useSocketContext as jest.Mock).mockReturnValue({
    isConnected: false,
    ...value,
  });

beforeEach(() => jest.clearAllMocks());

describe("useSocket", () => {
  it("returns the socket context", () => {
    const ctx = { socket: makeSocket(), isConnected: true };
    mockContext(ctx);
    const { result } = renderHook(() => useSocket());
    expect(result.current).toBe(
      (useSocketContext as jest.Mock).mock.results[0].value,
    );
  });
});

describe("useSocketEvent", () => {
  it("subscribes, forwards payloads and cleans up", () => {
    const socket = makeSocket();
    mockContext({ socket });
    const handler = jest.fn();

    const { unmount } = renderHook(() => useSocketEvent("ping", handler));
    expect(socket.on).toHaveBeenCalledWith("ping", expect.any(Function));

    socket.fire("ping", { ok: true });
    expect(handler).toHaveBeenCalledWith({ ok: true });

    unmount();
    expect(socket.off).toHaveBeenCalledWith("ping", expect.any(Function));
  });

  it("does not subscribe when disabled", () => {
    const socket = makeSocket();
    mockContext({ socket });
    renderHook(() => useSocketEvent("ping", jest.fn(), false));
    expect(socket.on).not.toHaveBeenCalled();
  });

  it("does nothing when there is no socket", () => {
    mockContext({ socket: null });
    const { result } = renderHook(() => useSocketEvent("ping", jest.fn()));
    expect(result.current).toBeUndefined();
  });
});
