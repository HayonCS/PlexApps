import { withContext } from "modules/__tests__/db-helpers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GetEmployeePictureDocument,
  GetEmployeePictureQuery,
  GetEmployeePictureQueryVariables,
} from "../../client/graphql/types.gen";
import { USER_PICTURE_FOR_TESTS } from "modules/client/test-helpers/mocks/employee-picture-mocks";

describe("getEmployeePicture Resolver Tests", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      const base64 = USER_PICTURE_FOR_TESTS.replace("data:image/jpeg;base64, ", "");
      const bytes = Buffer.from(base64, "base64");
      return new Response(bytes, { headers: { "Content-Type": "image/jpeg" } });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(
    "Returns the correct employee picture in a base64 format string when requested.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetEmployeePictureQuery>({
          query: GetEmployeePictureDocument,
          variables: {
            employeeNumber: 13245,
          } as GetEmployeePictureQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getEmployeePicture).toBeDefined();
        expect(queryResult.data.getEmployeePicture).not.toBeNull();
        expect(queryResult.data.getEmployeePicture).toEqual(USER_PICTURE_FOR_TESTS);
      },
    })
  );
});
