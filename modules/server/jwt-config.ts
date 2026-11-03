import config from "config";

export const jwtConfig = {
  secret: config.get<string>("server.jwtSecret"),
};
