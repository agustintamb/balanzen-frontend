import { useEffect, useRef } from "react";
import { useSocketContext } from "@/providers/SocketProvider";

export const useSocket = () => useSocketContext();

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
