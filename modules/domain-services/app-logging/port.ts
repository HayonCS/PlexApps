import * as Hexagonal from "atomic-object/hexagonal";
import * as AppLogging from "./app-logging";

export const AppLoggingPort = Hexagonal.port<typeof AppLogging, "appLogging">("appLogging");
