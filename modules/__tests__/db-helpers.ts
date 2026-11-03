import * as db from "db";
import * as uuid from "uuid";
import { ClientState } from "client/graphql/state-link";
import { Context } from "context";
import { Knex } from "knex";
import { DirectionType, OperationType } from "modules/core/types";

export function withTestDb(fn: (knex: Knex) => Promise<any>) {
  return async () => {
    const knex = db.getConnection();
    await db.truncateAllTables(knex);
    await fn(knex);
  };
}

type ContextFn = (context: Context) => void | any;
type WithContextArgs = {
  initialState?: ClientState;
  run: ContextFn;
  userName?: string;
  appKey?: string;
  redisPrefix?: string;
};

export function withContext(
  fnOrObj: WithContextArgs | ContextFn,
  extraArgs?: Partial<Omit<WithContextArgs, "run">>
): () => Promise<any> {
  let args: WithContextArgs = typeof fnOrObj === "function" ? { run: fnOrObj } : fnOrObj;
  if (extraArgs !== undefined) {
    args = { ...args, ...extraArgs };
  }
  return withTestDb(async (db) => {
    let context: Context = null as any;
    const subversionSuffix = `-${process.env.VITEST_POOL_ID}`;
    const redisPrefix = extraArgs ? (extraArgs.redisPrefix ?? uuid.v4()) : uuid.v4();
    const smbPrefix = `test-${process.env.VITEST_POOL_ID}`;
    const userName = extraArgs ? extraArgs.userName : undefined;

    context = new Context({
      db,
      initialState: extraArgs ? extraArgs.initialState : undefined,
      subversionSuffix,
      redisPrefix,
      smbPrefix,
      userName,
      appKey: extraArgs ? extraArgs.appKey : undefined,
    });

    try {
      await args.run(context);
    } finally {
      await context.destroy();
    }
  });
}
export const setupTestDatabase = withContext(
  async (ctx) => {
    const domainDb = await ctx.domainDb();

    // Reset the IDENTITY columns (ID columns) so that the enum values
    // in the database match up with the enums declared in code.
    const resetIdentityColumn = (tableName: string) =>
      `IF EXISTS (SELECT * FROM sys.identity_columns WHERE OBJECT_NAME(OBJECT_ID) = '${tableName}' AND last_value IS NOT NULL) DBCC CHECKIDENT ('${tableName}', RESEED, 0);`;

    await domainDb("Firmware").delete();
    await domainDb.raw(resetIdentityColumn("Firmware"));

    await domainDb("PartNumbers").delete();
    await domainDb.raw(resetIdentityColumn("PartNumbers"));

    await domainDb("MemoryMapData").delete();
    await domainDb.raw(resetIdentityColumn("MemoryMapData"));

    await domainDb("MemoryMaps").delete();
    await domainDb.raw(resetIdentityColumn("MemoryMaps"));

    await domainDb("MemoryMapValues").delete();
    await domainDb.raw(resetIdentityColumn("MemoryMapValues"));

    await domainDb("OperationsData").delete();
    await domainDb.raw(resetIdentityColumn("OperationsData"));

    await domainDb("Operations").delete();
    await domainDb.raw(resetIdentityColumn("Operations"));

    await domainDb("ReleasedMemoryMaps").delete();
    await domainDb.raw(resetIdentityColumn("ReleasedMemoryMaps"));

    await domainDb("ReleasedToProduction").delete();
    await domainDb.raw(resetIdentityColumn("ReleasedToProduction"));

    await domainDb("TestStations").delete();
    await domainDb.raw(resetIdentityColumn("TestStations"));

    await domainDb("Testers").delete();
    await domainDb.raw(resetIdentityColumn("Testers"));

    await domainDb("CommandSetData").delete();
    await domainDb.raw(resetIdentityColumn("CommandSetData"));

    await domainDb("CommandSets").delete();
    await domainDb.raw(resetIdentityColumn("CommandSets"));

    await domainDb("Authors").delete();
    await domainDb.raw(resetIdentityColumn("Authors"));

    const operations = Object.keys(OperationType)
      .filter((operationType) => !operationType.match(/^[0-9]+$/))
      .map((operationType) => ({
        Operation: operationType,
      }));

    await ctx.repos.domain(async (domainRepos) => {
      await domainRepos.operations.insertMany(operations);

      const addedCommandset = await domainRepos.commandSets.insert({
        Name: "Test Commandset",
        Description: "This is a commandset used for testing.",
        FilePath: "Test_Commandset.cmdset",
        Version: 12345,
      });

      const addedCommandSetData1 = await domainRepos.commandSetData.insert({
        CommandSetID: addedCommandset.ID,
        Command: "TestCommand1",
        DataType: "U8",
        DefaultHighLimit: "10",
        DefaultLowLimit: "0",
        DefaultValue: "5",
        Direction: DirectionType.MEMORY,
        Parameter: "TestParameter1",
      });

      await domainRepos.commandSetData.insert({
        CommandSetID: addedCommandset.ID,
        Command: "TestCommand1",
        DataType: "string",
        DefaultHighLimit: "FFFFF",
        DefaultLowLimit: "00000",
        DefaultValue: "AAAAA",
        Direction: DirectionType.OUTPUT,
        Parameter: "TestParameter2",
      });

      const addedCommandSetData3 = await domainRepos.commandSetData.insert({
        CommandSetID: addedCommandset.ID,
        Command: "TestCommand2",
        DataType: "string",
        DefaultHighLimit: "FFFFF",
        DefaultLowLimit: "00000",
        DefaultValue: "AAAAA",
        Direction: DirectionType.OUTPUT,
        Parameter: "TestParameter3",
      });

      const addedMemoryMap1 = await domainRepos.memoryMaps.insert({
        PartNumber: "305-9999-999",
        Description: "This is a memory map used for testing.",
        BOMRevision: "AAA",
        InternalRevision: 1,
        CommandSetID: addedCommandset.ID,
      });

      const author = await domainRepos.authors.insert({
        UserName: "bo.doogan",
        EMail: "bo.doogan@gmail.com",
        PhoneExtension: "1234",
        Supervisor: "Linus Torvalds",
        Title: "Head Cruster",
      });

      await domainRepos.releasedMemoryMaps.insert({
        ReleasedToProductionID: 1,
        AuthorID: author.ID,
        DateStamp: "2022-07-21T15:07:13.717Z",
        EffectivityDate: "2022-07-21T15:07:13.717Z",
        ECNumber: "12345",
        LogMsg: "Dang ole' release man.",
        MemoryMapID: addedMemoryMap1.ID,
      });

      await domainRepos.memoryMaps.insert({
        PartNumber: "305-1111-999",
        Description: "This is a memory map used for testing.",
        BOMRevision: "AAA",
        InternalRevision: 1,
        CommandSetID: addedCommandset.ID,
      });

      await domainRepos.memoryMaps.insert({
        PartNumber: "305-1111-999",
        Description: "This is a memory map used for testing.",
        BOMRevision: "AAA",
        InternalRevision: 2,
        CommandSetID: addedCommandset.ID,
      });

      await domainRepos.memoryMaps.insert({
        PartNumber: "305-1234-999",
        Description: "This is a memory map used for testing as well.",
        BOMRevision: "BBB",
        InternalRevision: 2,
        CommandSetID: addedCommandset.ID,
      });

      const addedMemoryMapData1 = await domainRepos.memoryMapData.insert({
        CommandSetDataID: addedCommandSetData1.ID,
        Description: "This is the first parameter for the command TestCommand1.",
        HL: "20",
        LL: "0",
        MemoryMapID: addedMemoryMap1.ID,
        Value: "10",
      });

      const addedMemoryMapData2 = await domainRepos.memoryMapData.insert({
        CommandSetDataID: addedCommandSetData3.ID,
        Description: "This is the second parameter for the command TestCommand1.",
        HL: "20",
        LL: "0",
        MemoryMapID: addedMemoryMap1.ID,
        Value: "10",
      });

      const addedPartNumber1 = await domainRepos.partNumbers.insert({
        BOMRevision: "AAA",
        Description: "This is a part number for testing.",
        MemoryMapID: addedMemoryMap1.ID,
        PartNumber: "605-0000-000",
      });

      const addedPartNumber2 = await domainRepos.partNumbers.insert({
        BOMRevision: "AAA",
        Description: "This is a part number for testing.",
        MemoryMapID: addedMemoryMap1.ID,
        PartNumber: "705-1111-000",
      });

      const addedPartNumber3 = await domainRepos.partNumbers.insert({
        BOMRevision: "AAA",
        Description: "This is a part number for testing.",
        MemoryMapID: addedMemoryMap1.ID,
        PartNumber: "905-1200-000",
      });

      await domainRepos.memoryMapValues.insert({
        MemoryMapDataID: addedMemoryMapData1.ID,
        PartNumberID: addedPartNumber1.ID,
        PartNumberValue: "Testing",
      });

      await domainRepos.memoryMapValues.insert({
        MemoryMapDataID: addedMemoryMapData2.ID,
        PartNumberID: addedPartNumber1.ID,
        PartNumberValue: "Testing2",
      });

      await domainRepos.memoryMapValues.insert({
        MemoryMapDataID: addedMemoryMapData1.ID,
        PartNumberID: addedPartNumber2.ID,
        PartNumberValue: "BlahBlah",
      });

      await domainRepos.memoryMapValues.insert({
        MemoryMapDataID: addedMemoryMapData2.ID,
        PartNumberID: addedPartNumber2.ID,
        PartNumberValue: "HankHill is the password.",
      });

      await domainRepos.memoryMapValues.insert({
        MemoryMapDataID: addedMemoryMapData1.ID,
        PartNumberID: addedPartNumber3.ID,
        PartNumberValue: "Tim Apple",
      });

      await domainRepos.memoryMapValues.insert({
        MemoryMapDataID: addedMemoryMapData2.ID,
        PartNumberID: addedPartNumber3.ID,
        PartNumberValue: "Today is Wednesday.",
      });

      const addedTester = await domainRepos.testers.insert({
        TesterName: "Tester",
        Description: "This is a tester.",
      });

      const addedTestStation = await domainRepos.testStations.insert({
        TesterID: addedTester.ID,
        StationName: "TestStation",
        Description: "This is a station in a tester.",
      });

      await domainRepos.operationsData.insert({
        MemoryMapDataID: addedMemoryMapData1.ID,
        OperationID: 2,
        TestStationID: addedTestStation.ID,
      });

      await domainRepos.operationsData.insert({
        MemoryMapDataID: addedMemoryMapData2.ID,
        OperationID: 3,
        TestStationID: addedTestStation.ID,
      });
    });
  },
  {
    userName: "not-a-user",
  }
);
