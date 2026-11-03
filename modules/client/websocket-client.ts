import { io, Socket } from "socket.io-client";
import { getBrowserName, getOperatingSystem } from "./browser-detection";

export let socket: Socket | null = null;

/**
 * Get the WebSocket URL based on environment configuration
 */
function getWebSocketURL(): string {
  const sslEnabled = `${process.env.SSL_ENABLED}`.trim() === "true";
  const isProduction = `${process.env.NODE_ENV}`.toLowerCase() === "production";

  const protocol = sslEnabled || isProduction ? "wss" : "ws";
  const port = process.env.PORT !== undefined ? `:${process.env.PORT}` : "";

  return `${protocol}://${window.location.hostname}${port}`;
}

/**
 * Initialize WebSocket connection with browser and OS information
 */
export function initializeWebSocket(): Socket {
  if (socket) {
    return socket;
  }

  const url = getWebSocketURL();
  const browserName = getBrowserName();
  const operatingSystem = getOperatingSystem();

  socket = io(url, {
    path: "/socket.io",
    transports: ["websocket"],
    query: {
      browserName,
      operatingSystem,
    },
  });

  socket.on("connect", () => {
    console.info("[WebSocket] Connected to server");
  });

  socket.on("disconnect", () => {
    console.info("[WebSocket] Disconnected from server");
  });

  return socket;
}

/**
 * Emit authenticated connection event with username
 */
export function emitAuthenticatedConnection(username: string): void {
  if (!socket) {
    console.warn("[WebSocket] Socket not initialized");
    return;
  }

  socket.emit("authenticatedConnection", { name: username });
}

/**
 * Emit authenticated disconnect event (user logout)
 */
export function emitAuthenticatedDisconnect(): void {
  if (!socket) {
    console.warn("[WebSocket] Socket not initialized");
    return;
  }

  socket.emit("authenticatedDisconnect");
}

/**
 * Get the current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}
