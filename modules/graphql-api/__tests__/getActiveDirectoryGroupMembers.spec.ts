import { withContext } from "modules/__tests__/db-helpers";
import {
  GetActiveDirectoryGroupMembersDocument,
  GetActiveDirectoryGroupMembersQuery,
  GetActiveDirectoryGroupMembersQueryVariables,
} from "../../client/graphql/types.gen";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const patrickStar = {
  distinguishedName: "CN=Star\\, Patrick,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
  principalName: "patrick.star@gentex.com",
  accountName: "patrick.star",
  employeeId: "42069",
  givenName: "Patrick",
  surname: "Star",
  name: "Star, Patrick",
  department: "Test and Measurement",
  email: "patrick.star@gentex.com",
  mobilePhone: "9895684589",
  phone: "+1 (616) 7721590 x2345",
  website: null,
  azureADObjectId: "e78908-61a1-4857-8c70-d0973334256e",
  objectId: "81b7c79a-atead-4bef-b9f5-fdd0e4796a6c",
  sid: "S-1-5-21-56231545-804616388-477645130-30460",
  pager: "19992",
  manager: "CN=Meyer\\, Oscar,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
};

describe("getActiveDirectoryGroupMembers Resolver Test", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      const decoded = decodeURIComponent(url);

      if (decoded.includes("/groups/OpsManager User/users")) {
        return new Response(JSON.stringify([patrickStar]), { headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(
    "Returns active directory group members when you query a group.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetActiveDirectoryGroupMembersQuery>({
          query: GetActiveDirectoryGroupMembersDocument,
          variables: {
            groupName: "OpsManager User",
          } as GetActiveDirectoryGroupMembersQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getActiveDirectoryGroupMembers).toBeDefined();
        expect(queryResult.data.getActiveDirectoryGroupMembers).not.toBeNull();
        expect(queryResult.data.getActiveDirectoryGroupMembers).toEqual([patrickStar]);
      },
    })
  );

  it(
    "Doesn't return anything when nothing matches.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetActiveDirectoryGroupMembersQuery>({
          query: GetActiveDirectoryGroupMembersDocument,
          variables: {
            groupName: "This group shouldn't be found",
          } as GetActiveDirectoryGroupMembersQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getActiveDirectoryGroupMembers).toBeDefined();
        expect(queryResult.data.getActiveDirectoryGroupMembers).not.toBeNull();
        expect(queryResult.data.getActiveDirectoryGroupMembers).toEqual([]);
      },
    })
  );
});
