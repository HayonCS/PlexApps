import * as Hexagonal from "atomic-object/hexagonal";

import * as Logger from ".";

/**
 * This is the main port used for getting the logger. This can be a decorated
 * logger which includes additional context about the user, request (e.g. http
 * request uuid) or background job.
 */
export const LoggerPort = Hexagonal.port<Logger.Type, "logger">("logger");
/**
 * The root logger underpinning the application. It us decorated by for the LoggerPort.
 * This logger can include global decorations relevant everywhere, while the LoggerPort
 * instance will be customized in particular use cases, such as the job runner.
 */
export const BaseLoggerPort = Hexagonal.port<Logger.Type, "base logger">("base logger");
