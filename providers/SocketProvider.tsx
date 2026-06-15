import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket } from "@/lib/socket/socketClient";
import { useAuthStore } from "@/stores/auth.store";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((s) => s.accessToken);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const s = connectSocket();
    setSocket(s);

    const handleConnect = () => s.emit("authenticate", { token });
    const handleAuthenticated = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    s.on("connect", handleConnect);
    s.on("authenticated", handleAuthenticated);
    s.on("disconnect", handleDisconnect);
    if (s.connected) handleConnect();

    return () => {
      s.off("connect", handleConnect);
      s.off("authenticated", handleAuthenticated);
      s.off("disconnect", handleDisconnect);
    };
  }, [token]);

  const value = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
