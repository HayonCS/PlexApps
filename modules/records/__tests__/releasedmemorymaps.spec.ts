import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { beforeEach, describe, expect, it } from "vitest";

describe("ReleasedMemoryMaps Record Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Allows you to check if a given memory map at a bomRevision and version is released or not.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.releasedMemoryMaps.isMemoryMapReleased("305-1111-999", "BBB", 2);
        expect(result).toBeFalsy();

        const result2 = await domainRepos.releasedMemoryMaps.isMemoryMapReleased("305-9999-999", "AAA", 1);
        expect(result2).toBeTruthy();
      });
    })
  );

  it(
    "Allows you to retrieve the information for a released memory map.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.releasedMemoryMaps.getReleasedMemoryMapInformation("305-9999-999", "AAA", 1);

        expect(result).toBeDefined();
        expect(result?.memoryMapName).toEqual("305-9999-999");
        expect(result?.bomRevision).toEqual("AAA");
        expect(result?.version).toEqual(1);
        expect(result?.ecNumber).toEqual("12345");
        expect(result?.logMessage).toEqual("Dang ole' release man.");
        expect(result?.effectivityDate).toEqual("2022-07-21T15:07:13.000Z");
        expect(result?.dateTimeStamp).toEqual("2022-07-21T15:07:13.000Z");
      });
    })
  );
});
