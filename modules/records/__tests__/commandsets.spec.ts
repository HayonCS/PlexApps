import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { beforeEach, describe, expect, it } from "vitest";

describe("CommandSet Record Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns commandset information for a given memory map.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.commandSets.getCommandSetForMemoryMap(1);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();

        expect(result).toEqual([
          {
            Name: "Test Commandset",
            Version: 12345,
            Description: "This is a commandset used for testing.",
            FilePath: "Test_Commandset.cmdset",
          },
        ]);
      });
    })
  );
});
