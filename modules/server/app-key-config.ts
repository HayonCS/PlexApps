import config from "config";

export const appKeyConfig = {
  secret: config.get<string>("server.graphqlAppSecret"),
};

export const checkForAppKey = (app_specific_key: string) => {
  const appKeys = appKeyConfig.secret;
  return appKeys && app_specific_key && appKeys.includes("--" + `${app_specific_key}` + "--");
};
