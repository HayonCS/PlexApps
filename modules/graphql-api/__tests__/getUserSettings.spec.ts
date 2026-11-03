import { withContext } from "modules/__tests__/db-helpers";
import {
  GetUserSettingsDocument,
  GetUserSettingsQuery,
  GetUserSettingsQueryVariables,
} from "../../client/graphql/types.gen";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { redisClear, redisSetupBeforeEach } from "modules/__tests__/redis-helpers";

describe("getUserSettings Resolver Test", () => {
  beforeEach(async () => {
    await redisSetupBeforeEach();
  });

  afterAll(async () => {
    await redisClear();
  });

  it(
    "Returns user settings when you query them.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetUserSettingsQuery>({
          query: GetUserSettingsDocument,
          variables: {
            userName: "bill.brasky",
          } as GetUserSettingsQueryVariables,
          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getUserSettings).toBeDefined();
        expect(queryResult.data.getUserSettings).not.toBeNull();
        expect(queryResult.data.getUserSettings).toEqual({
          DarkMode: {
            description: "Enables the Dark Mode app theme.",
            iconName: "dark_mode",
            label: "Dark Mode",
            settingType: "SwitchType",
            tooltip: "Enable Dark Mode.",
            value: false,
          },
          DefaultDisplayFormat: {
            description: "The default display format of the memory map grid.",
            iconName: "text_format",
            label: "Default Format",
            placeholder: "Format",
            selections: ["HEXADECIMAL", "BINARY", "ASCII", "DECIMAL"],
            settingType: "SelectType",
            tooltip: "Default Display Format.",
            value: "DECIMAL",
          },
        });
      },
    })
  );
});
