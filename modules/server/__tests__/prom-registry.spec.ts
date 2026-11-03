import { describe, it, expect, afterEach } from "vitest";
import * as promRegistry from "../prom-registry";

describe("Prometheus Registry - WebSocket Metrics", () => {
  const connectedSockets: string[] = [];

  afterEach(() => {
    // Clean up all connected sockets after each test
    connectedSockets.forEach((socketId) => {
      promRegistry.handleClientDisconnect(socketId);
    });
    connectedSockets.length = 0;
  });

  function trackConnection(socketId: string) {
    connectedSockets.push(socketId);
  }

  describe("handleClientConnect", () => {
    it("should track a new user connection and update metrics", () => {
      trackConnection("socket-123");
      const result = promRegistry.handleClientConnect("socket-123", "Chrome", "Windows", "john.doe");

      expect(result).toBeDefined();
      expect(result?.socketId).toBe("socket-123");
      expect(result?.browserName).toBe("Chrome");
      expect(result?.operatingSystem).toBe("Windows");
      expect(result?.username).toBe("john.doe");
    });

    it("should track multiple users with different browsers", () => {
      trackConnection("socket-1");
      trackConnection("socket-2");
      trackConnection("socket-3");
      const user1 = promRegistry.handleClientConnect("socket-1", "Chrome", "Windows", "john.doe");
      const user2 = promRegistry.handleClientConnect("socket-2", "Firefox", "Mac", "jane.smith");
      const user3 = promRegistry.handleClientConnect("socket-3", "Edge", "Windows", "bob.jones");

      expect(user1).toBeDefined();
      expect(user2).toBeDefined();
      expect(user3).toBeDefined();

      expect(user1?.browserName).toBe("Chrome");
      expect(user2?.browserName).toBe("Firefox");
      expect(user3?.browserName).toBe("Edge");
    });

    it("should track multiple users with different operating systems", () => {
      trackConnection("socket-os-1");
      trackConnection("socket-os-2");
      trackConnection("socket-os-3");
      const user1 = promRegistry.handleClientConnect("socket-os-1", "Chrome", "Windows", "user1");
      const user2 = promRegistry.handleClientConnect("socket-os-2", "Chrome", "Mac", "user2");
      const user3 = promRegistry.handleClientConnect("socket-os-3", "Chrome", "Linux", "user3");

      expect(user1?.operatingSystem).toBe("Windows");
      expect(user2?.operatingSystem).toBe("Mac");
      expect(user3?.operatingSystem).toBe("Linux");
    });

    it("should not track duplicate socket IDs (returns undefined for duplicates)", () => {
      trackConnection("socket-dup");
      const user1 = promRegistry.handleClientConnect("socket-dup", "Chrome", "Windows", "user1");
      const user2 = promRegistry.handleClientConnect("socket-dup", "Firefox", "Mac", "user2");

      // First connection succeeds, second returns undefined (already connected)
      expect(user1).toBeDefined();
      expect(user2).toBeUndefined();
    });
  });

  describe("handleClientDisconnect", () => {
    it("should remove a connected user and return their info", () => {
      trackConnection("socket-disconnect");
      promRegistry.handleClientConnect("socket-disconnect", "Chrome", "Windows", "john.doe");

      const result = promRegistry.handleClientDisconnect("socket-disconnect");

      expect(result).toBeDefined();
      expect(result?.socketId).toBe("socket-disconnect");
      expect(result?.username).toBe("john.doe");
      expect(result?.browserName).toBe("Chrome");
      expect(result?.operatingSystem).toBe("Windows");

      // Remove from tracking since we manually disconnected
      const index = connectedSockets.indexOf("socket-disconnect");
      if (index > -1) connectedSockets.splice(index, 1);
    });

    it("should return undefined for non-existent socket", () => {
      const result = promRegistry.handleClientDisconnect("non-existent-socket");

      expect(result).toBeUndefined();
    });

    it("should handle multiple disconnects correctly", () => {
      trackConnection("socket-multi-1");
      trackConnection("socket-multi-2");
      trackConnection("socket-multi-3");
      promRegistry.handleClientConnect("socket-multi-1", "Chrome", "Windows", "user1");
      promRegistry.handleClientConnect("socket-multi-2", "Firefox", "Mac", "user2");
      promRegistry.handleClientConnect("socket-multi-3", "Edge", "Linux", "user3");

      const disconnect1 = promRegistry.handleClientDisconnect("socket-multi-1");
      const disconnect2 = promRegistry.handleClientDisconnect("socket-multi-2");

      expect(disconnect1?.username).toBe("user1");
      expect(disconnect2?.username).toBe("user2");

      // socket-multi-3 should still be connected
      const disconnect3 = promRegistry.handleClientDisconnect("socket-multi-3");
      expect(disconnect3?.username).toBe("user3");

      // Clear from tracking since we manually disconnected all
      connectedSockets.length = 0;
    });

    it("should not fail when disconnecting same socket twice", () => {
      trackConnection("socket-double");
      promRegistry.handleClientConnect("socket-double", "Chrome", "Windows", "user");

      const firstDisconnect = promRegistry.handleClientDisconnect("socket-double");
      const secondDisconnect = promRegistry.handleClientDisconnect("socket-double");

      expect(firstDisconnect).toBeDefined();
      expect(secondDisconnect).toBeUndefined();

      // Remove from tracking since we manually disconnected
      const index = connectedSockets.indexOf("socket-double");
      if (index > -1) connectedSockets.splice(index, 1);
    });
  });

  describe("Connection lifecycle", () => {
    it("should handle full connect/disconnect lifecycle", () => {
      trackConnection("socket-lifecycle");
      // Connect
      const connected = promRegistry.handleClientConnect("socket-lifecycle", "Safari", "Mac", "test.user");
      expect(connected).toBeDefined();
      expect(connected?.username).toBe("test.user");

      // Disconnect
      const disconnected = promRegistry.handleClientDisconnect("socket-lifecycle");
      expect(disconnected).toBeDefined();
      expect(disconnected?.username).toBe("test.user");

      // Verify removed
      const disconnectedAgain = promRegistry.handleClientDisconnect("socket-lifecycle");
      expect(disconnectedAgain).toBeUndefined();

      // Remove from tracking since we manually disconnected
      const index = connectedSockets.indexOf("socket-lifecycle");
      if (index > -1) connectedSockets.splice(index, 1);
    });

    it("should handle reconnection after disconnect", () => {
      trackConnection("socket-reconnect");
      // First connection
      promRegistry.handleClientConnect("socket-reconnect", "Chrome", "Windows", "user1");
      promRegistry.handleClientDisconnect("socket-reconnect");

      // Reconnection with same socket ID (in real scenarios this would be different)
      const reconnected = promRegistry.handleClientConnect("socket-reconnect", "Chrome", "Windows", "user1");
      expect(reconnected).toBeDefined();
      expect(reconnected?.username).toBe("user1");
    });
  });

  describe("Browser and OS tracking", () => {
    it("should track all browser types", () => {
      const browsers = ["Chrome", "Firefox", "Edge", "Safari", "IE", "Other"];

      browsers.forEach((browser, index) => {
        const socketId = `socket-browser-${index}`;
        trackConnection(socketId);
        const result = promRegistry.handleClientConnect(socketId, browser, "Windows", `user${index}`);
        expect(result?.browserName).toBe(browser);
      });
    });

    it("should track all OS types", () => {
      const operatingSystems = ["Windows", "Mac", "Linux", "Unix"];

      operatingSystems.forEach((os, index) => {
        const socketId = `socket-os-types-${index}`;
        trackConnection(socketId);
        const result = promRegistry.handleClientConnect(socketId, "Chrome", os, `user${index}`);
        expect(result?.operatingSystem).toBe(os);
      });
    });
  });

  describe("Memory Map Metrics", () => {
    it("should track memory map loads", () => {
      expect(() => {
        promRegistry.trackMemoryMapLoad("305-1234-000", "AAA", 1);
        promRegistry.trackMemoryMapLoad("305-5678-000", "BBB", 2);
      }).not.toThrow();
    });

    it("should start and end memory map load timers", () => {
      expect(() => {
        const endTimer1 = promRegistry.startMemoryMapLoadTimer("305-1234-000");
        endTimer1();

        const endTimer2 = promRegistry.startMemoryMapLoadTimer("305-5678-000");
        endTimer2();
      }).not.toThrow();
    });

    it("should track memory map releases", () => {
      expect(() => {
        promRegistry.trackMemoryMapRelease("305-1234-000", "EC12345");
        promRegistry.trackMemoryMapRelease("305-5678-000", "EC67890");
      }).not.toThrow();
    });

    it("should track memory map releases to production", () => {
      expect(() => {
        promRegistry.trackMemoryMapReleaseToProduction();
        promRegistry.trackMemoryMapReleaseToProduction();
      }).not.toThrow();
    });

    it("should update memory map version counts", () => {
      expect(() => {
        promRegistry.updateMemoryMapVersionCount("305-1234-000", 5);
        promRegistry.updateMemoryMapVersionCount("305-5678-000", 3);
        promRegistry.updateMemoryMapVersionCount("305-9999-000", 10);
      }).not.toThrow();
    });

    it("should track memory map action duration", () => {
      expect(() => {
        const endTimer1 = promRegistry.startMemoryMapActionTimer("save", "305-1234-000");
        endTimer1();

        const endTimer2 = promRegistry.startMemoryMapActionTimer("export", "305-5678-000");
        endTimer2();

        const endTimer3 = promRegistry.startMemoryMapActionTimer("edit", "305-9999-000");
        endTimer3();
      }).not.toThrow();
    });
  });

  describe("User Action Metrics", () => {
    it("should track user logins with browser and OS", () => {
      expect(() => {
        promRegistry.trackUserLogin("john.doe", "Chrome", "Windows");
        promRegistry.trackUserLogin("jane.smith", "Firefox", "Mac");
        promRegistry.trackUserLogin("bob.jones", "Edge", "Linux");
      }).not.toThrow();
    });

    it("should track user logouts", () => {
      expect(() => {
        promRegistry.trackUserLogout("john.doe");
        promRegistry.trackUserLogout("jane.smith");
      }).not.toThrow();
    });

    it("should track general user actions with resource types", () => {
      expect(() => {
        promRegistry.trackUserAction("john.doe", "view", "memory_map");
        promRegistry.trackUserAction("jane.smith", "edit", "memory_map");
        promRegistry.trackUserAction("bob.jones", "delete", "command_set");
        promRegistry.trackUserAction("alice.williams", "save", "memory_map");
        promRegistry.trackUserAction("charlie.brown", "export", "memory_map");
      }).not.toThrow();
    });

    it("should track user settings updates", () => {
      expect(() => {
        promRegistry.trackUserSettingsUpdate("john.doe");
        promRegistry.trackUserSettingsUpdate("jane.smith");
        promRegistry.trackUserSettingsUpdate("john.doe");
      }).not.toThrow();
    });

    it("should handle multiple actions from same user", () => {
      expect(() => {
        const username = "power.user";
        promRegistry.trackUserAction(username, "view", "memory_map");
        promRegistry.trackUserAction(username, "edit", "memory_map");
        promRegistry.trackUserAction(username, "save", "memory_map");
        promRegistry.trackUserSettingsUpdate(username);
      }).not.toThrow();
    });
  });

  describe("Error Tracking Metrics", () => {
    it("should track critical errors", () => {
      expect(() => {
        promRegistry.trackError("critical", "DatabaseError", "Failed to connect to database");
        promRegistry.trackError("critical", "SystemError", "Out of memory");
      }).not.toThrow();
    });

    it("should track regular errors", () => {
      expect(() => {
        promRegistry.trackError("error", "ValidationError", "Invalid input provided");
        promRegistry.trackError("error", "NotFoundError", "Resource not found");
        promRegistry.trackError("error", "TimeoutError", "Request timed out");
      }).not.toThrow();
    });

    it("should track warnings", () => {
      expect(() => {
        promRegistry.trackError("warning", "DeprecationWarning", "Feature will be removed in next version");
        promRegistry.trackError("warning", "PerformanceWarning", "Query is slow");
      }).not.toThrow();
    });

    it("should track errors with default error type", () => {
      expect(() => {
        promRegistry.trackError("error", "unknown", "Something went wrong");
        promRegistry.trackError("critical");
      }).not.toThrow();
    });

    it("should track multiple errors of same type", () => {
      expect(() => {
        promRegistry.trackError("error", "ValidationError", "Invalid username");
        promRegistry.trackError("error", "ValidationError", "Invalid password");
        promRegistry.trackError("error", "ValidationError", "Invalid email");
      }).not.toThrow();
    });

    it("should track errors with empty messages", () => {
      expect(() => {
        promRegistry.trackError("error", "UnknownError", "");
        promRegistry.trackError("warning", "GenericWarning");
      }).not.toThrow();
    });

    it("should track errors with long messages", () => {
      const longMessage = "A".repeat(1000);
      expect(() => {
        promRegistry.trackError("error", "LongMessageError", longMessage);
      }).not.toThrow();
    });

    it("should track mixed error levels", () => {
      expect(() => {
        promRegistry.trackError("warning", "ConfigWarning", "Config file missing, using defaults");
        promRegistry.trackError("error", "NetworkError", "Failed to fetch data");
        promRegistry.trackError("critical", "DataCorruption", "Database integrity check failed");
        promRegistry.trackError("warning", "MemoryWarning", "Memory usage at 80%");
        promRegistry.trackError("error", "AuthError", "Invalid credentials");
      }).not.toThrow();
    });
  });

  describe("Prometheus Registry", () => {
    it("should have registry available", () => {
      expect(promRegistry.promRegistry).toBeDefined();
      expect(promRegistry.promRegistry.metrics).toBeDefined();
    });

    it("should collect metrics", async () => {
      const metrics = await promRegistry.promRegistry.metrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe("string");
      expect(metrics.length).toBeGreaterThan(0);
    });

    it("should include custom metrics in output", async () => {
      promRegistry.trackUserLogin("test.user", "Chrome", "Windows");
      promRegistry.trackError("error", "TestError", "Test error message");
      promRegistry.trackMemoryMapLoad("305-TEST-000", "A01", 1);

      const metrics = await promRegistry.promRegistry.metrics();

      expect(metrics).toContain("user_login_total");
      expect(metrics).toContain("errors_total");
      expect(metrics).toContain("error_info");
      expect(metrics).toContain("memory_map_load_total");
    });
  });
});
