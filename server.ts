import express from "express";
import { createRequestHandler } from "@remix-run/express";
import { createServer } from "http";
import { Server } from "socket.io";
import { startDiscordBot } from "~/discord/bot.server.js";
import { initEnv } from "~/env.server.js";

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
io.on("connection", (socket) => {
  socket.emit("confirmation", "connected!");
  socket.on("joinDraft", (draftId) => {
    console.log(socket.id, "joined draft", draftId);
    socket.join("draft:" + draftId);
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
