import { useEffect, useRef } from "react";
import { useSocketContext } from "@/providers/SocketProvider";

/** Acceso al socket singleton y su estado de conexión. */
export const useSocket = () => useSocketContext();

/**
 * Suscribe un handler al payload de un evento del socket, con limpieza
 * automática. El handler puede cambiar entre renders sin re-suscribir (se lee
 * por ref). `enabled` condiciona la suscripción (ej. esperar a estar conectado).
 */
export const useSocketEvent = <T = unknown>(
  event: string,
  handler: (payload: T) => void,
  enabled = true,
) => {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!socket || !enabled) return;
    const listener = (payload: T) => handlerRef.current(payload);
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [socket, event, enabled]);
};
