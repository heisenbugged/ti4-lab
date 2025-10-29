import type { Server } from "socket.io";
import { Draft } from "~/types";

interface SocketState {
  instance: Server | null;
}

interface GlobalWithSocket {
  __socketIO?: SocketState;
}

const socketState: SocketState = {
  instance: null,
};

if (typeof global !== "undefined") {
  const globalWithSocket = global as GlobalWithSocket;
  globalWithSocket.__socketIO = globalWithSocket.__socketIO || socketState;
}

export function setSocketIO(ioInstance: Server): void {
  socketState.instance = ioInstance;
  if (typeof global !== "undefined") {
    const globalWithSocket = global as GlobalWithSocket;
    if (globalWithSocket.__socketIO) {
      globalWithSocket.__socketIO.instance = ioInstance;
    }
  }
  console.log("Socket.IO instance set successfully");
}

function getSocketIO(): Server | null {
  if (typeof global !== "undefined") {
    const globalWithSocket = global as GlobalWithSocket;
    if (globalWithSocket.__socketIO?.instance) {
      return globalWithSocket.__socketIO.instance;
    }
  }
  return socketState.instance;
}

export async function broadcastDraftUpdate(
  draftId: string,
  draft: Draft,
): Promise<void> {
  const io = getSocketIO();

  if (!io) {
    console.warn(
      "Socket.IO instance not available, skipping WebSocket broadcast. " +
        "Clients will receive updates via API responses instead.",
    );
    return;
  }

  try {
    io.to(`draft:${draftId}`).emit("syncDraft", JSON.stringify(draft));
    console.log(`Broadcasted draft update to draft:${draftId}`);
  } catch (error) {
    console.error("Error broadcasting draft update:", error);
  }
}
