import express from "express";
import { createRequestHandler } from "@remix-run/express";
import { createServer } from "http";
import { Server } from "socket.io";
import { startDiscordBot } from "~/discord/bot.server.js";
import { initEnv } from "~/env.server.js";
import { setSocketIO } from "~/websocket/broadcast.server.js";

initEnv();

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const app = express();
app.use(
  viteDevServer ? viteDevServer.middlewares : express.static("build/client"),
);

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
  : await import("./build/server/index.js");

// @ts-ignore
app.all("*", createRequestHandler({ build }));

// Connect socket.io
const httpServer = createServer(app);
// Attach the socket.io server to the HTTP server
const io = new Server(httpServer, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

// Make socket.io instance available for server-side broadcasts
setSocketIO(io);

io.on("connection", (socket) => {
  socket.emit("confirmation", "connected!");
  socket.on("joinDraft", (draftId) => {
    console.log(socket.id, "joined draft", draftId);
    socket.join("draft:" + draftId);
  });

  socket.on("joinSoundboardSession", (sessionId) => {
    console.log(socket.id, "joined soundboard session", sessionId);
    socket.join("soundboard:" + sessionId);
  });

  socket.on("requestSessionData", (sessionId) => {
    socket.to("soundboard:" + sessionId).emit("requestSessionData");
  });

  socket.on("sendSessionData", (sessionId, data) => {
    socket.to("soundboard:" + sessionId).emit("sendSessionData", data);
  });

  socket.on("stopLine", (sessionId) => {
    socket.to("soundboard:" + sessionId).emit("stopLine");
  });

  socket.on("lineFinished", (sessionId) => {
    socket.to("soundboard:" + sessionId).emit("lineFinished");
  });

  socket.on("playLine", (sessionId, factionId, lineType) => {
    socket.to("soundboard:" + sessionId).emit("playLine", factionId, lineType);
  });

  socket.on("syncDraft", (draftId, data) => {
    console.log(socket.id, "synced draft", draftId);
    socket.to("draft:" + draftId).emit("syncDraft", data);
  });
});

httpServer.listen(3000, () => {
  console.log(`Express server listening on port 3000`);
});

startDiscordBot();

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down gracefully...`);

  const { shutdownQueue } = await import("~/utils/imageJobQueue.server.js");
  await shutdownQueue();

  httpServer.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });

  // Force exit after 35 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 35000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
