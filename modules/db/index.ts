import Debug from "debug";
import knex from "knex";

import { knexConfig } from "db/config";

const debug = Debug.debug("db");

export type Knex = knex.Knex;

let _connections: { [key: string]: Knex } = {};

function buildConnection(prefix: string) {
  const domainConfig = { ...knexConfig["default"] };

  return knex({
    ...domainConfig,
    connection: {
      ...domainConfig.connection,
      database: domainConfig.connection.database.replace("test-", prefix),
    },
  });
}

export function getConnectionForPrefix(prefix: string) {
  if (!_connections["default"]) {
    _connections["default"] = buildConnection(prefix);
  }

  return _connections["default"]!;
}

export function getConnection() {
  const prefix =
    process.env.NODE_ENV === "test"
      ? process.env.VITEST_POOL_ID && process.env.VITEST_POOL_ID.length > 0
        ? `test-${process.env.VITEST_POOL_ID}-`
        : "test-"
      : "";

  if (!_connections["default"]) {
    _connections["default"] = buildConnection(prefix);
  }

  debug("📦 Domain:", "default", "; Prefix:", prefix, "; key:", "default");

  return _connections["default"]!;
}

export async function destroyConnection(dbName?: string) {
  const k = dbName || "__default";
  const existingConnection = _connections[k];
  if (existingConnection) {
    delete _connections[k];
    await existingConnection.destroy();
  }
}

export async function destroyAllConnections() {
  const connections = _connections;
  _connections = {};

  await Promise.all(
    Object.keys(connections).map((key) => {
      return new Promise((resolve) => {
        connections[key].destroy(() => {
          resolve(0);
        });
      });
    })
  );
}

export async function allTableNamesFromDb(knex: Knex) {
  const result = await knex.raw<Array<{ TABLE_SCHEMA: string; TABLE_NAME: string }>>(`
    SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'
    `);

  return result.map((r) => `"${r.TABLE_SCHEMA}"."${r.TABLE_NAME}"`);
}

export async function truncateAllTables(knex: Knex) {
  const tables = await allTableNamesFromDb(knex);
  const escapedTableNameList = tables.join(", ");
  return `TRUNCATE ${escapedTableNameList}`;
}

export async function truncateAll(knex: Knex) {
  await truncateAllTables(knex);
}
