import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { GetMemoryMapDocument, GetMemoryMapQuery, GetMemoryMapQueryVariables } from "../../client/graphql/types.gen";
import { destroyAllConnections } from "modules/db";

afterAll(async () => {
  await destroyAllConnections();
});

describe("getMemoryMap Resolver Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns a memory map successfully when queried.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetMemoryMapQuery>({
          query: GetMemoryMapDocument,
          variables: {
            memoryMapName: "305-9999-999",
            bomRevision: "AAA",
            version: 1,
          } as GetMemoryMapQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getMemoryMap).toBeDefined();
        expect(queryResult.data.getMemoryMap).not.toBeNull();
      },
    })
  );

  it(
    "Returns null when a memory map is not found.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetMemoryMapQuery>({
          query: GetMemoryMapDocument,
          variables: {
            memoryMapName: "unfound memory map",
            bomRevision: "AAA",
            version: 1,
          } as GetMemoryMapQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getMemoryMap).toBeNull();
      },
    })
  );
});
