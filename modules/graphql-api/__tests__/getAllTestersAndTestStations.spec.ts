import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import gql from "graphql-tag";
import { destroyAllConnections } from "modules/db";

const GET_ALL_TESTERS_AND_TEST_STATIONS_QUERY = gql`
  query GetAllTestersAndTestStations {
    getAllTestersAndTestStations
  }
`;

interface TesterWithStationsResponse {
  testerName: string;
  description: string;
  image: string | null;
  testStations: Array<{ stationName: string; description: string }>;
}

afterAll(async () => {
  await destroyAllConnections();
});

describe("getAllTestersAndTestStations Resolver Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns the seeded tester with its associated test station nested under it.",
    withContext({
      async run(ctx) {
        const queryResult = await ctx.apolloClient.query<{
          getAllTestersAndTestStations: Array<TesterWithStationsResponse | null>;
        }>({
          query: GET_ALL_TESTERS_AND_TEST_STATIONS_QUERY,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getAllTestersAndTestStations).toBeDefined();
        expect(queryResult.data.getAllTestersAndTestStations).toEqual([
          {
            testerName: "Tester",
            description: "This is a tester.",
            image: null,
            testStations: [
              {
                stationName: "TestStation",
                description: "This is a station in a tester.",
              },
            ],
          },
        ]);
      },
    })
  );

  it(
    "Includes additional testers and groups each tester's stations under it.",
    withContext({
      async run(ctx) {
        await ctx.repos.domain(async (domainRepos) => {
          const extraTester = await domainRepos.testers.insert({
            TesterName: "ExtraTester",
            Description: "Another tester",
          });
          await domainRepos.testStations.insert({
            TesterID: extraTester.ID,
            StationName: "ExtraStation1",
            Description: "First extra station",
          });
          await domainRepos.testStations.insert({
            TesterID: extraTester.ID,
            StationName: "ExtraStation2",
            Description: "Second extra station",
          });
        });

        const queryResult = await ctx.apolloClient.query<{
          getAllTestersAndTestStations: Array<TesterWithStationsResponse>;
        }>({
          query: GET_ALL_TESTERS_AND_TEST_STATIONS_QUERY,
          fetchPolicy: "no-cache",
        });

        const result = queryResult.data.getAllTestersAndTestStations;
        expect(result).toHaveLength(2);

        const seeded = result.find((t) => t.testerName === "Tester");
        const extra = result.find((t) => t.testerName === "ExtraTester");

        expect(seeded?.testStations).toEqual([
          { stationName: "TestStation", description: "This is a station in a tester." },
        ]);

        expect(extra?.description).toBe("Another tester");
        expect(extra?.testStations).toHaveLength(2);
        expect(extra?.testStations.map((s) => s.stationName).sort()).toEqual(["ExtraStation1", "ExtraStation2"]);
      },
    })
  );

  it(
    "Returns testers with empty testStations arrays when they have no stations.",
    withContext({
      async run(ctx) {
        await ctx.repos.domain(async (domainRepos) => {
          await domainRepos.testers.insert({
            TesterName: "LonelyTester",
            Description: "No stations here",
          });
        });

        const queryResult = await ctx.apolloClient.query<{
          getAllTestersAndTestStations: Array<TesterWithStationsResponse>;
        }>({
          query: GET_ALL_TESTERS_AND_TEST_STATIONS_QUERY,
          fetchPolicy: "no-cache",
        });

        const lonely = queryResult.data.getAllTestersAndTestStations.find((t) => t.testerName === "LonelyTester");
        expect(lonely).toBeDefined();
        expect(lonely?.testStations).toEqual([]);
      },
    })
  );

  it(
    "Returns an empty array when no testers exist in the database.",
    withContext({
      async run(ctx) {
        const domainDb = await ctx.domainDb();
        await domainDb("OperationsData").delete();
        await domainDb("TestStations").delete();
        await domainDb("Testers").delete();

        const queryResult = await ctx.apolloClient.query<{
          getAllTestersAndTestStations: unknown[];
        }>({
          query: GET_ALL_TESTERS_AND_TEST_STATIONS_QUERY,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getAllTestersAndTestStations).toEqual([]);
      },
    })
  );
});
