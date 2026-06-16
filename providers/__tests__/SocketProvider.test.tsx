import { Text } from "react-native";
import { act, render } from "@testing-library/react-native";
import { connectSocket, disconnectSocket } from "@/lib/socket/socketClient";
import { useAuthStore } from "@/stores/auth.store";
import SocketProvider, { useSocketContext } from "../SocketProvider";

jest.mock("@/lib/socket/socketClient", () => ({
  connectSocket: jest.fn(),
  disconnectSocket: jest.fn(),
}));
jest.mock("@/stores/auth.store", () => ({ useAuthStore: jest.fn() }));

const mockConnect = connectSocket as jest.Mock;
const mockDisconnect = disconnectSocket as jest.Mock;

type Handlers = Record<string, (...args: unknown[]) => void>;

const makeSocket = (connected = false) => {
  const handlers: Handlers = {};
  return {
    connected,
    on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = handler;
    }),
    off: jest.fn(),
    emit: jest.fn(),
    fire: (event: string) => handlers[event]?.(),
  };
};

let captured: ReturnType<typeof useSocketContext>;
const Consumer = () => {
  captured = useSocketContext();
  return <Text testID="connected">{String(captured.isConnected)}</Text>;
};

const setToken = (token: string | null) => {
  (useAuthStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: { accessToken: string | null }) => unknown) =>
      selector({ accessToken: token }),
  );
};

const renderProvider = () =>
  render(
    <SocketProvider>
      <Consumer />
    </SocketProvider>,
  );

beforeEach(() => jest.clearAllMocks());

describe("SocketProvider", () => {
  it("does not connect when there is no token", () => {
    setToken(null);
    renderProvider();
    expect(mockConnect).not.toHaveBeenCalled();
    expect(mockDisconnect).toHaveBeenCalled();
    expect(captured.isConnected).toBe(false);
  });

  it("connects and authenticates, flipping isConnected on 'authenticated'", () => {
    const socket = makeSocket(false);
    mockConnect.mockReturnValue(socket);
    setToken("jwt-123");

    renderProvider();
    expect(mockConnect).toHaveBeenCalled();

    act(() => socket.fire("connect"));
    expect(socket.emit).toHaveBeenCalledWith("authenticate", {
      token: "jwt-123",
    });

    act(() => socket.fire("authenticated"));
    expect(captured.isConnected).toBe(true);

    act(() => socket.fire("disconnect"));
    expect(captured.isConnected).toBe(false);
  });

  it("emits authenticate immediately when already connected", () => {
    const socket = makeSocket(true);
    mockConnect.mockReturnValue(socket);
    setToken("jwt-xyz");

    renderProvider();
    expect(socket.emit).toHaveBeenCalledWith("authenticate", {
      token: "jwt-xyz",
    });
  });
});
