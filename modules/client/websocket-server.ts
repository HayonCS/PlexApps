const getProtocolString = () => {
  const sslEnabled = `${process.env.SSL_ENABLED}`.trim() === "true";

  const isProduction = `${process.env.NODE_ENV}`.toLowerCase() === "production";

  if (sslEnabled) {
    return "wss";
  } else {
    if (isProduction) {
      return "wss";
    }

    return "ws";
  }
};

export namespace WebSocketServer {
  const protocol = getProtocolString();
  const port = process.env.PORT !== undefined ? `:${process.env.PORT}` : "";
  export const URL = `${protocol}://${window.location.hostname}${port}/subscriptions`;
}
