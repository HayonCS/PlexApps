import { withContext } from "modules/__tests__/db-helpers";
import {
  GetActiveDirectoryUserDocument,
  GetActiveDirectoryUserQuery,
  GetActiveDirectoryUserQueryVariables,
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

describe("getActiveDirectoryUser Resolver Test", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.endsWith("/users/bill.brasky")) {
        return new Response(JSON.stringify(billBrasky), { headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({}), { headers: { "Content-Type": "application/json" } });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(
    "Returns an active directory user when you query one.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetActiveDirectoryUserQuery>({
          query: GetActiveDirectoryUserDocument,
          variables: {
            searchString: "bill.brasky",
          } as GetActiveDirectoryUserQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getActiveDirectoryUser).toBeDefined();
        expect(queryResult.data.getActiveDirectoryUser).not.toBeNull();
        expect(queryResult.data.getActiveDirectoryUser).toEqual(billBrasky);
      },
    })
  );

  it(
    "Doesn't return anything when multiple users match.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetActiveDirectoryUserQuery>({
          query: GetActiveDirectoryUserDocument,
          variables: {
            searchString: "gentex.com",
          } as GetActiveDirectoryUsersQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getActiveDirectoryUser).toBeDefined();
        expect(queryResult.data.getActiveDirectoryUser).not.toBeNull();
        expect(queryResult.data.getActiveDirectoryUser).toEqual({});
      },
    })
  );

  it(
    "Doesn't return anything when nothing matches.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetActiveDirectoryUserQuery>({
          query: GetActiveDirectoryUserDocument,
          variables: {
            searchString: "This search term shouldn't match anything.",
          } as GetActiveDirectoryUsersQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getActiveDirectoryUser).toBeDefined();
        expect(queryResult.data.getActiveDirectoryUser).not.toBeNull();
        expect(queryResult.data.getActiveDirectoryUser).toEqual({});
      },
    })
  );
});
