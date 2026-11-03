import { createHash } from "node:crypto";
import stringify from "json-stable-stringify";
import { GraphQLError } from "graphql";
import { Repositories } from "modules/records";
import { SavedMemoryMapsRecord } from "modules/records/memorymaps";
import { SavedMemoryMapDataRecord } from "modules/records/memorymapdata";
import { SavedCommandSetDataRecord } from "modules/records/commandsetdata";
import { SavedCommandSetRecord } from "modules/records/commandsets";
import { SavedPartNumbersRecord } from "modules/records/partnumbers";
import { SavedMemoryMapValueRecord } from "modules/records/memorymapvalues";
import { SavedOperationsDataRecord } from "modules/records/operationsdata";
import { MemoryMapDocument } from "modules/graphql-api/server-types.gen";

export type MemoryMapIdentity = { memoryMapName: string; bomRevision: string; version: number };
export type MemoryMapSaveDocument = MemoryMapDocument & { concurrencyToken: string };
export type Station = { ID: number; TesterID: number; StationName: string; TesterName: string };
export type Operation = { ID: number; Operation: string };
export type MemoryMapSnapshot = {
  map: SavedMemoryMapsRecord;
  isWorkingCopy: boolean;
  released: boolean;
  commandset?: SavedCommandSetRecord;
  definitions: SavedCommandSetDataRecord[];
  data: SavedMemoryMapDataRecord[];
  partNumbers: SavedPartNumbersRecord[];
  values: SavedMemoryMapValueRecord[];
  operationsData: SavedOperationsDataRecord[];
  stations: Station[];
  operations: Operation[];
};

export function memoryMapError(code: string, message: string, path?: string): never {
  throw new GraphQLError(message, { extensions: { code, ...(path ? { path } : {}) } });
}

/** All reads use the supplied repositories, including repositories bound to a transaction. */
export async function readMemoryMapSnapshot(
  repos: Repositories,
  identity: MemoryMapIdentity,
  lockForSave = false
): Promise<MemoryMapSnapshot | null> {
  const db = repos.memoryMaps.db;
  // Lock the identity's entire revision range BEFORE loading children or comparing tokens.
  // UPDLOCK serializes competing saves; HOLDLOCK protects against concurrent revision inserts.
  const maps: SavedMemoryMapsRecord[] = lockForSave
    ? await db.raw(
        "SELECT * FROM MemoryMaps WITH (UPDLOCK, HOLDLOCK) WHERE PartNumber = ? AND BOMRevision = ? ORDER BY InternalRevision",
        [identity.memoryMapName, identity.bomRevision]
      )
    : await repos.memoryMaps
        .table()
        .where({ PartNumber: identity.memoryMapName, BOMRevision: identity.bomRevision })
        .orderBy("InternalRevision");
  const map = maps.find((row) => row.InternalRevision === identity.version);
  if (!map) return null;
  const data: SavedMemoryMapDataRecord[] = await repos.memoryMapData
    .table()
    .where({ MemoryMapID: map.ID })
    .orderBy("ID");
  const partNumbers: SavedPartNumbersRecord[] = await repos.partNumbers
    .table()
    .where({ MemoryMapID: map.ID })
    .orderBy("ID");
  // Bind only the map ID, not every child ID (SQL Server allows at most 2100
  // parameters). Include overrides touching EITHER local side so cross-map
  // relationships remain visible to the token and strict save validation.
  const localDataIds = repos.memoryMapData.table().select("ID").where({ MemoryMapID: map.ID });
  const localPartIds = repos.partNumbers.table().select("ID").where({ MemoryMapID: map.ID });
  const values: SavedMemoryMapValueRecord[] = await repos.memoryMapValues
    .table()
    .where((q) => {
      q.whereIn("MemoryMapDataID", localDataIds).orWhereIn("PartNumberID", localPartIds);
    })
    .orderBy("ID");
  const operationsData: SavedOperationsDataRecord[] = await repos.operationsData
    .table()
    .whereIn("MemoryMapDataID", localDataIds.clone())
    .orderBy("ID");
  const commandset: SavedCommandSetRecord | undefined = map.CommandSetID
    ? await repos.commandSets.table().where({ ID: map.CommandSetID }).first()
    : undefined;
  // Legacy queries joined each data row's actual definition, even if it belonged
  // to another commandset. Preserve that read projection and hash its metadata;
  // strict Save rejects these mismatched references before any writes.
  const definitions: SavedCommandSetDataRecord[] = await repos.commandSetData
    .table()
    .where((q) => {
      if (map.CommandSetID) q.where({ CommandSetID: map.CommandSetID });
      q.orWhereIn("ID", localDataIds.clone().clearSelect().select("CommandSetDataID"));
    })
    .orderBy("ID");
  const stations: Station[] = await repos.testStations
    .table()
    .join("Testers", "Testers.ID", "TestStations.TesterID")
    .select("TestStations.ID", "TestStations.TesterID", "TestStations.StationName", "Testers.TesterName")
    .orderBy("TestStations.ID");
  const operations: Operation[] = await repos.operations.table().orderBy("ID");
  // Serializable reads retain key-range locks, including when no release exists yet.
  const releases = await repos.releasedMemoryMaps
    .table()
    .where({ MemoryMapID: map.ID })
    .where("ReleasedToProductionID", ">", 0);
  const production = await db("ReleasedToProduction").where({ MemoryMapID: map.ID });
  return {
    map,
    data,
    partNumbers,
    values,
    operationsData,
    commandset,
    definitions,
    stations,
    operations,
    isWorkingCopy: maps.at(-1)?.ID === map.ID,
    released: releases.length > 0 || production.length > 0,
  };
}

/** Stable over object key order; contains hidden per-parameter relationships and metadata too. */
export function contentToken(snapshot: MemoryMapSnapshot): string {
  const referencedStations = new Set(snapshot.operationsData.map((row) => row.TestStationID));
  const referencedOperations = new Set(snapshot.operationsData.map((row) => row.OperationID));
  const sorted = <T extends { ID: number }>(rows: T[]) => [...rows].sort((a, b) => a.ID - b.ID);
  const persisted = {
    ...snapshot,
    definitions: sorted(snapshot.definitions),
    data: sorted(snapshot.data),
    partNumbers: sorted(snapshot.partNumbers),
    values: sorted(snapshot.values),
    operationsData: sorted(snapshot.operationsData),
    stations: sorted(snapshot.stations.filter((row) => referencedStations.has(row.ID))),
    operations: sorted(snapshot.operations.filter((row) => referencedOperations.has(row.ID))),
  };
  return createHash("sha256").update(stringify(persisted)!).digest("hex");
}

export function assembleMemoryMap(snapshot: MemoryMapSnapshot, strictForSave = true): MemoryMapSaveDocument {
  const { map, commandset } = snapshot;
  const document: MemoryMapSaveDocument = {
    name: map.PartNumber,
    bomRevision: map.BOMRevision.trim(),
    version: map.InternalRevision,
    isWorkingCopy: snapshot.isWorkingCopy,
    commandset: commandset
      ? {
          name: commandset.Name,
          revision: commandset.Version,
          description: commandset.Description ?? "",
          fileName: commandset.FilePath ?? "",
        }
      : null,
    commands: {},
    testers: {},
    partNumbers: {},
    concurrencyToken: contentToken(snapshot),
  };
  const definitions = new Map(snapshot.definitions.map((row) => [row.ID, row]));
  const parameterKeys = new Set<string>();
  for (const row of snapshot.definitions) {
    const key = stringify([row.Command, row.Parameter])!;
    // The DDL uniqueness also includes Direction, but the document cannot represent
    // two directions under one command/parameter key. Reject rather than overwrite.
    if (strictForSave && parameterKeys.has(key)) {
      memoryMapError("MEMORY_MAP_UNSUPPORTED", `Ambiguous commandset parameter ${row.Command}/${row.Parameter}.`);
    }
    parameterKeys.add(key);
  }
  const data = new Map(snapshot.data.map((row) => [row.ID, row]));
  const parts = new Map(snapshot.partNumbers.map((row) => [row.ID, row]));
  const stations = new Map(snapshot.stations.map((row) => [row.ID, row]));
  const operations = new Map(snapshot.operations.map((row) => [row.ID, row]));
  for (const row of snapshot.data) {
    const definition = definitions.get(row.CommandSetDataID);
    if (strictForSave && definition && definition.CommandSetID !== map.CommandSetID) {
      memoryMapError("MEMORY_MAP_UNSUPPORTED", "Memory map references a parameter outside its commandset.");
    }
    if (!definition) {
      if (strictForSave) {
        memoryMapError("MEMORY_MAP_UNSUPPORTED", "Memory map references a parameter outside its commandset.");
      }
      continue;
    }
    const command = (document.commands[definition.Command] ??= { parameters: {} });
    command.parameters[definition.Parameter] = {
      name: definition.Parameter,
      lowLimit: row.LL ?? "",
      value: row.Value ?? "",
      highLimit: row.HL ?? "",
      defaultLowLimit: definition.DefaultLowLimit ?? "",
      defaultValue: definition.DefaultValue ?? "",
      defaultHighLimit: definition.DefaultHighLimit ?? "",
      datatype: definition.DataType,
      direction: definition.Direction,
    };
  }
  for (const part of snapshot.partNumbers) document.partNumbers[part.PartNumber] = {};
  for (const row of snapshot.values) {
    const part = parts.get(row.PartNumberID);
    const parameter = data.get(row.MemoryMapDataID);
    const definition = parameter && definitions.get(parameter.CommandSetDataID);
    if (!part || !definition) {
      if (strictForSave) {
        memoryMapError("MEMORY_MAP_UNSUPPORTED", "Cross-map or orphaned part number override cannot be edited safely.");
      }
      continue;
    }
    // Merge, rather than replacing all previously assembled part numbers/commands/parameters.
    const overrides = document.partNumbers[part.PartNumber];
    (overrides[definition.Command] ??= {})[definition.Parameter] = row.PartNumberValue ?? "";
  }
  for (const row of snapshot.operationsData) {
    const parameter = data.get(row.MemoryMapDataID);
    const definition = parameter && definitions.get(parameter.CommandSetDataID);
    const station = stations.get(row.TestStationID);
    const operation = operations.get(row.OperationID);
    if (!definition || !station || !operation) {
      if (strictForSave) {
        memoryMapError("MEMORY_MAP_UNSUPPORTED", "Orphaned tester operation cannot be edited safely.");
      }
      continue;
    }
    const tester = station.TesterName.toLowerCase();
    const stationName = station.StationName.toLowerCase();
    const commands = ((document.testers[tester] ??= {})[stationName] ??= {});
    const previous = commands[definition.Command];
    if (strictForSave && previous !== undefined && previous !== operation.Operation) {
      memoryMapError(
        "MEMORY_MAP_UNSUPPORTED",
        `Conflicting per-parameter operations for ${tester}/${stationName}/${definition.Command}.`
      );
    }
    commands[definition.Command] = operation.Operation;
  }
  return document;
}

export async function readMemoryMap(
  repos: Repositories,
  identity: MemoryMapIdentity
): Promise<MemoryMapSaveDocument | null> {
  const snapshot = await readMemoryMapSnapshot(repos, identity);
  // Preserve legacy read projections; only Save must reject lossy mappings.
  // The token still covers every raw row, including relationships not projected.
  return snapshot ? assembleMemoryMap(snapshot, false) : null;
}
