import { withContext } from "modules/__tests__/db-helpers";
import { beforeAll, describe, expect, it } from "vitest";
import { GetAllCommandSetsDocument, GetAllCommandSetsQuery } from "../../client/graphql/types.gen";
import { setupSubversionRepo } from "modules/__tests__/subversion-helpers";
import { SubversionSuffixPort } from "modules/context/ports";

describe("getAllCommandSets Resolver Tests", () => {
  beforeAll(
    withContext({
      async run(ctx) {
        const svnSuffix = await ctx.get(SubversionSuffixPort);
        await setupSubversionRepo(svnSuffix);
      },
    })
  );

  it(
    "Returns all of the commandsets available in the svn repository.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetAllCommandSetsQuery>({
          query: GetAllCommandSetsDocument,

          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getAllCommandSets).toBeDefined();
        expect(queryResult.data.getAllCommandSets).not.toBeNull();
        expect(queryResult.data.getAllCommandSets).toEqual(["1845_BMW_Project_2021.cmdset"]);
      },
    })
  );
});
