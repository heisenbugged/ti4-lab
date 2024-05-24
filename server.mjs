import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

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

app.all("*", createRequestHandler({ build }));

// Connect socket.io
// You need to create the HTTP server from the Express app
const httpServer = createServer(app);
// And then attach the socket.io server to the HTTP server
const io = new Server(httpServer);
io.on("connection", (socket) => {
  // from this point you are on the WS connection with a specific client
  // console.log(socket.id, "connected");
  socket.emit("confirmation", "connected!");
  socket.on("joinDraft", (draftId) => {
    console.log(socket.id, "joined draft", draftId);
    socket.join("draft:"+draftId)
  });

  socket.on("syncDraft", (draftId, data) => {
    console.log(socket.id, "synced draft", draftId);
    socket.to("draft:"+draftId).emit("syncDraft", data);
  })
});

// instead of running listen on the Express app, do it on the HTTP server
httpServer.listen(3000, () => {
  console.log(`Express server listening on port 3000`);
});

