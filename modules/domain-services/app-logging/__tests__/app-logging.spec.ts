import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { appLogLine, appLogLines, LogType, type AppLog } from "../app-logging";

describe("App Logging", () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("appLogLine", () => {
    it("should log an Info message with metadata to console.info", () => {
      const message = "User logged in successfully";
      const category = "Auth";
      const logType: LogType = "Info";
      const metadata = { username: "john.doe", browser: "Chrome" };

      appLogLine(message, category, logType, metadata);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'logType="Info" category="Auth" message="User logged in successfully" metadata={"username":"john.doe","browser":"Chrome"}'
      );
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should log an Error message to console.error", () => {
      const message = "Database connection failed";
      const category = "Database";
      const logType: LogType = "Error";
      const metadata = { errorCode: 500 };

      appLogLine(message, category, logType, metadata);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'logType="Error" category="Database" message="Database connection failed" metadata={"errorCode":500}'
      );
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should log a Warn message to console.warn", () => {
      const message = "Cache miss occurred";
      const category = "Cache";
      const logType: LogType = "Warn";
      const metadata = { cacheKey: "user:123" };

      appLogLine(message, category, logType, metadata);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'logType="Warn" category="Cache" message="Cache miss occurred" metadata={"cacheKey":"user:123"}'
      );
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should log without metadata when metadata is undefined", () => {
      const message = "Simple log message";
      const category = "General";
      const logType: LogType = "Info";

      appLogLine(message, category, logType);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'logType="Info" category="General" message="Simple log message" metadata={}'
      );
    });

    it("should handle metadata with boolean values", () => {
      const message = "Feature flag checked";
      const category = "FeatureFlags";
      const logType: LogType = "Info";
      const metadata = { featureName: "darkMode", enabled: true };

      appLogLine(message, category, logType, metadata);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'logType="Info" category="FeatureFlags" message="Feature flag checked" metadata={"featureName":"darkMode","enabled":true}'
      );
    });

    it("should handle metadata with mixed types", () => {
      const message = "Mixed metadata test";
      const category = "Test";
      const logType: LogType = "Info";
      const metadata = {
        stringValue: "test",
        numberValue: 42,
        booleanValue: false,
      };

      appLogLine(message, category, logType, metadata);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'logType="Info" category="Test" message="Mixed metadata test" metadata={"stringValue":"test","numberValue":42,"booleanValue":false}'
      );
    });
  });

  describe("appLogLines", () => {
    it("should log multiple log entries in sequence", () => {
      const logs: AppLog[] = [
        {
          logType: "Info" as LogType,
          category: "Auth",
          message: "Login attempt started",
          metadata: { username: "john.doe" },
        },
        {
          logType: "Info" as LogType,
          category: "Auth",
          message: "Login successful",
          metadata: { username: "john.doe", duration: 150 },
        },
        {
          logType: "Warn" as LogType,
          category: "Security",
          message: "Unusual login location",
          metadata: { location: "Unknown" },
        },
      ];

      appLogLines(logs);

      expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      expect(consoleInfoSpy).toHaveBeenNthCalledWith(
        1,
        'logType="Info" category="Auth" message="Login attempt started" metadata={"username":"john.doe"}'
      );
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(
        2,
        'logType="Info" category="Auth" message="Login successful" metadata={"username":"john.doe","duration":150}'
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'logType="Warn" category="Security" message="Unusual login location" metadata={"location":"Unknown"}'
      );
    });

    it("should handle empty array", () => {
      appLogLines([]);

      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should handle logs with different types", () => {
      const logs: AppLog[] = [
        {
          logType: "Info" as LogType,
          category: "Process",
          message: "Process started",
        },
        {
          logType: "Error" as LogType,
          category: "Process",
          message: "Process failed",
          metadata: { errorCode: 1 },
        },
      ];

      appLogLines(logs);

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
