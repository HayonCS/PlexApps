import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useConnectionStatus } from "../useConnectionStatus";

describe("useConnectionStatus Hook", () => {
  let mockSocket: any;

  beforeEach(() => {
    vi.stubGlobal("navigator", {
      onLine: true,
    });

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
      } as Response)
    );

    vi.spyOn(performance, "now").mockReturnValueOnce(100).mockReturnValueOnce(142);

    mockSocket = {
      id: "test-socket-id",
      connected: true,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("Returns initial loading state.", async () => {
    const { result } = renderHook(() => useConnectionStatus("http://localhost:4000/health", mockSocket));

    // URL status starts as Loading before fetch resolves
    expect(result.current.UrlStatus).toBe("Loading ...");

    // Wait for effects to complete to avoid act warnings
    await waitFor(() => {
      expect(result.current.NetworkStatus).toBe("Connected");
    });
  });

  it("Updates network status based on navigator.onLine.", async () => {
    const { result } = renderHook(() => useConnectionStatus("http://localhost:4000/health", mockSocket));

    await waitFor(() => {
      expect(result.current.NetworkStatus).toBe("Connected");
    });
  });

  it("Updates URL status when fetch succeeds.", async () => {
    const { result } = renderHook(() => useConnectionStatus("http://localhost:4000/health", mockSocket));

    await waitFor(() => {
      expect(result.current.UrlStatus).toBe("Connected");
      expect(result.current.pingTime).toBeGreaterThan(0);
      expect(result.current.lastChecked).toBeInstanceOf(Date);
    });
  });

  it("Updates WebSocket status when socket is connected.", async () => {
    const { result } = renderHook(() => useConnectionStatus("http://localhost:4000/health", mockSocket));

    await waitFor(() => {
      expect(result.current.WebsocketStatus).toBe("Connected");
    });
  });

  it("Shows disconnected WebSocket status when socket is not provided.", async () => {
    const { result } = renderHook(() => useConnectionStatus("http://localhost:4000/health"));

    await waitFor(() => {
      expect(result.current.WebsocketStatus).toBe("Disconnected");
    });
  });

  it("Shows disconnected WebSocket status when socket is disconnected.", async () => {
    const disconnectedSocket = {
      id: null,
      connected: false,
    } as any;

    const { result } = renderHook(() => useConnectionStatus("http://localhost:4000/health", disconnectedSocket));

    await waitFor(() => {
      expect(result.current.WebsocketStatus).toBe("Disconnected");
    });
  });

  it("Updates to disconnected when network goes offline.", async () => {
    const { result } = renderHook(() => useConnectionStatus("http://localhost:4000/health", mockSocket));

    await waitFor(() => {
      expect(result.current.NetworkStatus).toBe("Connected");
    });

    // Simulate going offline
    await act(async () => {
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event("offline"));
    });

    await waitFor(() => {
      expect(result.current.NetworkStatus).toBe("Disconnected");
    });
  });

  it("Shows disconnected URL status when fetch fails.", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

    const { result } = renderHook(() => useConnectionStatus("http://localhost:4000/health", mockSocket));

    await waitFor(() => {
      expect(result.current.UrlStatus).toBe("Disconnected");
      expect(result.current.pingTime).toBe(null);
    });
  });

  it("Shows disconnected URL status when fetch returns non-ok response.", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      } as Response)
    );

    const { result } = renderHook(() => useConnectionStatus("http://localhost:4000/health", mockSocket));

    await waitFor(() => {
      expect(result.current.UrlStatus).toBe("Disconnected");
      expect(result.current.pingTime).toBe(null);
    });
  });
});
