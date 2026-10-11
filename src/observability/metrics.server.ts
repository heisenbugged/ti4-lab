import type { NextFunction, Request, Response } from "express";
import client from "prom-client";

export const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: "ti4_lab_",
});

const httpRequestDuration = new client.Histogram({
  name: "ti4_lab_http_request_duration_seconds",
  help: "HTTP request duration in seconds.",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const socketEventDuration = new client.Histogram({
  name: "ti4_lab_socket_event_duration_seconds",
  help: "Socket.IO event handler duration in seconds.",
  labelNames: ["event"],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

const socketEventsTotal = new client.Counter({
  name: "ti4_lab_socket_events_total",
  help: "Socket.IO events handled by the server.",
  labelNames: ["event"],
});

const socketConnections = new client.Gauge({
  name: "ti4_lab_socket_connections",
  help: "Current Socket.IO connections.",
});

const eventLoopLag = new client.Gauge({
  name: "ti4_lab_event_loop_lag_seconds",
  help: "Approximate Node.js event loop lag in seconds.",
});

register.registerMetric(httpRequestDuration);
register.registerMetric(socketEventDuration);
register.registerMetric(socketEventsTotal);
register.registerMetric(socketConnections);
register.registerMetric(eventLoopLag);

const routeForRequest = (req: Request) => {
  if (req.path.startsWith("/assets/")) return "/assets/*";
  if (req.path.startsWith("/socket.io/")) return "/socket.io/*";
  if (req.path.startsWith("/_serverFn/")) return "/_serverFn/*";
  return req.route?.path?.toString() ?? req.path;
};

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.path === "/metrics") {
    next();
    return;
  }

  const end = httpRequestDuration.startTimer({
    method: req.method,
  });

  res.on("finish", () => {
    end({
      route: routeForRequest(req),
      status_code: res.statusCode.toString(),
    });
  });

  next();
};

export const observeSocketConnection = () => {
  socketConnections.inc();
};

export const observeSocketDisconnection = () => {
  socketConnections.dec();
};

export const observeSocketEvent = <Args extends unknown[]>(
  event: string,
  handler: (...args: Args) => void | Promise<void>,
  ...args: Args
) => {
  socketEventsTotal.inc({ event });
  const end = socketEventDuration.startTimer({ event });

  try {
    const result = handler(...args);
    if (result instanceof Promise) {
      result
        .catch((error) => {
          console.error(`Socket.IO event "${event}" failed`, error);
        })
        .finally(end);
      return;
    }
    end();
  } catch (error) {
    end();
    throw error;
  }
};

export const startEventLoopLagMonitor = () => {
  const intervalMs = 1000;
  let expected = Date.now() + intervalMs;

  setInterval(() => {
    const now = Date.now();
    const lagMs = Math.max(0, now - expected);
    eventLoopLag.set(lagMs / 1000);
    expected = now + intervalMs;
  }, intervalMs).unref();
};
