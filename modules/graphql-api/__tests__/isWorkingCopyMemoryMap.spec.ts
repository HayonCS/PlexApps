import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  IsWorkingCopyMemoryMapDocument,
  IsWorkingCopyMemoryMapQuery,
  IsWorkingCopyMemoryMapQueryVariables,
} from "../../client/graphql/types.gen";
import { destroyAllConnections } from "modules/db";

afterAll(async () => {
  await destroyAllConnections();
});

describe("isWorkingCopy Resolver Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns true when a memory map is the working copy.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<IsWorkingCopyMemoryMapQuery>({
          query: IsWorkingCopyMemoryMapDocument,
          variables: {
            memoryMapName: "305-9999-999",
            bomRevision: "AAA",
            version: 1,
          } as IsWorkingCopyMemoryMapQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.isWorkingCopyMemoryMap).toBeDefined();
        expect(queryResult.data.isWorkingCopyMemoryMap).not.toBeNull();
        expect(queryResult.data.isWorkingCopyMemoryMap).toBeTruthy();
      },
    })
  );

  it(
    "Returns false when a memory map is not the working copy.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<IsWorkingCopyMemoryMapQuery>({
          query: IsWorkingCopyMemoryMapDocument,
          variables: {
            memoryMapName: "305-1111-999",
            bomRevision: "AAA",
            version: 1,
          } as IsWorkingCopyMemoryMapQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.isWorkingCopyMemoryMap).toBeDefined();
        expect(queryResult.data.isWorkingCopyMemoryMap).not.toBeNull();
        expect(queryResult.data.isWorkingCopyMemoryMap).toBeFalsy();
      },
    })
  );
});
