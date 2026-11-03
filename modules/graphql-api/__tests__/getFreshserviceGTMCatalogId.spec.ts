import { beforeEach, afterAll, describe, expect, it } from "vitest";
import { withContext } from "modules/__tests__/db-helpers";
import {
  FreshserviceCatalogOptions,
  GetFreshserviceGtmCatalogIdDocument,
  GetFreshserviceGtmCatalogIdQuery,
  GetFreshserviceGtmCatalogIdQueryVariables,
} from "../../client/graphql/types.gen";

const originalEnv = { ...process.env };

describe("getFreshserviceGTMCatalogId resolver", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it(
    "returns the configured catalog ID when the env var is provided",
    withContext({
      async run(ctx) {
        process.env.FRESHSERVICE_SOFTWARE_CATALOG_ID = "98765";

        const result = await ctx.apolloClient.query<GetFreshserviceGtmCatalogIdQuery>({
          query: GetFreshserviceGtmCatalogIdDocument,
          variables: {
            catalog: FreshserviceCatalogOptions.Software,
          } as GetFreshserviceGtmCatalogIdQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(result.data.getFreshserviceGTMCatalogId).toBe(98765);
      },
    })
  );

  it(
    "returns null when the catalog env var is missing",
    withContext({
      async run(ctx) {
        delete process.env.FRESHSERVICE_VISION_CATALOG_ID;

        const result = await ctx.apolloClient.query<GetFreshserviceGtmCatalogIdQuery>({
          query: GetFreshserviceGtmCatalogIdDocument,
          variables: {
            catalog: FreshserviceCatalogOptions.Vision,
          } as GetFreshserviceGtmCatalogIdQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(result.data.getFreshserviceGTMCatalogId).toBeNull();
      },
    })
  );

  it(
    "returns the configured electrical catalog ID when the env var is provided",
    withContext({
      async run(ctx) {
        process.env.FRESHSERVICE_ELECTRICAL_CATALOG_ID = "54321";

        const result = await ctx.apolloClient.query<GetFreshserviceGtmCatalogIdQuery>({
          query: GetFreshserviceGtmCatalogIdDocument,
          variables: {
            catalog: FreshserviceCatalogOptions.Electrical,
          } as GetFreshserviceGtmCatalogIdQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(result.data.getFreshserviceGTMCatalogId).toBe(54321);
      },
    })
  );

  it(
    "returns null when the catalog env var contains non-numeric value",
    withContext({
      async run(ctx) {
        process.env.FRESHSERVICE_SOFTWARE_CATALOG_ID = "invalid";

        const result = await ctx.apolloClient.query<GetFreshserviceGtmCatalogIdQuery>({
          query: GetFreshserviceGtmCatalogIdDocument,
          variables: {
            catalog: FreshserviceCatalogOptions.Software,
          } as GetFreshserviceGtmCatalogIdQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(result.data.getFreshserviceGTMCatalogId).toBeNull();
      },
    })
  );

  it(
    "returns null when the catalog env var is an empty string",
    withContext({
      async run(ctx) {
        process.env.FRESHSERVICE_VISION_CATALOG_ID = "";

        const result = await ctx.apolloClient.query<GetFreshserviceGtmCatalogIdQuery>({
          query: GetFreshserviceGtmCatalogIdDocument,
          variables: {
            catalog: FreshserviceCatalogOptions.Vision,
          } as GetFreshserviceGtmCatalogIdQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(result.data.getFreshserviceGTMCatalogId).toBeNull();
      },
    })
  );
});
