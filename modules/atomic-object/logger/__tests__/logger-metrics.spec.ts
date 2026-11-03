import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Logger } from "../index";

vi.mock("server/prom-registry", () => ({
  trackError: vi.fn(),
}));

describe("Logger Prometheus Metrics Integration", () => {
  let trackErrorMock: any;

  beforeEach(async () => {
    const promRegistry = await import("server/prom-registry");
    trackErrorMock = promRegistry.trackError;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Error level logging", () => {
    it("should track critical errors with message", async () => {
      Logger.critical("Critical system failure");

      await vi.waitFor(() => {
        expect(trackErrorMock).toHaveBeenCalledWith(
          "critical",
          "unknown",
          expect.stringContaining("Critical system failure")
        );
      });
    });

    it("should track error level with message", async () => {
      Logger.error("An error occurred");

      await vi.waitFor(() => {
        expect(trackErrorMock).toHaveBeenCalledWith("error", "unknown", expect.stringContaining("An error occurred"));
      });
    });

    it("should track warning level with message", async () => {
      Logger.warning("Warning: deprecated feature");

      await vi.waitFor(() => {
        expect(trackErrorMock).toHaveBeenCalledWith(
          "warning",
          "unknown",
          expect.stringContaining("deprecated feature")
        );
      });
    });

    it("should extract error type from Error objects", async () => {
      const error = new Error("Database connection failed");
      error.name = "DatabaseError";

      Logger.error(error);

      await vi.waitFor(() => {
        expect(trackErrorMock).toHaveBeenCalledWith(
          "error",
          "DatabaseError",
          expect.stringContaining("Database connection failed")
        );
      });
    });

    it("should handle TypeError with error name", async () => {
      const error = new TypeError("Invalid type provided");

      Logger.critical(error);

      await vi.waitFor(() => {
        expect(trackErrorMock).toHaveBeenCalledWith(
          "critical",
          "TypeError",
          expect.stringContaining("Invalid type provided")
        );
      });
    });

    it("should handle ReferenceError", async () => {
      const error = new ReferenceError("Variable is not defined");

      Logger.error(error);

      await vi.waitFor(() => {
        expect(trackErrorMock).toHaveBeenCalledWith("error", "ReferenceError", expect.stringContaining("not defined"));
      });
    });
  });

  describe("Non-error level logging", () => {
    it("should not track info level messages", async () => {
      Logger.info("Informational message");

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(trackErrorMock).not.toHaveBeenCalled();
    });

    it("should not track debug level messages", async () => {
      Logger.debug("Debug information");

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(trackErrorMock).not.toHaveBeenCalled();
    });
  });

  describe("Complex error scenarios", () => {
    it("should track error with additional context", async () => {
      Logger.error({ message: "Operation failed", userId: "12345", action: "save" });

      await vi.waitFor(() => {
        expect(trackErrorMock).toHaveBeenCalledWith("error", "unknown", expect.stringContaining("Operation failed"));
      });
    });

    it("should track multiple errors in sequence", async () => {
      Logger.error("First error");
      Logger.warning("Warning message");
      Logger.critical("Critical failure");

      await vi.waitFor(() => {
        expect(trackErrorMock).toHaveBeenCalledTimes(3);
      });
    });

    it("should handle empty error messages", async () => {
      Logger.error("");

      await vi.waitFor(() => {
        expect(trackErrorMock).toHaveBeenCalledWith("error", "unknown", "");
      });
    });

    it("should handle custom error classes", async () => {
      class ValidationError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "ValidationError";
        }
      }

      const error = new ValidationError("Field validation failed");
      Logger.error(error);

      await vi.waitFor(() => {
        expect(trackErrorMock).toHaveBeenCalledWith(
          "error",
          "ValidationError",
          expect.stringContaining("validation failed")
        );
      });
    });
  });
});
