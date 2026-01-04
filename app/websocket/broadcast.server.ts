import type { Server } from "socket.io";
import { Draft } from "~/types";
import { RawDraftState } from "~/rawDraftStore";

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

export async function broadcastRawDraftUpdate(
  draftId: string,
  rawDraft: RawDraftState,
): Promise<void> {
  const io = getSocketIO();

  if (!io) {
    console.warn(
      "[Server] Socket.IO instance not available, skipping WebSocket broadcast. " +
        "Clients will receive updates via API responses instead.",
    );
    return;
  }

  try {
    const room = `raw-draft:${draftId}`;
    const data = JSON.stringify(rawDraft);
    const socketsInRoom = await io.in(room).fetchSockets();

    console.log("[Server] Broadcasting raw draft update:", {
      draftId,
      room,
      socketsInRoom: socketsInRoom.length,
      eventsCount: rawDraft.events.length,
      dataLength: data.length,
    });

    io.to(room).emit("syncRawDraft", data);
    console.log(
      `[Server] Broadcasted raw draft update to ${socketsInRoom.length} clients in room: ${room}`,
    );
  } catch (error) {
    console.error("[Server] Error broadcasting raw draft update:", error);
  }
}
