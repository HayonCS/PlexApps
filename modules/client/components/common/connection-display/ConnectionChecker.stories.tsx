import * as React from "react";
import { ConnectionChecker } from "./ConnectionChecker";

export default {
  component: ConnectionChecker,
  title: "Common/ConnectionChecker",
  tags: ["autodocs"],
  args: {
    url: "/health",
    socket: undefined,
  } as React.ComponentProps<typeof ConnectionChecker>,
};

export const Default = {
  args: {},
};

export const WithSocket = {
  args: {
    socket: {
      id: "test-socket-id",
      connected: true,
    } as any,
  },
};

export const WithoutSocket = {
  args: {
    socket: undefined,
  },
};

export const CustomUrl = {
  args: {
    url: "https://example.com/health",
  },
};
