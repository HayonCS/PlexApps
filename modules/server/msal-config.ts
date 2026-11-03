import { Configuration, LogLevel } from "@azure/msal-node";

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.OAUTH_APP_ID!,
    authority: `${process.env.OAUTH_AUTHORITY}${process.env.OAUTH_TENANT_ID}`,
    clientSecret: process.env.OAUTH_APP_PASSWORD,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) {
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              break;
            case LogLevel.Warning:
              console.warn(message);
              break;
            case LogLevel.Info:
              console.info(message);
              break;
            case LogLevel.Verbose:
              break;
          }
        }
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Warning,
    },
  },
};

export const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI!;
export const SCOPES = process.env.OAUTH_SCOPES?.split(" ") ?? ["openid", "profile", "email"];
