import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { ConnectionChecker } from "../ConnectionChecker";
import { mockProvider } from "modules/client/test-helpers/mock-provider";

// Mock the useConnectionStatus hook
vi.mock("client/hooks/useConnectionStatus", () => ({
  useConnectionStatus: vi.fn(() => ({
    NetworkStatus: "Connected",
    UrlStatus: "Connected",
    WebsocketStatus: "Connected",
    pingTime: 42,
    lastChecked: new Date("2025-11-19T10:00:00Z"),
  })),
}));

const ConnectionCheckerProvider = mockProvider({});

describe("Connection Checker", () => {
  let connectionChecker: HTMLElement;

  beforeEach(async () => {
    render(
      <ConnectionCheckerProvider>
        <ConnectionChecker />
      </ConnectionCheckerProvider>
    );

    connectionChecker = await waitFor<HTMLElement>(async () => {
      const element = screen.getByText(/Network:/);
      return element.closest("div")?.parentElement as HTMLElement;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(connectionChecker).toBeInTheDocument();
    expect(connectionChecker).toBeVisible();
  });

  it("Displays network status.", async () => {
    const networkChip = within(connectionChecker).getByText(/Network:/);
    expect(networkChip).toBeInTheDocument();
    expect(networkChip).toHaveTextContent("Network: Connected");
  });

  it("Displays server status with ping time.", async () => {
    const serverChip = within(connectionChecker).getByText(/Server:/);
    expect(serverChip).toBeInTheDocument();
    expect(serverChip).toHaveTextContent("Server: Connected (42ms)");
  });

  it("Displays websocket status.", async () => {
    const websocketChip = within(connectionChecker).getByText(/WebSocket:/);
    expect(websocketChip).toBeInTheDocument();
    expect(websocketChip).toHaveTextContent("WebSocket: Connected");
  });

  it("Displays last checked timestamp.", async () => {
    const lastChecked = within(connectionChecker).getByText(/Last checked:/);
    expect(lastChecked).toBeInTheDocument();
    expect(lastChecked).toBeVisible();
  });
});

describe("Connection Checker - Disconnected State", () => {
  beforeEach(async () => {
    const { useConnectionStatus } = await import("client/hooks/useConnectionStatus");
    vi.mocked(useConnectionStatus).mockReturnValue({
      NetworkStatus: "Disconnected",
      UrlStatus: "Disconnected",
      WebsocketStatus: "Disconnected",
      pingTime: null,
      lastChecked: new Date("2025-11-19T10:00:00Z"),
    });

    render(
      <ConnectionCheckerProvider>
        <ConnectionChecker />
      </ConnectionCheckerProvider>
    );
  });

  it("Displays disconnected network status.", async () => {
    const networkChip = screen.getByText(/Network:/);
    expect(networkChip).toHaveTextContent("Network: Disconnected");
  });

  it("Displays disconnected server status without ping time.", async () => {
    const serverChip = screen.getByText(/Server:/);
    expect(serverChip).toHaveTextContent("Server: Disconnected");
    expect(serverChip).not.toHaveTextContent("ms");
  });

  it("Displays disconnected websocket status.", async () => {
    const websocketChip = screen.getByText(/WebSocket:/);
    expect(websocketChip).toHaveTextContent("WebSocket: Disconnected");
  });
});

describe("Connection Checker - Loading State", () => {
  beforeEach(async () => {
    const { useConnectionStatus } = await import("client/hooks/useConnectionStatus");
    vi.mocked(useConnectionStatus).mockReturnValue({
      NetworkStatus: "Loading ...",
      UrlStatus: "Loading ...",
      WebsocketStatus: "Loading ...",
      pingTime: null,
      lastChecked: null,
    });

    render(
      <ConnectionCheckerProvider>
        <ConnectionChecker />
      </ConnectionCheckerProvider>
    );
  });

  it("Displays loading network status.", async () => {
    const networkChip = screen.getByText(/Network:/);
    expect(networkChip).toHaveTextContent("Network: Loading ...");
  });

  it("Displays loading server status.", async () => {
    const serverChip = screen.getByText(/Server:/);
    expect(serverChip).toHaveTextContent("Server: Loading ...");
  });

  it("Displays loading websocket status.", async () => {
    const websocketChip = screen.getByText(/WebSocket:/);
    expect(websocketChip).toHaveTextContent("WebSocket: Loading ...");
  });

  it("Does not display last checked when null.", async () => {
    const lastChecked = screen.queryByText(/Last checked:/);
    expect(lastChecked).not.toBeInTheDocument();
  });
});
