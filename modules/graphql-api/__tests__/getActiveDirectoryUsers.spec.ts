import { withContext } from "modules/__tests__/db-helpers";
import {
  GetActiveDirectoryUsersDocument,
  GetActiveDirectoryUsersQuery,
  GetActiveDirectoryUsersQueryVariables,
} from "../../client/graphql/types.gen";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const billBrasky = {
  distinguishedName: "CN=Brasky\\, Bill,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
  principalName: "bill.brasky@gentex.com",
  accountName: "bill.brasky",
  employeeId: "69",
  givenName: "Bill",
  surname: "Brasky",
  name: "Brasky, Bill",
  department: "Test and Measurement",
  email: "bill.brasky@gentex.com",
  mobilePhone: "9895684589",
  phone: "+1 (616) 7721590 x2345",
  website: null,
  azureADObjectId: "e78908-61a1-4857-8c70-d0973334256e",
  objectId: "81b7c79a-atead-4bef-b9f5-fdd0e4796a6c",
  sid: "S-1-5-21-56231545-804616388-477645130-30460",
  pager: "19992",
  manager: "CN=Meyer\\, Oscar,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
};

const johnSmith = {
  distinguishedName: "CN=Smith\\, John,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
  principalName: "john.smith@gentex.com",
  accountName: "john.smith",
  employeeId: "12345",
  givenName: "John",
  surname: "Smith",
  name: "Smith, John",
  department: "Test and Measurement",
  email: "john.smith@gentex.com",
  mobilePhone: "9895684589",
  phone: "+1 (616) 7721590 x2345",
  website: null,
  azureADObjectId: "e78908-61a1-4857-8c70-d0973334256e",
  objectId: "81b7c79a-atead-4bef-b9f5-fdd0e4796a6c",
  sid: "S-1-5-21-56231545-804616388-477645130-30460",
  pager: "19992",
  manager: "CN=Meyer\\, Oscar,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
};

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

describe("getActiveDirectoryUsers Resolver Test", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      const searchValue = new URL(url).searchParams.get("search");

      if (searchValue === "bill.brasky") {
        return new Response(JSON.stringify([billBrasky]), { headers: { "Content-Type": "application/json" } });
      }

      if (searchValue === "gentex.com") {
        return new Response(JSON.stringify([johnSmith, billBrasky, patrickStar]), {
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(
    "Returns an active directory user when you query one.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetActiveDirectoryUsersQuery>({
          query: GetActiveDirectoryUsersDocument,
          variables: {
            searchString: "bill.brasky",
          } as GetActiveDirectoryUsersQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getActiveDirectoryUsers).toBeDefined();
        expect(queryResult.data.getActiveDirectoryUsers).not.toBeNull();
        expect(queryResult.data.getActiveDirectoryUsers).toEqual([billBrasky]);
      },
    })
  );

  it(
    "Returns multiple when you make a broad query.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetActiveDirectoryUsersQuery>({
          query: GetActiveDirectoryUsersDocument,
          variables: {
            searchString: "gentex.com",
          } as GetActiveDirectoryUsersQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getActiveDirectoryUsers).toBeDefined();
        expect(queryResult.data.getActiveDirectoryUsers).not.toBeNull();
        expect(queryResult.data.getActiveDirectoryUsers).toEqual([johnSmith, billBrasky, patrickStar]);
      },
    })
  );

  it(
    "Doesn't return anything when nothing matches.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetActiveDirectoryUsersQuery>({
          query: GetActiveDirectoryUsersDocument,
          variables: {
            searchString: "This search term shouldn't match anything.",
          } as GetActiveDirectoryUsersQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getActiveDirectoryUsers).toBeDefined();
        expect(queryResult.data.getActiveDirectoryUsers).not.toBeNull();
        expect(queryResult.data.getActiveDirectoryUsers).toEqual([]);
      },
    })
  );
});
