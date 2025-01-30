import { useEffect, useState } from "react";
import { useSocket } from "./socketContext";

type Props = {
  onConnect?: () => void;
};

export function useSocketConnection({ onConnect }: Props) {
  const socket = useSocket();
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  useEffect(() => {
    if (!socket) return;

    // join draft on every connect
    // this way if there's a disconnection, a reconnection will rejoin the draft
    socket.on("connect", () => {
      onConnect?.();
      setIsDisconnected(false);
    });

    socket.on("disconnect", () => {
      setIsDisconnected(true);
    });

    socket.on("reconnecting", () => {
      setIsReconnecting(true);
    });

    socket.on("reconnect_failed", () => {
      setIsReconnecting(false);
    });
  }, [socket]);

  const reconnect = () => {
    setIsReconnecting(true);
    socket?.disconnect();
    socket?.connect();
  };

  return { socket, isDisconnected, isReconnecting, reconnect };
}
