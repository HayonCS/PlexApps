import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { beforeEach, describe, expect, it } from "vitest";

describe("OperationsData Record Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns operations for a given command in the memory map.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.operationsData.getOperationsForCommand(1);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result).toEqual([
          {
            MemoryMapDataID: 1,
            Command: "TestCommand1",
            StationName: "TestStation",
            Operation: "OP_WRITE",
          },
        ]);
      });
    })
  );

  it(
    "Returns all operation data for a given memory map.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.operationsData.getMemoryMapOperationsData("305-9999-999", "AAA", 1);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result).toEqual([
          {
            stationName: "teststation",
            operationName: "OP_VERIFY",
            commandName: "TestCommand2",
            testerName: "tester",
          },
          {
            stationName: "teststation",
            operationName: "OP_WRITE",
            commandName: "TestCommand1",
            testerName: "tester",
          },
        ]);
      });
    })
  );
});
