import * as React from "react";
import { Socket } from "socket.io-client";

export type ConnectionStatus = "Connected" | "Disconnected" | "Loading ...";

interface ConnectionMetrics {
  NetworkStatus: ConnectionStatus;
  UrlStatus: ConnectionStatus;
  WebsocketStatus: ConnectionStatus;
  pingTime: number | null;
  lastChecked: Date | null;
}

export const useConnectionStatus = (url: string, socket?: Socket): ConnectionMetrics => {
  const [NetworkStatus, setNetworkStatus] = React.useState<ConnectionStatus>("Loading ...");
  const [UrlStatus, setUrlStatus] = React.useState<ConnectionStatus>("Loading ...");
  const [WebsocketStatus, setWebsocketStatus] = React.useState<ConnectionStatus>("Loading ...");
  const [pingTime, setPingTime] = React.useState<number | null>(null);
  const [lastChecked, setLastChecked] = React.useState<Date | null>(null);

  // Network status - browser connectivity
  React.useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? "Connected" : "Disconnected");
    };

    updateNetworkStatus();
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
    };
  }, []);

  // Server URL status with ping measurement
  React.useEffect(() => {
    const serverFetch = () => {
      const startTime = performance.now();

      fetch(url)
        .then((response) => {
          const endTime = performance.now();
          const latency = Math.round(endTime - startTime);

          if (response.ok) {
            setUrlStatus("Connected");
            setPingTime(latency);
          } else {
            setUrlStatus("Disconnected");
            setPingTime(null);
          }
          setLastChecked(new Date());
        })
        .catch(() => {
          setUrlStatus("Disconnected");
          setPingTime(null);
          setLastChecked(new Date());
        });
    };

    serverFetch();
    const interval = setInterval(serverFetch, 3000);

    return () => clearInterval(interval);
  }, [url]);

  // WebSocket status (optional - only if you have socket.io)
  React.useEffect(() => {
    if (!socket) {
      setWebsocketStatus("Disconnected");
      return;
    }

    const checkWebsocket = () => {
      if (socket.id && socket.connected) {
        setWebsocketStatus("Connected");
      } else {
        setWebsocketStatus("Disconnected");
      }
    };

    checkWebsocket();
    const interval = setInterval(checkWebsocket, 3000);

    return () => clearInterval(interval);
  }, [socket]);

  return {
    NetworkStatus,
    UrlStatus,
    WebsocketStatus,
    pingTime,
    lastChecked,
  };
};
