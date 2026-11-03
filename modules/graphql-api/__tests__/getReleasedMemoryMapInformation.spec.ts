import { setupTestDatabase, withContext } from "modules/__tests__/db-helpers";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  GetReleasedMemoryMapInformationDocument,
  GetReleasedMemoryMapInformationQuery,
  GetReleasedMemoryMapInformationQueryVariables,
} from "../../client/graphql/types.gen";
import { destroyAllConnections } from "modules/db";
import { toIsoDateTime } from "modules/core/date-time-iso";

afterAll(async () => {
  await destroyAllConnections();
});

describe("getReleasedMemoryMapInformation Resolver Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it(
    "Returns the correct information when a memory map is released for production use.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetReleasedMemoryMapInformationQuery>({
          query: GetReleasedMemoryMapInformationDocument,
          variables: {
            memoryMapName: "305-9999-999",
            bomRevision: "AAA",
            version: 1,
          } as GetReleasedMemoryMapInformationQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getReleasedMemoryMapInformation).toBeDefined();
        expect(queryResult.data.getReleasedMemoryMapInformation).toEqual({
          __typename: "ReleasedMemoryMap",
          bomRevision: "AAA",
          dateTimeStamp: toIsoDateTime("2022-07-21T15:07:13.717Z"),
          ecNumber: "12345",
          effectivityDate: toIsoDateTime("2022-07-21T15:07:13.717Z"),
          logMessage: "Dang ole' release man.",
          memoryMapName: "305-9999-999",
          version: "1",
        });
      },
    })
  );

  it(
    "Returns null when a memory map is not released for production use.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetReleasedMemoryMapInformationQuery>({
          query: GetReleasedMemoryMapInformationDocument,
          variables: {
            memoryMapName: "305-1111-999",
            bomRevision: "AAA",
            version: 2,
          } as GetReleasedMemoryMapInformationQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getReleasedMemoryMapInformation).toBeDefined();
        expect(queryResult.data.getReleasedMemoryMapInformation).toBeNull();
        expect(queryResult.data.getReleasedMemoryMapInformation).toBeFalsy();
      },
    })
  );
});
