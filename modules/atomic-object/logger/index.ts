/**
 * Provides an abstract logging API designed to be usable on both the client and the server.
 *
 * An instance of this usually exists in the dependency injection context and may be configured
 * with the current background job ID or HTTP request identifier.
 *
 * Integrated with the `error-notifier` module to automatically send `error` and
 * `critical` logs to the error notification service.
 */
import * as Hexagonal from "atomic-object/hexagonal";
import { concat, each, filter, identity, omit } from "lodash-es";
import { BaseLoggerPort, LoggerPort } from "./ports";

/**
 * trackErrorMetric is used to send error-level logs to Prometheus for monitoring.
 * It is dynamically imported only on the server side (not client/browser).
 * When logger.error(), logger.warning(), or logger.critical() is called,
 * this metric tracker increments Prometheus counters and gauges for alerting.
 */
let trackErrorMetric: ((level: string, errorType?: string, message?: string) => void) | null = null;

if (typeof window === "undefined") {
  import("server/prom-registry")
    .then((mod) => {
      trackErrorMetric = mod.trackError;
    })
    .catch(() => {});
}

let requestId: string | null = null;
export function setRequestId(r: string) {
  requestId = r;
}

export enum ErrorLevel {
  critical = "critical",
  error = "error",
  warning = "warning",
  info = "info",
  debug = "debug",
}

const rankedErrorLevels: ErrorLevel[] = [
  ErrorLevel.debug,
  ErrorLevel.info,
  ErrorLevel.warning,
  ErrorLevel.error,
  ErrorLevel.critical,
];

export type Type = {
  decorator: DecoratorFn;
  critical: LogWriterFn;
  error: LogWriterFn;
  warning: LogWriterFn;
  info: LogWriterFn;
  debug: LogWriterFn;
};

// Log messages always have at least a message, plus anything else if the caller wants
export type LogRecord = { message: string };

type LogWriterFn = (...messages: any[]) => void;
type DecoratorFn = (message: LogRecord) => LogRecord;

const NullLogWriterFn: LogWriterFn = () => {};
const NullDecoratorFn: DecoratorFn = identity;

function makeWrapper(level: ErrorLevel, transform?: DecoratorFn): LogWriterFn {
  const logThreshold = process.env.LOG_LEVEL as ErrorLevel;
  const logThresholdIdx = rankedErrorLevels.indexOf(logThreshold);

  if (logThresholdIdx >= 0 && rankedErrorLevels.indexOf(level) < logThresholdIdx) {
    return NullLogWriterFn;
  }

  return (...messages) => {
    const normalizedMessage = normalizeMessage(messages);
    const decoratedMessages = transform ? transform(normalizedMessage) : normalizedMessage;

    logByLevel(level, decoratedMessages);
  };
}

// export for testing purposes only, otherwise private
export function _replaceErrors(key: any, value: any) {
  if (value instanceof Error) {
    const error: any = {};
    Object.getOwnPropertyNames(value).forEach(function (k) {
      error[k] = (value as any)[k];
    });
    return error;
  }
  return value;
}

function logByLevel(level: ErrorLevel, message: LogRecord) {
  const messageWithLevel = Object.assign({ level: level }, requestId ? { requestId: requestId } : {}, message);

  if (
    (level === ErrorLevel.error || level === ErrorLevel.critical || level === ErrorLevel.warning) &&
    trackErrorMetric
  ) {
    const errorType = (message as any).exception?.name || "unknown";
    const errorMessage = message.message || "";
    trackErrorMetric(level, errorType, errorMessage);
  }

  const stringifiedMessage = JSON.stringify(messageWithLevel, _replaceErrors);
  switch (level) {
    case ErrorLevel.debug:
    case ErrorLevel.info:
      console.info("👀", stringifiedMessage);
      break;
    case ErrorLevel.warning:
      console.warn(stringifiedMessage);
      break;
    case ErrorLevel.error:
    case ErrorLevel.critical:
      console.error(stringifiedMessage);
      break;
  }
}

export function normalizeMessage(args: any[]): LogRecord {
  const result: LogRecord = {
    message: "",
  };

  each(args, (arg) => {
    if (typeof arg === "string" || arg instanceof String) {
      const nonblank = filter([result.message, `${arg}`], (s) => s !== "");
      result.message = nonblank.join("\n");
    } else if (arg instanceof Error) {
      const nonblank = filter([result.message, `${arg.message}`], (s) => s !== "");
      result.message = nonblank.join("\n");

      // if you have a log that has multiple exception arguments the output
      // might be a bit weird, but we'll at least make sure it gets there.
      if ((result as any)["exception"]) {
        const allExceptions = concat([arg], (result as any)["exception"]);
        (result as any)["exception"] = allExceptions;
      } else {
        (result as any)["exception"] = arg;
      }
    } else if (typeof arg === "object") {
      const argWithoutMessage = omit(arg, ["message"]);
      const message = arg["message"];
      Object.assign(result, argWithoutMessage);
      if (message && message !== "") {
        const nonblank = filter([result.message, `${message}`], (s) => s !== "");
        result.message = nonblank.join("\n");
      }
    }
  });

  return result;
}

export function makeDecoratedLogger(logger: Type, decorator: DecoratorFn) {
  return {
    decorator: (message: LogRecord) => decorator(logger.decorator(message)),
    critical: makeWrapper(ErrorLevel.critical, decorator),
    error: makeWrapper(ErrorLevel.error, decorator),
    warning: makeWrapper(ErrorLevel.warning, decorator),
    info: makeWrapper(ErrorLevel.info, decorator),
    debug: makeWrapper(ErrorLevel.debug, decorator),
  };
}

export const NullLogger: Type = {
  decorator: NullDecoratorFn,
  critical: NullLogWriterFn,
  error: NullLogWriterFn,
  warning: NullLogWriterFn,
  info: NullLogWriterFn,
  debug: NullLogWriterFn,
};

export const Logger: Type = {
  decorator: NullDecoratorFn,
  critical: makeWrapper(ErrorLevel.critical),
  error: makeWrapper(ErrorLevel.error),
  warning: makeWrapper(ErrorLevel.warning),
  info: makeWrapper(ErrorLevel.info),
  debug: makeWrapper(ErrorLevel.debug),
};

export const baseLoggerAdapter = Hexagonal.adapter({
  port: BaseLoggerPort,
  build: () => Logger,
});

export const loggerAdapter = Hexagonal.adapter({
  port: LoggerPort,
  requires: [BaseLoggerPort],
  build: (ctx) => {
    return makeDecoratedLogger(ctx.get(BaseLoggerPort), (message: { message: string }) => Object.assign(message));
  },
});
