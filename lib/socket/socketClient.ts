import { io, type Socket } from "socket.io-client";
import envConfig from "@/config/env";

const SOCKET_PATH = "/ws";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(envConfig.SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      path: SOCKET_PATH,
    });
  }
  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  socket?.disconnect();
};
