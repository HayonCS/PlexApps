/**
 * App logging domain service for structured logging to Grafana/Loki
 *
 * Formats logs in a consistent structure for easy parsing and querying in Grafana.
 * Format: logType="..." category="..." message="..." metadata={...}
 */

export type LogType = "Info" | "Error" | "Warn";

export type AppLog = {
  logType: LogType;
  category: string;
  message: string;
  metadata?: Record<string, string | number | boolean>;
};

/**
 * Log a single line to the console in structured format for Grafana/Loki
 *
 * @param message - The log message
 * @param category - Category of the log (e.g., "Auth", "Socket", "Database")
 * @param logType - Type of log: "Info", "Error", or "Warn"
 * @param metadata - Optional key-value pairs for additional context
 *
 * @example
 * appLogLine("User logged in successfully", "Auth", "Info", {
 *   username: "john.doe",
 *   browser: "Chrome",
 *   os: "Windows"
 * });
 */
export function appLogLine(
  message: string,
  category: string,
  logType: LogType,
  metadata?: Record<string, string | number | boolean>
): void {
  const metadataString = metadata ? JSON.stringify(metadata) : "{}";
  const logLine = `logType="${logType}" category="${category}" message="${message}" metadata=${metadataString}`;

  switch (logType) {
    case "Error":
      console.error(logLine);
      break;
    case "Warn":
      console.warn(logLine);
      break;
    case "Info":
    default:
      console.info(logLine);
      break;
  }
}

/**
 * Log multiple lines at once in structured format
 *
 * @param logs - Array of AppLog objects to output
 *
 * @example
 * appLogLines([
 *   { logType: "Info", category: "Auth", message: "Login attempt", metadata: { username: "john.doe" } },
 *   { logType: "Info", category: "Auth", message: "Login successful", metadata: { username: "john.doe" } }
 * ]);
 */
export function appLogLines(logs: AppLog[]): void {
  logs.forEach((log) => {
    appLogLine(log.message, log.category, log.logType, log.metadata);
  });
}
