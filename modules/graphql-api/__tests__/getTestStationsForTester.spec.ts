import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import gql from "graphql-tag";
import { destroyAllConnections } from "modules/db";

const GET_TEST_STATIONS_FOR_TESTER_QUERY = gql`
  query GetTestStationsForTester($testerId: Int!) {
    getTestStationsForTester(testerId: $testerId)
  }
`;

afterAll(async () => {
  await destroyAllConnections();
});

describe("getTestStationsForTester Resolver Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns the seeded test station for the seeded tester.",
    withContext({
      async run(ctx) {
        const queryResult = await ctx.apolloClient.query<{
          getTestStationsForTester: Array<{
            ID: number;
            TesterID: number;
            StationName: string;
            Description: string;
          } | null>;
        }>({
          query: GET_TEST_STATIONS_FOR_TESTER_QUERY,
          variables: { testerId: 1 },
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getTestStationsForTester).toBeDefined();
        expect(queryResult.data.getTestStationsForTester).toEqual([
          {
            ID: 1,
            TesterID: 1,
            StationName: "TestStation",
            Description: "This is a station in a tester.",
          },
        ]);
      },
    })
  );

  it(
    "Returns multiple stations for a tester when more than one is registered.",
    withContext({
      async run(ctx) {
        await ctx.repos.domain(async (domainRepos) => {
          await domainRepos.testStations.insert({
            TesterID: 1,
            StationName: "SecondStation",
            Description: "A second station for the seeded tester.",
          });
        });

        const queryResult = await ctx.apolloClient.query<{
          getTestStationsForTester: Array<{ StationName: string; TesterID: number }>;
        }>({
          query: GET_TEST_STATIONS_FOR_TESTER_QUERY,
          variables: { testerId: 1 },
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getTestStationsForTester).toHaveLength(2);
        expect(queryResult.data.getTestStationsForTester.every((s) => s.TesterID === 1)).toBe(true);
        expect(queryResult.data.getTestStationsForTester.map((s) => s.StationName).sort()).toEqual([
          "SecondStation",
          "TestStation",
        ]);
      },
    })
  );

  it(
    "Returns an empty array for a tester that has no test stations.",
    withContext({
      async run(ctx) {
        const newTester = await ctx.repos.domain(async (domainRepos) => {
          return await domainRepos.testers.insert({
            TesterName: "TesterWithNoStations",
            Description: "Has no stations.",
          });
        });

        const queryResult = await ctx.apolloClient.query<{
          getTestStationsForTester: unknown[];
        }>({
          query: GET_TEST_STATIONS_FOR_TESTER_QUERY,
          variables: { testerId: newTester.ID },
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getTestStationsForTester).toEqual([]);
      },
    })
  );

  it(
    "Returns an empty array for a testerId that does not exist.",
    withContext({
      async run(ctx) {
        const queryResult = await ctx.apolloClient.query<{
          getTestStationsForTester: unknown[];
        }>({
          query: GET_TEST_STATIONS_FOR_TESTER_QUERY,
          variables: { testerId: 99999 },
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getTestStationsForTester).toEqual([]);
      },
    })
  );
});
