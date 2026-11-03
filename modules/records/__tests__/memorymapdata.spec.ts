import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { beforeEach, describe, expect, it } from "vitest";

describe("MemoryMap Data Record Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns all of the data for a given memory map id.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.memoryMapData.getAllMemoryMapData(1);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result).toEqual([
          {
            CommandSetDataID: 1,
            MemoryMapDataID: 1,
            LL: "0",
            HL: "20",
            Description: "This is the first parameter for the command TestCommand1.",
            Value: "10",
            Command: "TestCommand1",
            DataType: "U8",
            DefaultLowLimit: "0",
            DefaultValue: "5",
            DefaultHighLimit: "10",
            Direction: "MEMORY",
            Parameter: "TestParameter1",
          },
          {
            CommandSetDataID: 3,
            MemoryMapDataID: 2,
            LL: "0",
            HL: "20",
            Description: "This is the second parameter for the command TestCommand1.",
            Value: "10",
            Command: "TestCommand2",
            DataType: "string",
            DefaultLowLimit: "00000",
            DefaultValue: "AAAAA",
            DefaultHighLimit: "FFFFF",
            Direction: "OUTPUT",
            Parameter: "TestParameter3",
          },
        ]);
      });
    })
  );

  it(
    "Returns an empty array when there is no data for a given memory map id.",
    withContext({
      async run(ctx) {
        await ctx.repos.domain(async (domainRepos) => {
          const result = await domainRepos.memoryMapData.getAllMemoryMapData(9999999999999);
          expect(result).toBeDefined();
          expect(result).not.toBeNull();
          expect(result).toEqual([]);
        });
      },
    })
  );
});
