import { Knex } from "knex";
import { MemoryMapSaveAuthorization } from "modules/context/ports";
import { Repositories } from "modules/records";
import { SavedMemoryMapDataRecord } from "modules/records/memorymapdata";
import {
  assembleMemoryMap,
  MemoryMapIdentity,
  MemoryMapSaveDocument,
  MemoryMapSnapshot,
  memoryMapError,
  readMemoryMapSnapshot,
} from "./document";
import { EditableDocument, validateSaveDocument } from "./validation";

export type SaveMemoryMapRequest = MemoryMapIdentity & { expectedToken: string; document: unknown };

export async function saveMemoryMap(
  repositories: Repositories,
  authorization: MemoryMapSaveAuthorization | undefined,
  request: SaveMemoryMapRequest
): Promise<MemoryMapSaveDocument> {
  if (!authorization?.userName || authorization.canWrite !== true) {
    memoryMapError("FORBIDDEN", "Authenticated memory map write permission is required.");
  }
  return repositories.transaction(async (repos) => {
    const snapshot = await readMemoryMapSnapshot(repos, request, true);
    if (!snapshot) memoryMapError("NOT_FOUND", "The existing memory map was not found.");
    if (!snapshot.isWorkingCopy || snapshot.released) {
      memoryMapError("MEMORY_MAP_PROTECTED", "Only an unreleased working copy can be saved.");
    }
    const current = assembleMemoryMap(snapshot);
    if (request.expectedToken !== current.concurrencyToken) {
      memoryMapError("MEMORY_MAP_CONFLICT", "The memory map changed on the server. Reload explicitly before saving.");
    }
    const document = validateSaveDocument(request.document, snapshot);
    await persistDocument(repos, snapshot, document);
    const saved = await readMemoryMapSnapshot(repos, request);
    if (!saved) memoryMapError("NOT_FOUND", "Memory map disappeared during save.");
    return assembleMemoryMap(saved);
  }, "SERIALIZABLE");
}

async function persistDocument(repos: Repositories, snapshot: MemoryMapSnapshot, document: EditableDocument) {
  const definitions = snapshot.definitions.filter((row) => document.commands[row.Command]?.parameters[row.Parameter]);
  const retained = new Set(definitions.map((row) => row.ID));
  // Delete only map-specific dependent rows before removing parameters. Never touch shared
  // commandset, tester, station, operation or part number definitions.
  for (const row of snapshot.data) {
    if (!retained.has(row.CommandSetDataID)) {
      await repos.memoryMapValues.table().where({ MemoryMapDataID: row.ID }).delete();
      await repos.operationsData.table().where({ MemoryMapDataID: row.ID }).delete();
      await repos.memoryMapData.table().where({ ID: row.ID, MemoryMapID: snapshot.map.ID }).delete();
    }
  }
  for (const definition of definitions) {
    const parameter = document.commands[definition.Command].parameters[definition.Parameter];
    const fields = { LL: parameter.lowLimit, Value: parameter.value, HL: parameter.highLimit };
    const existing = snapshot.data.find((row) => row.CommandSetDataID === definition.ID);
    if (existing) {
      if (
        (existing.LL ?? "") !== fields.LL ||
        (existing.Value ?? "") !== fields.Value ||
        (existing.HL ?? "") !== fields.HL
      ) {
        await repos.memoryMapData.table().where({ ID: existing.ID, MemoryMapID: snapshot.map.ID }).update(fields);
      }
    } else {
      await repos.memoryMapData.table().insert({
        ...fields,
        MemoryMapID: snapshot.map.ID,
        CommandSetDataID: definition.ID,
        Description: "",
        Units: null,
      });
    }
  }
  const data: SavedMemoryMapDataRecord[] = await repos.memoryMapData
    .table()
    .where({ MemoryMapID: snapshot.map.ID })
    .orderBy("ID");
  const definitionById = new Map(snapshot.definitions.map((row) => [row.ID, row]));
  const dataByParameter = new Map(
    data.map((row) => {
      const definition = definitionById.get(row.CommandSetDataID)!;
      return [JSON.stringify([definition.Command, definition.Parameter]), row];
    })
  );
  const desiredValues: Record<string, string | number>[] = [];
  for (const part of snapshot.partNumbers) {
    for (const [command, parameters] of Object.entries(document.partNumbers[part.PartNumber])) {
      for (const [parameter, value] of Object.entries(parameters)) {
        desiredValues.push({
          PartNumberID: part.ID,
          MemoryMapDataID: dataByParameter.get(JSON.stringify([command, parameter]))!.ID,
          PartNumberValue: value,
        });
      }
    }
  }
  const remainingIds = new Set(data.map((row) => row.ID));
  await syncRelationships(
    repos.memoryMapValues.table(),
    snapshot.values.filter((row) => remainingIds.has(row.MemoryMapDataID)),
    desiredValues,
    ["MemoryMapDataID", "PartNumberID"]
  );
  const desiredOperations: Record<string, string | number>[] = [];
  const oldData = new Map(snapshot.data.map((row) => [row.ID, row]));
  for (const [tester, stations] of Object.entries(document.testers)) {
    for (const [stationName, commands] of Object.entries(stations)) {
      const station = snapshot.stations.find(
        (row) => row.TesterName.toLowerCase() === tester && row.StationName.toLowerCase() === stationName
      )!;
      for (const [command, operationName] of Object.entries(commands)) {
        const operation = snapshot.operations.find((row) => row.Operation === operationName)!;
        const previous = snapshot.operationsData.filter((row) => {
          const parameter = oldData.get(row.MemoryMapDataID);
          return (
            row.TestStationID === station.ID &&
            parameter &&
            definitionById.get(parameter.CommandSetDataID)?.Command === command
          );
        });
        // Read projects parameter operations to a command-level operation. Invert by keeping
        // existing anchors (and IDs), even for sparse legacy mappings. New mappings apply to
        // every persisted parameter; newly added parameters join the command's mapping.
        const anchors = new Set(previous.map((row) => row.MemoryMapDataID));
        const hasRemainingAnchor = data.some((row) => anchors.has(row.ID));
        for (const parameter of data) {
          if (definitionById.get(parameter.CommandSetDataID)?.Command !== command) continue;
          if (hasRemainingAnchor && !anchors.has(parameter.ID) && oldData.has(parameter.ID)) continue;
          desiredOperations.push({
            MemoryMapDataID: parameter.ID,
            TestStationID: station.ID,
            OperationID: operation.ID,
          });
        }
        if (
          !desiredOperations.some(
            (row) =>
              row.TestStationID === station.ID &&
              definitionById.get(data.find((parameter) => parameter.ID === row.MemoryMapDataID)!.CommandSetDataID)
                ?.Command === command
          )
        ) {
          memoryMapError(
            "MEMORY_MAP_UNSUPPORTED",
            "Operation has no remaining parameter anchor.",
            `testers/${tester}/${stationName}/${command}`
          );
        }
      }
    }
  }
  await syncRelationships(
    repos.operationsData.table(),
    snapshot.operationsData.filter((row) => remainingIds.has(row.MemoryMapDataID)),
    desiredOperations,
    ["MemoryMapDataID", "TestStationID"]
  );
}

/** Update only supplied value columns, retaining existing IDs and all unrelated metadata. */
async function syncRelationships(
  table: Knex.QueryBuilder,
  existing: { ID: number }[],
  desired: Record<string, string | number>[],
  keys: string[]
) {
  const key = (row: object) => JSON.stringify(keys.map((field) => (row as Record<string, unknown>)[field]));
  const wanted = new Map(desired.map((row) => [key(row), row]));
  for (const row of existing) {
    const value = wanted.get(key(row));
    if (!value) await table.clone().where({ ID: row.ID }).delete();
    else {
      if (
        Object.entries(value).some(([field, v]) => {
          const stored = (row as unknown as Record<string, unknown>)[field];
          return (field === "PartNumberValue" ? (stored ?? "") : stored) !== v;
        })
      ) {
        await table.clone().where({ ID: row.ID }).update(value);
      }
      wanted.delete(key(row));
    }
  }
  for (const row of wanted.values()) await table.clone().insert(row);
}
