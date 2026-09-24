import { useEffect, useRef, useState } from "react";
import { useSocket } from "./socketContext";

type Props = {
  onConnect?: () => void;
};

export function useSocketConnection({ onConnect }: Props) {
  const socket = useSocket();
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const onConnectRef = useRef(onConnect);
  onConnectRef.current = onConnect;

  useEffect(() => {
    if (!socket) return;

    // join on every connect
    // this way if there's a disconnection, a reconnection will rejoin
    const handleConnect = () => {
      onConnectRef.current?.();
      setIsDisconnected(false);
      setIsReconnecting(false);
    };
    const handleDisconnect = () => {
      setIsDisconnected(true);
    };
    const handleReconnectAttempt = () => {
      setIsReconnecting(true);
    };
    const handleReconnectFailed = () => {
      setIsReconnecting(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleReconnectFailed);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect_failed", handleReconnectFailed);

    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleReconnectFailed);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect_failed", handleReconnectFailed);
    };
  }, [socket]);

  const reconnect = () => {
    setIsReconnecting(true);
    socket?.disconnect();
    socket?.connect();
  };

  return { socket, isDisconnected, isReconnecting, reconnect };
}
