import * as React from "react";

export const useLog = (pre?: string, logger?: (msg: string) => void) => {
  const loggerOut = React.useCallback(
    (msg: string) => {
      if (logger) {
        logger(`${pre ?? ""}${msg}`);
      }
    },
    [pre, logger]
  );

  return loggerOut;
};
