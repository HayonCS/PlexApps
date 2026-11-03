import * as Hexagonal from "atomic-object/hexagonal";
import { AppLoggingPort } from "./port";
import * as AppLogging from "./app-logging";

export const appLoggingAdapter = Hexagonal.adapter({
  port: AppLoggingPort,
  requires: [],
  build: () => AppLogging,
});
