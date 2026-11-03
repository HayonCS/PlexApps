import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { GetAllMemoryMapsDocument, GetAllMemoryMapsQuery } from "../../client/graphql/types.gen";
import { destroyAllConnections } from "modules/db";

afterAll(async () => {
  await destroyAllConnections();
});

describe("getAllMemoryMaps Resolver Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns all of the memory maps available in the database.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetAllMemoryMapsQuery>({
          query: GetAllMemoryMapsDocument,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getAllMemoryMaps).toBeDefined();
        expect(queryResult.data.getAllMemoryMaps).not.toBeNull();
        expect(queryResult.data.getAllMemoryMaps).toEqual([
          {
            PartNumber: "305-1111-999",
            Description: "This is a memory map used for testing.",
            BOMRevision: "AAA",
            InternalRevision: 1,
            ID: 2,
            FirmwareID: null,
            CommandSetID: 1,
            AncestorID: null,
            IsWorkingCopy: false,
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
            IsWorkingCopy: true,
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
            IsWorkingCopy: true,
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
            IsWorkingCopy: true,
          },
        ]);
      },
    })
  );
});
