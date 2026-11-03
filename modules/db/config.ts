import config from "config";

export const knexConfig = {
  default: {
    client: "mssql",
    connection: {
      host: config.get<string>("databaseServer"),
      database: config.get<string>("databaseName"),
      user: config.get<string>("databaseUser"),
      password: config.get<string>("databasePassword"),
      requestTimeout: 60000,
      enableArithAbort: true,
    },
  },
};
