import { expect, Page } from "playwright/test";

export const BASE_URL = "http://localhost:3000";

type GraphqlPayload = {
  operationName?: string;
  variables?: Record<string, unknown>;
};

const commandSetFileName = "1845_BMW_Project_2021.cmdset";
const commandSetRevision = 52497;

const commandSetDocument = {
  commands: {
    AssemblyPartNumber: { parameters: { partNumber: { type: "U16", direction: "MEMORY" } } },
    GentexSpecificSerialNumber: { parameters: { serialNumber: { type: "U8[8]", direction: "MEMORY" } } },
    MfgOpsManagerPartNumber: {
      parameters: {
        major: { type: "U16", direction: "MEMORY" },
        minor: { type: "U8", direction: "MEMORY" },
        revision: { type: "U8[3]", direction: "MEMORY" },
        version: { type: "U8", direction: "MEMORY" },
      },
    },
    AgcOverrideSetting: { parameters: { setting: { type: "U8", direction: "MEMORY" } } },
  },
  metadata: {
    name: commandSetFileName,
    revision: commandSetRevision,
    description: "1845 BMW Project 2021",
  },
};

const buildMemoryMap = (version: number, bomRevision: string, name: string) => ({
  name,
  bomRevision,
  version,
  isWorkingCopy: version !== 1,
  commandset: {
    fileName: commandSetFileName,
    revision: commandSetRevision,
    description: "1845 BMW Project 2021",
  },
  commands: {
    AssemblyPartNumber: {
      parameters: {
        partNumber: {
          direction: "MEMORY",
          lowLimit: "0",
          value: "0",
          highLimit: "65535",
        },
      },
    },
    GentexSpecificSerialNumber: {
      parameters: {
        serialNumber: {
          direction: "MEMORY",
          lowLimit: "0 0 0 0 0 0 0 0",
          value: "0 0 0 0 0 0 0 0",
          highLimit: "255 255 255 255 255 255 255 255",
        },
      },
    },
    MfgOpsManagerPartNumber: {
      parameters: {
        major: { direction: "MEMORY", lowLimit: "0", value: "0", highLimit: "65535" },
        minor: { direction: "MEMORY", lowLimit: "0", value: "0", highLimit: "255" },
        revision: { direction: "MEMORY", lowLimit: "0 0 0", value: "0 0 0", highLimit: "255 255 255" },
        version: { direction: "MEMORY", lowLimit: "0", value: "0", highLimit: "255" },
      },
    },
    AgcOverrideSetting: {
      parameters: {
        setting: {
          direction: "MEMORY",
          lowLimit: "0",
          value: "236",
          highLimit: "255",
        },
      },
    },
  },
  testers: {
    Eol: {
      EOL: {
        AssemblyPartNumber: "OP_VERIFY",
        MfgOpsManagerPartNumber: "OP_VERIFY",
      },
    },
    Helm: {
      HELM: {
        AssemblyPartNumber: "OP_WRITE",
        MfgOpsManagerPartNumber: "OP_LIMIT",
      },
    },
    Station6: {
      STATION6: {
        GentexSpecificSerialNumber: "OP_CALIBRATE",
        MfgOpsManagerPartNumber: "OP_DEF_CHK",
      },
    },
  },
  partNumbers: {
    "605-1346-000": {
      AgcOverrideSetting: {
        setting: "236",
      },
    },
    "705-1364-000": {
      AgcOverrideSetting: {
        setting: "222",
      },
    },
  },
});

export async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

export async function mockEditorGraphql(page: Page) {
  await page.route("**/graphql", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    let payload: GraphqlPayload | undefined;
    try {
      payload = route.request().postDataJSON() as GraphqlPayload;
    } catch {
      await route.continue();
      return;
    }

    if (payload?.operationName === "GetMemoryMap") {
      const vars = payload.variables ?? {};
      const memoryMapName = String(vars.memoryMapName ?? "305-0195-000");
      const bomRevision = String(vars.bomRevision ?? "BBB");
      const version = Number(vars.version ?? 4);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            getMemoryMap: buildMemoryMap(version, bomRevision, memoryMapName),
          },
        }),
      });
      return;
    }

    if (payload?.operationName === "GetCommandSet") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            getCommandSet: commandSetDocument,
          },
        }),
      });
      return;
    }

    if (payload?.operationName === "GetAllCommandSets") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            getAllCommandSets: [commandSetFileName, "dummy.cmdset"],
          },
        }),
      });
      return;
    }

    await route.continue();
  });
}

export async function openEditorRoute(page: Page, route = "/305-0195-000/BBB/4") {
  await page.goto(`${BASE_URL}${route}`);
  await expect(page.getByTestId("editor-toolbar")).toBeVisible();
  await expect(page.getByTestId("memorymap-grid")).toBeVisible();
}
