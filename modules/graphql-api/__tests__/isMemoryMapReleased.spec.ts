import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  IsMemoryMapReleasedDocument,
  IsMemoryMapReleasedQuery,
  IsMemoryMapReleasedQueryVariables,
} from "../../client/graphql/types.gen";
import { destroyAllConnections } from "modules/db";

afterAll(async () => {
  await destroyAllConnections();
});

describe("isMemoryMapReleased Resolver Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns true when a memory map is released for production use.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<IsMemoryMapReleasedQuery>({
          query: IsMemoryMapReleasedDocument,
          variables: {
            memoryMapName: "305-9999-999",
            bomRevision: "AAA",
            version: 1,
          } as IsMemoryMapReleasedQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.isMemoryMapReleased).toBeDefined();
        expect(queryResult.data.isMemoryMapReleased).not.toBeNull();
        expect(queryResult.data.isMemoryMapReleased).toBeTruthy();
      },
    })
  );

  it(
    "Returns false when a memory map is not released for production use.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<IsMemoryMapReleasedQuery>({
          query: IsMemoryMapReleasedDocument,
          variables: {
            memoryMapName: "305-1111-999",
            bomRevision: "AAA",
            version: 2,
          } as IsMemoryMapReleasedQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.isMemoryMapReleased).toBeDefined();
        expect(queryResult.data.isMemoryMapReleased).not.toBeNull();
        expect(queryResult.data.isMemoryMapReleased).toBeFalsy();
      },
    })
  );
});
