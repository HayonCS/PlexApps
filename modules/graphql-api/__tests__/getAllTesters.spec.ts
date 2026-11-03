import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import gql from "graphql-tag";
import { destroyAllConnections } from "modules/db";

const GET_ALL_TESTERS_QUERY = gql`
  query GetAllTesters {
    getAllTesters
  }
`;

afterAll(async () => {
  await destroyAllConnections();
});

describe("getAllTesters Resolver Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns the seeded testers from the database.",
    withContext({
      async run(ctx) {
        const queryResult = await ctx.apolloClient.query<{
          getAllTesters: Array<{ id: number; testerName: string; description: string; image: string | null } | null>;
        }>({
          query: GET_ALL_TESTERS_QUERY,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getAllTesters).toBeDefined();
        expect(queryResult.data.getAllTesters).not.toBeNull();
        expect(queryResult.data.getAllTesters).toEqual([
          {
            id: 1,
            testerName: "Tester",
            description: "This is a tester.",
            image: null,
          },
        ]);
      },
    })
  );

  it(
    "Returns testers added after the seed in addition to the seeded ones.",
    withContext({
      async run(ctx) {
        await ctx.repos.domain(async (domainRepos) => {
          await domainRepos.testers.insert({
            TesterName: "ExtraTester",
            Description: "Another tester",
          });
        });

        const queryResult = await ctx.apolloClient.query<{
          getAllTesters: Array<{ testerName: string; description: string }>;
        }>({
          query: GET_ALL_TESTERS_QUERY,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getAllTesters).toHaveLength(2);
        expect(queryResult.data.getAllTesters).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ testerName: "Tester", description: "This is a tester." }),
            expect.objectContaining({ testerName: "ExtraTester", description: "Another tester" }),
          ])
        );
      },
    })
  );

  it(
    "Returns an empty array when no testers exist.",
    withContext({
      async run(ctx) {
        await ctx.repos.domain(async (domainRepos) => {
          // The seed inserts operationsData rows that reference the seeded
          // TestStation, which references the seeded Tester. Clear the chain
          // so we can delete the testers without violating FKs.
          const domainDb = await ctx.domainDb();
          await domainDb("OperationsData").delete();
          await domainDb("TestStations").delete();
          await domainDb("Testers").delete();
          // Silence unused-var warning for domainRepos in this branch.
          void domainRepos;
        });

        const queryResult = await ctx.apolloClient.query<{
          getAllTesters: unknown[];
        }>({
          query: GET_ALL_TESTERS_QUERY,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getAllTesters).toEqual([]);
      },
    })
  );
});
