import express from "express";
import { createRequestHandler } from "@react-router/express";
import { createServer } from "http";
import type { ServerBuild } from "react-router";
import { Server } from "socket.io";
import { startDiscordBot } from "~/discord/bot.server.js";
import { initEnv } from "~/env.server.js";
import {
  metricsMiddleware,
  observeSocketConnection,
  observeSocketDisconnection,
  observeSocketEvent,
  register,
  startEventLoopLagMonitor,
} from "~/observability/metrics.server.js";
import { setSocketIO } from "~/websocket/broadcast.server.js";

initEnv();
startEventLoopLagMonitor();

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
        vite.createServer({
          server: {
            middlewareMode: true,
            // Separate HMR port per dev server so parallel worktrees don't collide
            hmr: { port: Number(process.env.HMR_PORT) || 24679 },
          },
        }),
      );

const app = express();

// Health check endpoint - must be before other middleware
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use(metricsMiddleware);

app.use(
  viteDevServer ? viteDevServer.middlewares : express.static("build/client"),
);

const build: ServerBuild | (() => Promise<ServerBuild>) = viteDevServer
  ? async () =>
      (await viteDevServer.ssrLoadModule(
        "virtual:react-router/server-build",
      )) as ServerBuild
  : ((await import("./build/server/index.js")) as unknown as ServerBuild);

app.all("/{*splat}", createRequestHandler({ build }));

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
  observeSocketConnection();
  socket.on("disconnect", () => {
    observeSocketDisconnection();
  });

  socket.on("joinDraft", (draftId) => {
    observeSocketEvent(
      "joinDraft",
      (draftId) => {
        console.log(socket.id, "joined draft", draftId);
        socket.join("draft:" + draftId);
      },
      draftId,
    );
  });

  socket.on("joinSoundboardSession", (sessionId) => {
    observeSocketEvent(
      "joinSoundboardSession",
      (sessionId) => {
        console.log(socket.id, "joined soundboard session", sessionId);
        socket.join("soundboard:" + sessionId);
      },
      sessionId,
    );
  });

  socket.on("requestSessionData", (sessionId) => {
    observeSocketEvent(
      "requestSessionData",
      (sessionId) => {
        socket.to("soundboard:" + sessionId).emit("requestSessionData");
      },
      sessionId,
    );
  });

  socket.on("sendSessionData", (sessionId, data) => {
    observeSocketEvent(
      "sendSessionData",
      (sessionId, data) => {
        socket.to("soundboard:" + sessionId).emit("sendSessionData", data);
      },
      sessionId,
      data,
    );
  });

  socket.on("stopLine", (sessionId) => {
    observeSocketEvent(
      "stopLine",
      (sessionId) => {
        socket.to("soundboard:" + sessionId).emit("stopLine");
      },
      sessionId,
    );
  });

  socket.on("lineFinished", (sessionId) => {
    observeSocketEvent(
      "lineFinished",
      (sessionId) => {
        socket.to("soundboard:" + sessionId).emit("lineFinished");
      },
      sessionId,
    );
  });

  socket.on("playLine", (sessionId, factionId, lineType) => {
    observeSocketEvent(
      "playLine",
      (sessionId, factionId, lineType) => {
        socket
          .to("soundboard:" + sessionId)
          .emit("playLine", factionId, lineType);
      },
      sessionId,
      factionId,
      lineType,
    );
  });

  socket.on("syncDraft", (draftId, data) => {
    observeSocketEvent(
      "syncDraft",
      (draftId, data) => {
        console.log(socket.id, "synced draft", draftId);
        socket.to("draft:" + draftId).emit("syncDraft", data);
      },
      draftId,
      data,
    );
  });
});

const port = Number(process.env.PORT) || 3000;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Express server listening on port ${port}`);
});

if (process.env.DISCORD_DISABLED !== "true") {
  startDiscordBot();
}

// Graceful shutdown handling
let isShuttingDown = false;

const shutdown = (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received, shutting down gracefully...`);

  httpServer.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
