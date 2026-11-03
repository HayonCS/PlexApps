import { withContext } from "modules/__tests__/db-helpers";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import gql from "graphql-tag";
import * as appLogging from "modules/domain-services/app-logging/app-logging";

const APP_LOG_LINE_MUTATION = gql`
  mutation AppLogLine($logType: LogType!, $category: String!, $message: String!, $metadata: AppLogMetaData) {
    appLogLine(logType: $logType, category: $category, message: $message, metadata: $metadata)
  }
`;

describe("appLogLine Mutation", () => {
  let appLogLineSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    appLogLineSpy = vi.spyOn(appLogging, "appLogLine").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(
    "should call appLogLine with correct parameters for Info log",
    withContext({
      async run(ctx) {
        const result = await ctx.apolloClient.mutate({
          mutation: APP_LOG_LINE_MUTATION,
          variables: {
            logType: "Info",
            category: "Test",
            message: "Test message from client",
            metadata: {
              browser: "Chrome",
              os: "Windows",
            },
          },
        });

        expect(result.data?.appLogLine).toBe(true);
        expect(appLogLineSpy).toHaveBeenCalledWith("Test message from client", "Test", "Info", {
          browser: "Chrome",
          os: "Windows",
        });
      },
    })
  );

  it(
    "should call appLogLine with Error log type",
    withContext({
      async run(ctx) {
        const result = await ctx.apolloClient.mutate({
          mutation: APP_LOG_LINE_MUTATION,
          variables: {
            logType: "Error",
            category: "ClientError",
            message: "An error occurred on the client",
            metadata: {
              errorCode: 500,
              errorMessage: "Internal Server Error",
            },
          },
        });

        expect(result.data?.appLogLine).toBe(true);
        expect(appLogLineSpy).toHaveBeenCalledWith("An error occurred on the client", "ClientError", "Error", {
          errorCode: 500,
          errorMessage: "Internal Server Error",
        });
      },
    })
  );

  it(
    "should call appLogLine with Warn log type",
    withContext({
      async run(ctx) {
        const result = await ctx.apolloClient.mutate({
          mutation: APP_LOG_LINE_MUTATION,
          variables: {
            logType: "Warn",
            category: "Performance",
            message: "Slow query detected",
            metadata: {
              queryTime: 5000,
              threshold: 1000,
            },
          },
        });

        expect(result.data?.appLogLine).toBe(true);
        expect(appLogLineSpy).toHaveBeenCalledWith("Slow query detected", "Performance", "Warn", {
          queryTime: 5000,
          threshold: 1000,
        });
      },
    })
  );

  it(
    "should handle log without metadata",
    withContext({
      async run(ctx) {
        const result = await ctx.apolloClient.mutate({
          mutation: APP_LOG_LINE_MUTATION,
          variables: {
            logType: "Info",
            category: "General",
            message: "Simple log message",
          },
        });

        expect(result.data?.appLogLine).toBe(true);
        expect(appLogLineSpy).toHaveBeenCalledWith("Simple log message", "General", "Info", undefined);
      },
    })
  );

  it(
    "should handle authentication log from client",
    withContext({
      async run(ctx) {
        const result = await ctx.apolloClient.mutate({
          mutation: APP_LOG_LINE_MUTATION,
          variables: {
            logType: "Info",
            category: "Auth",
            message: "john.doe authenticated successfully from client",
            metadata: {
              username: "john.doe",
              browser: "Firefox",
              os: "Mac",
            },
          },
        });

        expect(result.data?.appLogLine).toBe(true);
        expect(appLogLineSpy).toHaveBeenCalledWith("john.doe authenticated successfully from client", "Auth", "Info", {
          username: "john.doe",
          browser: "Firefox",
          os: "Mac",
        });
      },
    })
  );
});
