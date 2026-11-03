import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { beforeEach, describe, expect, it } from "vitest";

describe("PartNumbers Record Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns part numbers for a given memory map.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.partNumbers.getPartNumbersForMemoryMap("305-9999-999", "AAA", 1);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result).toEqual([
          {
            PartNumber: "605-0000-000",
            Description: "This is a part number for testing.",
            MemoryMapID: 1,
            ID: 1,
          },
          {
            PartNumber: "705-1111-000",
            Description: "This is a part number for testing.",
            MemoryMapID: 1,
            ID: 2,
          },
          {
            PartNumber: "905-1200-000",
            Description: "This is a part number for testing.",
            MemoryMapID: 1,
            ID: 3,
          },
        ]);
      });
    })
  );

  it(
    "Returns part numbers values for a given memory map.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.partNumbers.getPartNumberValuesByMemoryMap("305-9999-999", "AAA", 1);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result).toEqual([
          {
            PartNumber: "605-0000-000",
            BOMRevision: "AAA",
            ParentPartNumberID: null,
            Description: "This is a part number for testing.",
            MemoryMapID: 1,
            ID: 1,
            PartNumberValue: "Testing",
          },
          {
            PartNumber: "705-1111-000",
            BOMRevision: "AAA",
            ParentPartNumberID: null,
            Description: "This is a part number for testing.",
            MemoryMapID: 1,
            ID: 2,
            PartNumberValue: "BlahBlah",
          },
          {
            PartNumber: "905-1200-000",
            BOMRevision: "AAA",
            ParentPartNumberID: null,
            Description: "This is a part number for testing.",
            MemoryMapID: 1,
            ID: 3,
            PartNumberValue: "Tim Apple",
          },
          {
            PartNumber: "605-0000-000",
            BOMRevision: "AAA",
            ParentPartNumberID: null,
            Description: "This is a part number for testing.",
            MemoryMapID: 1,
            ID: 1,
            PartNumberValue: "Testing2",
          },
          {
            PartNumber: "705-1111-000",
            BOMRevision: "AAA",
            ParentPartNumberID: null,
            Description: "This is a part number for testing.",
            MemoryMapID: 1,
            ID: 2,
            PartNumberValue: "HankHill is the password.",
          },
          {
            PartNumber: "905-1200-000",
            BOMRevision: "AAA",
            ParentPartNumberID: null,
            Description: "This is a part number for testing.",
            MemoryMapID: 1,
            ID: 3,
            PartNumberValue: "Today is Wednesday.",
          },
        ]);
      });
    })
  );

  it(
    "Returns part numbers values for a given memory map by memory map and partnumber id.",
    {},
    withContext(async (ctx) => {
      await ctx.repos.domain(async (domainRepos) => {
        const result = await domainRepos.partNumbers.getPartNumberValuesByMemoryMapIDAndPartNumberID(1, 1);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result).toEqual([
          {
            PartNumber: "605-0000-000",
            ID: 1,
            PartNumberValue: "Testing",
            Parameter: "TestParameter1",
            Command: "TestCommand1",
          },
          {
            PartNumber: "605-0000-000",
            ID: 1,
            PartNumberValue: "Testing2",
            Parameter: "TestParameter3",
            Command: "TestCommand2",
          },
        ]);

        const result2 = await domainRepos.partNumbers.getPartNumberValuesByMemoryMapIDAndPartNumberID(1, 2);

        expect(result2).toBeDefined();
        expect(result2).not.toBeNull();
        expect(result2).toEqual([
          {
            PartNumber: "705-1111-000",
            ID: 2,
            PartNumberValue: "BlahBlah",
            Parameter: "TestParameter1",
            Command: "TestCommand1",
          },
          {
            PartNumber: "705-1111-000",
            ID: 2,
            PartNumberValue: "HankHill is the password.",
            Parameter: "TestParameter3",
            Command: "TestCommand2",
          },
        ]);
      });
    })
  );
});
