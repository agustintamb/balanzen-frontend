import { io, type Socket } from "socket.io-client";
import envConfig from "@/config/env";

/**
 * Path de socket.io para la conexión general (chat + notificaciones).
 * Una sola conexión por usuario para toda la app. Es el `path` del server
 * (no un namespace), por eso se conecta a `SOCKET_URL` con `{ path: "/ws" }`.
 */
const SOCKET_PATH = "/ws";

let socket: Socket | null = null;

/**
 * Devuelve el socket singleton (lo crea de forma perezosa, sin conectar).
 * No conecta solo: usar `connectSocket`.
 */
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

/**
 * Conecta el socket si no lo está. La autenticación NO va en el handshake: el
 * `SocketProvider` emite `authenticate { token }` tras `connect` y espera
 * `authenticated` antes de habilitar el resto (join_chat, typing, etc.).
 */
export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

/** Cierra la conexión si existe. */
export const disconnectSocket = () => {
  socket?.disconnect();
};
