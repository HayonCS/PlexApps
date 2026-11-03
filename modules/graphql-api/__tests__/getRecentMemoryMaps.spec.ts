import { withContext } from "modules/__tests__/db-helpers";
import {
  ClearRecentMemoryMapsDocument,
  ClearRecentMemoryMapsMutation,
  ClearRecentMemoryMapsMutationVariables,
  GetRecentMemoryMapsDocument,
  GetRecentMemoryMapsQuery,
  GetRecentMemoryMapsQueryVariables,
  SaveRecentMemoryMapDocument,
  SaveRecentMemoryMapMutation,
  SaveRecentMemoryMapMutationVariables,
} from "../../client/graphql/types.gen";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { redisClear, redisSetupBeforeEach } from "modules/__tests__/redis-helpers";

describe("getRecentMemoryMaps Resolver Test", () => {
  beforeEach(async () => {
    await redisSetupBeforeEach();
  });

  afterAll(async () => {
    await redisClear();
  });

  it(
    "Returns the recent memory maps when you query them.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetRecentMemoryMapsQuery>({
          query: GetRecentMemoryMapsDocument,
          variables: {
            userName: "bill.brasky",
          } as GetRecentMemoryMapsQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getRecentMemoryMaps.recentMemoryMaps).toBeDefined();
        expect(queryResult.data.getRecentMemoryMaps.recentMemoryMaps).not.toBeNull();
        expect(queryResult.data.getRecentMemoryMaps.recentMemoryMaps).toEqual([
          {
            __typename: "RecentMemoryMap",
            bomRevision: "CCC",
            memoryMapName: "305-1234-000",
            version: 4,
            lastAccessed: "2025-14-11T6:00:00Z",
          },
          {
            __typename: "RecentMemoryMap",
            bomRevision: "BBA",
            memoryMapName: "305-1111-000",
            version: 3,
            lastAccessed: "2025-14-11T3:00:00Z",
          },
          {
            __typename: "RecentMemoryMap",
            bomRevision: "BBB",
            memoryMapName: "305-0195-000",
            version: 4,
            lastAccessed: "2025-14-11T12:00:00Z",
          },
        ]);
      },
    })
  );

  it(
    "Adds a recent memory map when you open a new memory map.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetRecentMemoryMapsQuery>({
          query: GetRecentMemoryMapsDocument,
          variables: {
            userName: "bill.brasky",
          },
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getRecentMemoryMaps.recentMemoryMaps).toBeDefined();
        expect(queryResult.data.getRecentMemoryMaps.recentMemoryMaps).not.toBeNull();
        expect(queryResult.data.getRecentMemoryMaps.recentMemoryMaps).toEqual([
          {
            __typename: "RecentMemoryMap",
            bomRevision: "CCC",
            memoryMapName: "305-1234-000",
            version: 4,
            lastAccessed: "2025-14-11T6:00:00Z",
          },
          {
            __typename: "RecentMemoryMap",
            bomRevision: "BBA",
            memoryMapName: "305-1111-000",
            version: 3,
            lastAccessed: "2025-14-11T3:00:00Z",
          },
          {
            __typename: "RecentMemoryMap",
            bomRevision: "BBB",
            memoryMapName: "305-0195-000",
            version: 4,
            lastAccessed: "2025-14-11T12:00:00Z",
          },
        ]);

        let mutateResult = await ctx.apolloClient.mutate<SaveRecentMemoryMapMutation>({
          mutation: SaveRecentMemoryMapDocument,
          variables: {
            userName: "bill.brasky",
            memoryMapName: "305-6666-000",
            bomRevision: "BBB",
            version: 1,
            lastAccessed: "2025-15-11T12:00:00Z",
          } as SaveRecentMemoryMapMutationVariables,
        });

        expect(mutateResult.data?.saveRecentMemoryMap.recentMemoryMaps).toBeDefined();
        expect(mutateResult.data?.saveRecentMemoryMap.recentMemoryMaps).not.toBeNull();
        expect(mutateResult.data?.saveRecentMemoryMap.recentMemoryMaps).toEqual([
          {
            __typename: "RecentMemoryMap",
            bomRevision: "BBB",
            memoryMapName: "305-6666-000",
            version: 1,
          },
          {
            __typename: "RecentMemoryMap",
            bomRevision: "CCC",
            memoryMapName: "305-1234-000",
            version: 4,
          },
          {
            __typename: "RecentMemoryMap",
            bomRevision: "BBA",
            memoryMapName: "305-1111-000",
            version: 3,
          },
          {
            __typename: "RecentMemoryMap",
            bomRevision: "BBB",
            memoryMapName: "305-0195-000",
            version: 4,
          },
        ]);
      },
    })
  );

  it(
    "Clears all recent memory maps for a user.",
    withContext({
      async run(ctx) {
        // First verify the user has recent memory maps
        let queryResult = await ctx.apolloClient.query<GetRecentMemoryMapsQuery>({
          query: GetRecentMemoryMapsDocument,
          variables: {
            userName: "bill.brasky",
          },
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getRecentMemoryMaps.recentMemoryMaps).toBeDefined();
        expect(queryResult.data.getRecentMemoryMaps.recentMemoryMaps.length).toBeGreaterThan(0);

        // Clear the recent memory maps
        let mutateResult = await ctx.apolloClient.mutate<ClearRecentMemoryMapsMutation>({
          mutation: ClearRecentMemoryMapsDocument,
          variables: {
            userName: "bill.brasky",
          } as ClearRecentMemoryMapsMutationVariables,
        });

        expect(mutateResult.data?.clearRecentMemoryMaps).toBe(true);

        // Verify the recent memory maps are now empty
        queryResult = await ctx.apolloClient.query<GetRecentMemoryMapsQuery>({
          query: GetRecentMemoryMapsDocument,
          variables: {
            userName: "bill.brasky",
          },
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getRecentMemoryMaps.recentMemoryMaps).toBeDefined();
        expect(queryResult.data.getRecentMemoryMaps.recentMemoryMaps).toEqual([]);
      },
    })
  );
});
