import * as http from "http";
import * as https from "https";
import { Server as SocketIOServer } from "socket.io";
import config from "config";
import { handleClientConnect, handleClientDisconnect, trackUserLogin, trackUserLogout } from "./prom-registry";
import { appLogLine } from "domain-services/app-logging/app-logging";

export function startWebSocket(server: https.Server | http.Server) {
  const allowedOrigins = config.get<string[]>("server.allowedOrigins") || [
    "http://localhost:4000",
    `http://localhost:${config.get<number>("server.port")}`,
  ];

  const io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });

  console.info("[Socket] WebSocket server initialized.");

  io.on("connection", (socket) => {
    const browser = (socket.handshake.query.browserName as string) ?? "Unknown";
    const operatingSystem = (socket.handshake.query.operatingSystem as string) ?? "Unknown";

    console.info(`[Socket] Anonymous client connected: ${socket.id}`);

    // Emit a welcome message
    socket.emit("welcome", {
      message: "Connected to OpsManager server",
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    socket.on("authenticatedConnection", (data: { name: string }) => {
      try {
        if (!data?.name || typeof data.name !== "string") {
          console.warn("[Socket] Invalid authentication data received", { socketId: socket.id });
          return;
        }

        const connectResult = handleClientConnect(socket.id, browser, operatingSystem, data.name);
        if (connectResult) {
          console.info(
            `[Socket] User authenticated: ${connectResult.username} - ${socket.id} (${connectResult.browserName} on ${connectResult.operatingSystem})`
          );

          trackUserLogin(connectResult.username, connectResult.browserName, connectResult.operatingSystem);

          appLogLine(`${connectResult.username} authenticated successfully.`, "Auth", "Info", {
            socketId: connectResult.socketId,
            username: connectResult.username,
            Browser: connectResult.browserName,
            OperatingSystem: connectResult.operatingSystem,
          });
        }
      } catch (error) {
        console.error("[Socket] Error handling authenticated connection:", error);
      }
    });

    socket.on("authenticatedDisconnect", () => {
      try {
        const disconnectResult = handleClientDisconnect(socket.id);
        if (disconnectResult) {
          trackUserLogout(disconnectResult.username);

          appLogLine(`${disconnectResult.username} authenticated disconnect.`, "Auth", "Info", {
            socketId: disconnectResult.socketId,
            username: disconnectResult.username,
            Browser: disconnectResult.browserName,
            OperatingSystem: disconnectResult.operatingSystem,
          });
        }
      } catch (error) {
        console.error("[Socket] Error handling authenticated disconnect:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      try {
        const disconnectResult = handleClientDisconnect(socket.id);
        if (disconnectResult) {
          appLogLine(`${disconnectResult.username} user disconnected.`, "Auth", "Info", {
            socketId: disconnectResult.socketId,
            username: disconnectResult.username,
            Browser: disconnectResult.browserName,
            OperatingSystem: disconnectResult.operatingSystem,
          });
        }
        console.info(`[Socket] Client disconnected: ${socket.id} (Reason: ${reason})`);
      } catch (error) {
        console.error("[Socket] Error handling disconnect:", error);
      }
    });

    socket.on("error", (error) => {
      console.error(`[Socket] Socket error for ${socket.id}:`, error);
    });
  });

  return io;
}
