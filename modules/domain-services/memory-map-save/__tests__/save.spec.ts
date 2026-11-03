import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { gql } from "@apollo/client";
import { Context } from "modules/context";
import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { destroyAllConnections } from "modules/db";
import { DirectionType } from "modules/core/types";
import { readMemoryMap, readMemoryMapSnapshot } from "../document";
import { saveMemoryMap } from "../service";

const identity = { memoryMapName: "save-test-map", bomRevision: "AAA", version: 7 };
const authorization = { userName: "writer", canWrite: true };

async function fixture(ctx: Context) {
  const repos = ctx.repos;
  const map = await repos.memoryMaps.insert({
    PartNumber: identity.memoryMapName,
    BOMRevision: identity.bomRevision,
    InternalRevision: identity.version,
    CommandSetID: 1,
    Description: "preserve map metadata",
  });
  const p = await repos.memoryMapData.insert({
    MemoryMapID: map.ID,
    CommandSetDataID: 1,
    LL: "0",
    Value: "4",
    HL: "10",
    Description: "preserve description",
    Units: "unit",
  });
  const q = await repos.memoryMapData.insert({
    MemoryMapID: map.ID,
    CommandSetDataID: 2,
    LL: "",
    Value: "original",
    HL: "",
    Description: "second parameter",
  });
  const removed = await repos.memoryMapData.insert({
    MemoryMapID: map.ID,
    CommandSetDataID: 3,
    LL: "",
    Value: "remove",
    HL: "",
    Description: "removed command",
  });
  await repos.commandSetData.insert({
    CommandSetID: 1,
    Command: "AddedCommand",
    Parameter: "Array",
    DataType: "U16[2]",
    Direction: DirectionType.MEMORY,
    DefaultLowLimit: "0 0",
    DefaultValue: "0 0",
    DefaultHighLimit: "65535 65535",
  });
  await repos.commandSetData.insert({
    CommandSetID: 1,
    Command: "AddedCommand",
    Parameter: "Byte",
    DataType: "U8",
    Direction: DirectionType.MEMORY,
    DefaultLowLimit: "0",
    DefaultValue: "0",
    DefaultHighLimit: "255",
  });
  const partA = await repos.partNumbers.insert({
    PartNumber: "part-a",
    BOMRevision: "AAA",
    MemoryMapID: map.ID,
    Description: "preserve part metadata",
  });
  const partB = await repos.partNumbers.insert({
    PartNumber: "part-b",
    BOMRevision: "AAA",
    MemoryMapID: map.ID,
    Description: "second part",
  });
  const value = await repos.memoryMapValues.insert({
    MemoryMapDataID: p.ID,
    PartNumberID: partA.ID,
    PartNumberValue: "5",
  });
  await repos.memoryMapValues.insert({ MemoryMapDataID: q.ID, PartNumberID: partA.ID, PartNumberValue: "first" });
  await repos.memoryMapValues.insert({
    MemoryMapDataID: removed.ID,
    PartNumberID: partA.ID,
    PartNumberValue: "remove override",
  });
  await repos.memoryMapValues.insert({ MemoryMapDataID: q.ID, PartNumberID: partB.ID, PartNumberValue: "second" });
  const operation = await repos.operationsData.insert({ MemoryMapDataID: p.ID, TestStationID: 1, OperationID: 2 });
  await repos.operationsData.insert({ MemoryMapDataID: removed.ID, TestStationID: 1, OperationID: 3 });
  const tester = await repos.testers.insert({ TesterName: "Other", Description: "shared tester" });
  const station = await repos.testStations.insert({
    TesterID: tester.ID,
    StationName: "OtherStation",
    Description: "shared station",
  });
  const document = await repos.transaction(
    (transactionRepos) => readMemoryMap(transactionRepos, identity),
    "SERIALIZABLE"
  );
  return { map, p, q, removed, partA, partB, value, operation, station, document: document! };
}

async function rows(ctx: Context) {
  const db = ctx.repos.memoryMaps.db;
  const result: Record<string, unknown[]> = {};
  for (const table of [
    "MemoryMaps",
    "MemoryMapData",
    "MemoryMapValues",
    "OperationsData",
    "CommandSetData",
    "PartNumbers",
    "Testers",
    "TestStations",
    "Operations",
  ]) {
    result[table] = await db(table).orderBy("ID");
  }
  return result;
}

function edit(document: Awaited<ReturnType<typeof fixture>>["document"]) {
  const draft = structuredClone(document);
  draft.commands.TestCommand1.parameters.TestParameter1.lowLimit = "1";
  draft.commands.TestCommand1.parameters.TestParameter1.value = "6";
  draft.commands.TestCommand1.parameters.TestParameter1.highLimit = "20";
  return draft;
}

afterAll(destroyAllConnections);
beforeEach(async () => {
  vi.restoreAllMocks();
  await setupTestDatabase();
});

describe("explicit memory map save against SQL Server", () => {
  it(
    "reads maps with more than 2100 parameters and part numbers using constant-size bindings",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const db = ctx.repos.memoryMaps.db;
      await db.batchInsert(
        "CommandSetData",
        Array.from({ length: 2101 }, (_, i) => ({
          CommandSetID: 1,
          Command: "LargeCommand",
          Parameter: `P${i}`,
          DataType: "string",
          Direction: DirectionType.MEMORY,
        })),
        100
      );
      const definitions = await ctx.repos.commandSetData.table().where({ Command: "LargeCommand" });
      await db.batchInsert(
        "MemoryMapData",
        definitions.map((definition) => ({
          MemoryMapID: f.map.ID,
          CommandSetDataID: definition.ID,
          LL: "",
          Value: "",
          HL: "",
          Description: "large map",
        })),
        100
      );
      await db.batchInsert(
        "PartNumbers",
        Array.from({ length: 2101 }, (_, i) => ({
          MemoryMapID: f.map.ID,
          PartNumber: `large-part-${i}`,
          BOMRevision: "AAA",
          Description: "large map",
        })),
        100
      );
      const queries: { sql: string; bindings?: unknown[] }[] = [];
      const capture = (query: { sql: string; bindings?: unknown[] }) => queries.push(query);
      db.on("query", capture);
      try {
        const snapshot = await ctx.repos.transaction((repos) => readMemoryMapSnapshot(repos, identity), "SERIALIZABLE");
        expect(snapshot!.data).toHaveLength(2104);
        expect(snapshot!.partNumbers).toHaveLength(2103);
        expect(snapshot!.values).toHaveLength(4);
        expect(snapshot!.operationsData).toHaveLength(2);
        const childReads = queries.filter((query) => /from \[(MemoryMapValues|OperationsData)\]/i.test(query.sql));
        expect(childReads).toHaveLength(2);
        expect(childReads.map((query) => query.bindings?.length)).toEqual([2, 1]);
      } finally {
        db.removeListener("query", capture);
      }
      const document = (await readMemoryMap(ctx.repos, identity))!;
      const saved = await saveMemoryMap(ctx.repos, authorization, {
        ...identity,
        expectedToken: document.concurrencyToken,
        document,
      });
      expect(saved).toEqual(document);
    })
  );

  it(
    "detects cross-map overrides touching either local side, while retaining query access",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const other = await ctx.repos.memoryMaps.insert({ ...f.map, PartNumber: "other-map" });
      const otherData = await ctx.repos.memoryMapData.insert({ ...f.p, MemoryMapID: other.ID });
      const otherPart = await ctx.repos.partNumbers.insert({ ...f.partA, MemoryMapID: other.ID });
      const crossValues = [
        { MemoryMapDataID: f.q.ID, PartNumberID: otherPart.ID, PartNumberValue: "cross-out" },
        { MemoryMapDataID: otherData.ID, PartNumberID: f.partB.ID, PartNumberValue: "6" },
      ];
      for (const crossValue of crossValues) {
        const value = await ctx.repos.memoryMapValues.insert(crossValue);
        const loaded = await ctx.repos.transaction((repos) => readMemoryMap(repos, identity), "SERIALIZABLE");
        expect(loaded!.commands).toEqual(f.document.commands);
        expect(loaded!.partNumbers).toEqual(f.document.partNumbers);
        expect(loaded!.concurrencyToken).not.toBe(f.document.concurrencyToken);
        const snapshot = await readMemoryMapSnapshot(ctx.repos, identity);
        expect(snapshot!.values.some((row) => row.ID === value.ID)).toBe(true);
        await expect(
          saveMemoryMap(ctx.repos, authorization, {
            ...identity,
            expectedToken: loaded!.concurrencyToken,
            document: loaded,
          })
        ).rejects.toMatchObject({ extensions: { code: "MEMORY_MAP_UNSUPPORTED" } });
        expect(await ctx.repos.memoryMapValues.table().where({ ID: value.ID }).first()).toMatchObject(value);
        await ctx.repos.memoryMapValues.table().where({ ID: value.ID }).delete();
      }
    })
  );

  it(
    "rejects stale tokens after a hidden operation anchor changes without changing the visible document",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      await ctx.repos.operationsData.table().where({ ID: f.operation.ID }).update({ MemoryMapDataID: f.q.ID });
      const loaded = await readMemoryMap(ctx.repos, identity);
      expect(loaded!.testers).toEqual(f.document.testers);
      expect(loaded!.concurrencyToken).not.toBe(f.document.concurrencyToken);
      await expect(
        saveMemoryMap(ctx.repos, authorization, {
          ...identity,
          expectedToken: f.document.concurrencyToken,
          document: edit(f.document),
        })
      ).rejects.toMatchObject({ extensions: { code: "MEMORY_MAP_CONFLICT" } });
    })
  );

  it(
    "retains foreign commandset parameter reads and metadata tokens but rejects their save",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const set = await ctx.repos.commandSets.insert({
        Name: "Foreign set",
        Version: 1,
        Description: "legacy",
        FilePath: "foreign.cmdset",
      });
      const definition = await ctx.repos.commandSetData.insert({
        CommandSetID: set.ID,
        Command: "ForeignCommand",
        Parameter: "ForeignParameter",
        DataType: "string",
        Direction: DirectionType.MEMORY,
        DefaultLowLimit: "",
        DefaultValue: "",
        DefaultHighLimit: "",
      });
      await ctx.repos.memoryMapData.insert({ ...f.q, CommandSetDataID: definition.ID });
      const document = (await readMemoryMap(ctx.repos, identity))!;
      expect(document.commands.ForeignCommand.parameters.ForeignParameter.value).toBe("original");
      await expect(
        saveMemoryMap(ctx.repos, authorization, {
          ...identity,
          expectedToken: document.concurrencyToken,
          document,
        })
      ).rejects.toMatchObject({ extensions: { code: "MEMORY_MAP_UNSUPPORTED" } });
      await ctx.repos.commandSetData.table().where({ ID: definition.ID }).update({ DefaultValue: "changed" });
      expect((await readMemoryMap(ctx.repos, identity))!.concurrencyToken).not.toBe(document.concurrencyToken);
    })
  );

  it(
    "queries conflicting legacy operations but rejects saving their lossy command-level projection",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      await ctx.repos.operationsData.insert({ MemoryMapDataID: f.q.ID, TestStationID: 1, OperationID: 3 });
      const loaded = await ctx.apolloClient.query({
        query: gql`
          query Legacy {
            getMemoryMap(memoryMapName: "save-test-map", bomRevision: "AAA", version: 7) {
              testers
              concurrencyToken
            }
          }
        `,
        fetchPolicy: "no-cache",
      });
      expect(loaded.data.getMemoryMap.testers.tester.teststation.TestCommand1).toBe("OP_VERIFY");
      await expect(
        saveMemoryMap(ctx.repos, authorization, {
          ...identity,
          expectedToken: loaded.data.getMemoryMap.concurrencyToken,
          document: edit(f.document),
        })
      ).rejects.toMatchObject({ extensions: { code: "MEMORY_MAP_UNSUPPORTED" } });
    })
  );

  it(
    "persists an empty map while retaining existing part-number metadata",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const saved = await saveMemoryMap(ctx.repos, authorization, {
        ...identity,
        expectedToken: f.document.concurrencyToken,
        document: { commands: {}, testers: {}, partNumbers: { "part-a": {}, "part-b": {} } },
      });
      expect(saved.commands).toEqual({});
      expect(saved.testers).toEqual({});
      expect(saved.partNumbers).toEqual({ "part-a": {}, "part-b": {} });
      expect(await ctx.repos.memoryMapData.table().where({ MemoryMapID: f.map.ID })).toHaveLength(0);
      expect(await ctx.repos.memoryMapValues.table().whereIn("PartNumberID", [f.partA.ID, f.partB.ID])).toHaveLength(0);
      expect(
        await ctx.repos.operationsData.table().whereIn("MemoryMapDataID", [f.p.ID, f.q.ID, f.removed.ID])
      ).toHaveLength(0);
      expect(await ctx.repos.partNumbers.table().where({ ID: f.partA.ID }).first()).toMatchObject(f.partA);
    })
  );

  it(
    "re-anchors a selected command operation if its last legacy parameter anchor is removed",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const draft = structuredClone(f.document);
      delete draft.commands.TestCommand1.parameters.TestParameter1;
      delete draft.partNumbers["part-a"].TestCommand1.TestParameter1;
      const saved = await saveMemoryMap(ctx.repos, authorization, {
        ...identity,
        expectedToken: f.document.concurrencyToken,
        document: draft,
      });
      expect(saved.testers).toEqual(f.document.testers);
      expect(
        await ctx.repos.operationsData.table().where({ MemoryMapDataID: f.q.ID, TestStationID: 1 }).first()
      ).toMatchObject({ OperationID: 2 });
      expect(await ctx.repos.memoryMapData.table().where({ ID: f.p.ID })).toHaveLength(0);
    })
  );

  it(
    "round-trips parameter/command additions and removals, overrides and operations without revisions or shared-table writes",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const before = await rows(ctx);
      const draft = edit(f.document);
      delete draft.commands.TestCommand2;
      delete draft.partNumbers["part-a"].TestCommand2;
      delete draft.partNumbers["part-a"].TestCommand1.TestParameter2;
      draft.partNumbers["part-a"].TestCommand1.TestParameter1 = "8";
      draft.partNumbers["part-b"].TestCommand1.TestParameter1 = "9";
      draft.commands.AddedCommand = {
        parameters: {
          Array: { lowLimit: "0 0", value: "2 3", highLimit: "10 10" },
          Byte: { lowLimit: "0", value: "1", highLimit: "255" },
        },
      } as (typeof draft.commands)[string];
      delete draft.testers.tester.teststation.TestCommand2;
      draft.testers.tester.teststation.TestCommand1 = "OP_VERIFY";
      draft.testers.other = { otherstation: { AddedCommand: "OP_WRITE" } };
      const saved = await saveMemoryMap(ctx.repos, authorization, {
        ...identity,
        expectedToken: f.document.concurrencyToken,
        document: draft,
      });
      expect(saved.version).toBe(7);
      expect(saved.concurrencyToken).not.toBe(f.document.concurrencyToken);
      expect(saved.commands.TestCommand2).toBeUndefined();
      expect(saved.commands.TestCommand1.parameters.TestParameter1).toMatchObject({
        lowLimit: "1",
        value: "6",
        highLimit: "20",
      });
      expect(saved.commands.AddedCommand.parameters.Array).toMatchObject({
        value: "2 3",
        datatype: "U16[2]",
        defaultHighLimit: "65535 65535",
      });
      expect(saved.partNumbers).toEqual({
        "part-a": { TestCommand1: { TestParameter1: "8" } },
        "part-b": { TestCommand1: { TestParameter1: "9", TestParameter2: "second" } },
      });
      expect(saved.testers).toEqual({
        tester: { teststation: { TestCommand1: "OP_VERIFY" } },
        other: { otherstation: { AddedCommand: "OP_WRITE" } },
      });
      const after = await rows(ctx);
      for (const table of ["MemoryMaps", "CommandSetData", "PartNumbers", "Testers", "TestStations", "Operations"]) {
        expect(after[table]).toEqual(before[table]);
      }
      const persisted = await ctx.repos.memoryMapData.table().where({ ID: f.p.ID }).first();
      expect(persisted).toMatchObject({ ID: f.p.ID, Description: "preserve description", Units: "unit", Value: "6" });
      expect(await ctx.repos.memoryMapValues.table().where({ ID: f.value.ID }).first()).toMatchObject({
        PartNumberValue: "8",
      });
      expect(await ctx.repos.operationsData.table().where({ ID: f.operation.ID }).first()).toMatchObject({
        OperationID: 3,
      });
      // Sparse legacy operation stays on its original parameter; no extra row is invented for Q.
      expect(await ctx.repos.operationsData.table().where({ MemoryMapDataID: f.q.ID })).toHaveLength(0);
      const added = await ctx.repos.memoryMapData
        .table()
        .where({ MemoryMapID: f.map.ID })
        .whereNotIn("ID", [f.p.ID, f.q.ID]);
      expect(
        await ctx.repos.operationsData.table().whereIn(
          "MemoryMapDataID",
          added.map((row) => row.ID)
        )
      ).toHaveLength(2);
      expect(await ctx.repos.transaction((repos) => readMemoryMap(repos, identity), "SERIALIZABLE")).toEqual(saved);
    })
  );

  it(
    "no-op saves retain all IDs, metadata and the same token",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const before = await rows(ctx);
      const saved = await saveMemoryMap(ctx.repos, authorization, {
        ...identity,
        expectedToken: f.document.concurrencyToken,
        document: f.document,
      });
      expect(saved).toEqual(f.document);
      expect(await rows(ctx)).toEqual(before);
    })
  );

  it(
    "serializes competing saves: exactly one succeeds and the stale editor conflicts",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const first = edit(f.document);
      const second = edit(f.document);
      second.commands.TestCommand1.parameters.TestParameter1.value = "7";
      const results = await Promise.allSettled(
        [first, second].map((document) =>
          saveMemoryMap(ctx.repos, authorization, {
            ...identity,
            expectedToken: f.document.concurrencyToken,
            document,
          })
        )
      );
      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      const failure = results.find((result) => result.status === "rejected");
      expect(failure?.status === "rejected" ? failure.reason.extensions.code : undefined).toBe("MEMORY_MAP_CONFLICT");
    })
  );

  it(
    "rolls parameter and override changes back on an injected mid-save operation failure",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const before = await rows(ctx);
      const draft = edit(f.document);
      draft.partNumbers["part-a"].TestCommand1.TestParameter1 = "9";
      draft.testers.tester.teststation.TestCommand1 = "OP_VERIFY";
      const transaction = ctx.repos.transaction.bind(ctx.repos);
      vi.spyOn(ctx.repos, "transaction").mockImplementation((callback, isolation) =>
        transaction(async (repos, trx) => {
          const table = repos.operationsData.table.bind(repos.operationsData);
          vi.spyOn(repos.operationsData, "table").mockImplementation(() => {
            const query = table();
            const clone = query.clone.bind(query);
            query.clone = () => {
              const copy = clone();
              vi.spyOn(copy, "update").mockRejectedValue(new Error("injected operation failure"));
              return copy;
            };
            return query;
          });
          return callback(repos, trx);
        }, isolation)
      );
      await expect(
        saveMemoryMap(ctx.repos, authorization, {
          ...identity,
          expectedToken: f.document.concurrencyToken,
          document: draft,
        })
      ).rejects.toThrow("injected operation failure");
      expect(await rows(ctx)).toEqual(before);
    })
  );

  it(
    "fails closed for missing/read-only authorization, including GraphQL context without trusted claims",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const request = { ...identity, expectedToken: f.document.concurrencyToken, document: edit(f.document) };
      for (const auth of [undefined, { userName: "readonly", canWrite: false }, { userName: "", canWrite: true }]) {
        await expect(saveMemoryMap(ctx.repos, auth, request)).rejects.toMatchObject({
          extensions: { code: "FORBIDDEN" },
        });
      }
      const mutation = gql`
        mutation Save($document: JSON!, $token: String!) {
          saveMemoryMap(
            memoryMapName: "save-test-map"
            bomRevision: "AAA"
            version: 7
            expectedToken: $token
            document: $document
          ) {
            concurrencyToken
            version
          }
        }
      `;
      const variables = { document: request.document, token: request.expectedToken };
      const result = await ctx.apolloClient.mutate({ mutation, variables, errorPolicy: "all" });
      expect(result.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
      const trusted = new Context({
        db: ctx.repos.memoryMaps.db,
        userName: "writer",
        memoryMapSaveAuthorization: authorization,
      });
      const loaded = await ctx.apolloClient.query({
        query: gql`
          query Token {
            getMemoryMap(memoryMapName: "save-test-map", bomRevision: "AAA", version: 7) {
              concurrencyToken
            }
          }
        `,
        fetchPolicy: "no-cache",
      });
      expect(loaded.data.getMemoryMap.concurrencyToken).toBe(request.expectedToken);
      const saved = await trusted.apolloClient.mutate({ mutation, variables });
      expect(saved.data.saveMemoryMap.version).toBe(identity.version);
      expect(saved.data.saveMemoryMap.concurrencyToken).not.toBe(request.expectedToken);
    })
  );

  it(
    "protects both release tables and latest revision membership inside the transaction",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const request = { ...identity, expectedToken: f.document.concurrencyToken, document: edit(f.document) };
      await ctx.repos.memoryMaps.db("ReleasedToProduction").insert({ MemoryMapID: f.map.ID });
      await expect(saveMemoryMap(ctx.repos, authorization, request)).rejects.toMatchObject({
        extensions: { code: "MEMORY_MAP_PROTECTED" },
      });
      await ctx.repos.memoryMaps.db("ReleasedToProduction").where({ MemoryMapID: f.map.ID }).delete();
      await ctx.repos.releasedMemoryMaps.insert({
        MemoryMapID: f.map.ID,
        AuthorID: 1,
        ReleasedToProductionID: 1,
        ECNumber: "EC",
        LogMsg: "protected",
        DateStamp: "2026-10-14T00:00:00Z",
        EffectivityDate: "2026-10-14T00:00:00Z",
      });
      await expect(saveMemoryMap(ctx.repos, authorization, request)).rejects.toMatchObject({
        extensions: { code: "MEMORY_MAP_PROTECTED" },
      });
      await ctx.repos.releasedMemoryMaps.table().where({ MemoryMapID: f.map.ID }).delete();
      await ctx.repos.memoryMaps.insert({ ...f.map, InternalRevision: 8 });
      await expect(saveMemoryMap(ctx.repos, authorization, request)).rejects.toMatchObject({
        extensions: { code: "MEMORY_MAP_PROTECTED" },
      });
      await expect(
        saveMemoryMap(ctx.repos, authorization, { ...request, memoryMapName: "not-found" })
      ).rejects.toMatchObject({ extensions: { code: "NOT_FOUND" } });
    })
  );

  it(
    "allows saving release entries with nonpositive production IDs without changing release metadata",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const release = await ctx.repos.releasedMemoryMaps.insert({
        MemoryMapID: f.map.ID,
        AuthorID: 1,
        ReleasedToProductionID: -1,
        ECNumber: "EC",
        LogMsg: "not released to production",
        DateStamp: "2026-10-14T00:00:00Z",
        EffectivityDate: "2026-10-14T00:00:00Z",
      });
      for (const productionId of [-1, 0]) {
        await ctx.repos.releasedMemoryMaps.table().where({ ID: release.ID }).update({
          ReleasedToProductionID: productionId,
        });
        const before = await ctx.repos.releasedMemoryMaps.table().where({ ID: release.ID }).first();
        const snapshot = await readMemoryMapSnapshot(ctx.repos, identity);
        expect(snapshot?.released).toBe(false);
        const document = await ctx.repos.transaction((repos) => readMemoryMap(repos, identity), "SERIALIZABLE");
        const saved = await saveMemoryMap(ctx.repos, authorization, {
          ...identity,
          expectedToken: document!.concurrencyToken,
          document: edit(document!),
        });
        expect(saved.commands.TestCommand1.parameters.TestParameter1.value).toBe("6");
        expect(await ctx.repos.releasedMemoryMaps.table().where({ ID: release.ID }).first()).toEqual(before);
      }
    })
  );

  it(
    "invalid input and unrepresentable empty selections write nothing",
    withContext(async (ctx) => {
      const f = await fixture(ctx);
      const before = await rows(ctx);
      const draft = edit(f.document);
      draft.testers.tester.teststation = {};
      await expect(
        saveMemoryMap(ctx.repos, authorization, {
          ...identity,
          expectedToken: f.document.concurrencyToken,
          document: draft,
        })
      ).rejects.toMatchObject({ extensions: { code: "MEMORY_MAP_UNSUPPORTED" } });
      expect(await rows(ctx)).toEqual(before);
    })
  );
});
