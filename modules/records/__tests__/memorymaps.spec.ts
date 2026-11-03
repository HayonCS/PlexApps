import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { beforeEach, describe, expect, it } from "vitest";

describe("MemoryMap Record Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns all of the memory maps in the database.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.memoryMaps.getAllMemoryMaps();

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result).toEqual([
          {
            PartNumber: "305-1111-999",
            Description: "This is a memory map used for testing.",
            BOMRevision: "AAA",
            InternalRevision: 1,
            ID: 2,
            FirmwareID: null,
            CommandSetID: 1,
            AncestorID: null,
          },
          {
            PartNumber: "305-1111-999",
            Description: "This is a memory map used for testing.",
            BOMRevision: "AAA",
            InternalRevision: 2,
            ID: 3,
            FirmwareID: null,
            CommandSetID: 1,
            AncestorID: null,
          },
          {
            PartNumber: "305-1234-999",
            Description: "This is a memory map used for testing as well.",
            BOMRevision: "BBB",
            InternalRevision: 2,
            ID: 4,
            FirmwareID: null,
            CommandSetID: 1,
            AncestorID: null,
          },
          {
            PartNumber: "305-9999-999",
            Description: "This is a memory map used for testing.",
            BOMRevision: "AAA",
            InternalRevision: 1,
            ID: 1,
            FirmwareID: null,
            CommandSetID: 1,
            AncestorID: null,
          },
        ]);
      });
    })
  );

  it(
    "Returns the correct memory map id.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.memoryMaps.getMemoryMapID("305-9999-999", "AAA", 1);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result).toEqual(1);
      });
    })
  );

  it(
    "Returns all of the commands for a given memory map.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.memoryMaps.getMemoryMapCommands("305-9999-999", "AAA", 1);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result).toEqual([{ Command: "TestCommand1" }, { Command: "TestCommand2" }]);

        const result2 = await domainRepos.memoryMaps.getMemoryMapCommands("305-1200-999", "BBB", 1);

        expect(result2).toBeDefined();
        expect(result2).not.toBeNull();
        expect(result2).toEqual([]);
      });
    })
  );

  it(
    "Allows you to check if a memory map at a given bomRevision and version is the working copy or not.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const isWorkingCopy = await domainRepos.memoryMaps.isWorkingCopy("305-9999-999", "AAA", 1);
        expect(isWorkingCopy).toBeTruthy();

        const isWorkingCopy2 = await domainRepos.memoryMaps.isWorkingCopy("305-1111-999", "BBB", 1);
        expect(isWorkingCopy2).toBeFalsy();
      });
    })
  );
});
