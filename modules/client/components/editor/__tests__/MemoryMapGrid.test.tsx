import * as React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { AuthenticatedAndMemoryMapLoadedState } from "modules/client/test-helpers/state/authenticated-memorymap-loaded-state";
import { render, waitFor, within, screen } from "modules/client/test-helpers/rtl-extensions";
import MemoryMapGrid from "../MemoryMapGrid";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

describe("MemoryMap Grid", () => {
  let memoryMapGrid: HTMLElement;
  let store: any;
  let MemoryMapGridProvider: ReturnType<typeof mockProvider>;

  beforeEach(async () => {
    store = configureStore({
      reducer: createRootReducer(),
      preloadedState: AuthenticatedAndMemoryMapLoadedState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          immutableCheck: false,
        }),
    });

    MemoryMapGridProvider = mockProvider({
      initialHistoryStack: "/dashboard",
      logMissingMocks: true,
      reduxStore: store,
      additionalRoutes: [
        { path: "/:memoryMapName/:bomRevision/:version/:commandName/:parameterName/", component: <MemoryMapGrid /> },
      ],
    });

    render(
      <MemoryMapGridProvider>
        <MemoryMapGrid />
      </MemoryMapGridProvider>
    );

    memoryMapGrid = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("memorymap-grid");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(memoryMapGrid).toBeInTheDocument();
    expect(memoryMapGrid).toBeVisible();
  });

  it("Has the correct column headers and they are visible.", async () => {
    const commandHeader = within(memoryMapGrid).getByText("COMMAND");
    expect(commandHeader).toBeInTheDocument();
    expect(commandHeader).toBeVisible();

    const parameterHeader = within(memoryMapGrid).getByText("PARAMETER");
    expect(parameterHeader).toBeInTheDocument();
    expect(parameterHeader).toBeVisible();

    const lowLimitHeader = within(memoryMapGrid).getByText("LOW LIMIT");
    expect(lowLimitHeader).toBeInTheDocument();
    expect(lowLimitHeader).toBeVisible();

    const valueHeader = within(memoryMapGrid).getByText("VALUE");
    expect(valueHeader).toBeInTheDocument();
    expect(valueHeader).toBeVisible();

    const highLimitHeader = within(memoryMapGrid).getByText("HIGH LIMIT");
    expect(highLimitHeader).toBeInTheDocument();
    expect(highLimitHeader).toBeVisible();

    const memoryMapStations = ["EOL", "HELM", "STATION6"];
    memoryMapStations.forEach((stationName) => {
      const stationHeader = within(memoryMapGrid).getByText(stationName.toUpperCase());
      expect(stationHeader).toBeInTheDocument();
      expect(stationHeader).toBeVisible();
    });

    const memoryMapPartNumbers = [
      "605-1346-000",
      "705-1364-000",
      "705-2631-000",
      "903-1306-000",
      "903-4689-000",
      "903-9876-000",
      "905-6642-000",
    ];
    memoryMapPartNumbers.forEach((partNumberName) => {
      const partNumberHeader = within(memoryMapGrid).getByText(partNumberName.toUpperCase());
      expect(partNumberHeader).toBeInTheDocument();
      expect(partNumberHeader).toBeVisible();
    });
  });

  it("Displays the first item (AssemblyPartNumber) correctly in the memory map grid.", async () => {
    const assemblyPartNumber = screen.getByDataId("index0_AssemblyPartNumber");

    const commandName = within(assemblyPartNumber).queryByDataField("command");
    expect(commandName).toHaveTextContent("AssemblyPartNumber");

    const parameterName = within(assemblyPartNumber).queryByDataField("parameter");
    expect(parameterName).toHaveTextContent("partNumber");

    const lowLimit = within(assemblyPartNumber).queryByDataField("lowLimit");
    expect(lowLimit).toHaveTextContent("0");

    const value = within(assemblyPartNumber).queryByDataField("value");
    expect(value).toHaveTextContent("0");

    const highLimit = within(assemblyPartNumber).queryByDataField("highLimit");
    expect(highLimit).toHaveTextContent("65535");

    const eol = within(assemblyPartNumber).queryByDataField("eol");
    expect(eol).toHaveTextContent("VERIFY");

    const helm = within(assemblyPartNumber).queryByDataField("helm");
    expect(helm).toHaveTextContent("WRITE");

    const station6 = within(assemblyPartNumber).queryByDataField("station6");
    expect(station6).toHaveTextContent("NOT SET");
  });

  it("Displays the second item (GentexSpecificSerialNumber) correctly in the memory map grid.", async () => {
    const gentexSpecificSerialNumber = screen.getByDataId("index0_GentexSpecificSerialNumber");

    const commandName = within(gentexSpecificSerialNumber).queryByDataField("command");
    expect(commandName).toHaveTextContent("GentexSpecificSerialNumber");

    const parameterName = within(gentexSpecificSerialNumber).queryByDataField("parameter");
    expect(parameterName).toHaveTextContent("serialNumber");

    const lowLimit = within(gentexSpecificSerialNumber).queryByDataField("lowLimit");
    expect(lowLimit).toHaveTextContent("0 0 0 0 0 0 0 0");

    const value = within(gentexSpecificSerialNumber).queryByDataField("value");
    expect(value).toHaveTextContent("0 0 0 0 0 0 0 0");

    const highLimit = within(gentexSpecificSerialNumber).queryByDataField("highLimit");
    expect(highLimit).toHaveTextContent("255 255 255 255 255 255 255 255");

    const eol = within(gentexSpecificSerialNumber).queryByDataField("eol");
    expect(eol).toHaveTextContent("NOT SET");

    const helm = within(gentexSpecificSerialNumber).queryByDataField("helm");
    expect(helm).toHaveTextContent("NOT SET");

    const station6 = within(gentexSpecificSerialNumber).queryByDataField("station6");
    expect(station6).toHaveTextContent("CALIBRATE");
  });

  it("Displays the first parameter of the third item (MfgOpsManagerPartNumber) correctly in the memory map grid.", async () => {
    const mfgOpsManagerPartNumber = screen.getByDataId("index0_MfgOpsManagerPartNumber");

    const commandName = within(mfgOpsManagerPartNumber).queryByDataField("command");
    expect(commandName).toHaveTextContent("MfgOpsManagerPartNumber");

    const parameterName = within(mfgOpsManagerPartNumber).getByDataField("parameter");
    expect(parameterName).toHaveTextContent("major");

    const lowLimit = within(mfgOpsManagerPartNumber).queryByDataField("lowLimit");
    expect(lowLimit).toHaveTextContent("0");

    const value = within(mfgOpsManagerPartNumber).queryByDataField("value");
    expect(value).toHaveTextContent("0");

    const highLimit = within(mfgOpsManagerPartNumber).queryByDataField("highLimit");
    expect(highLimit).toHaveTextContent("65535");

    const eol = within(mfgOpsManagerPartNumber).queryByDataField("eol");
    expect(eol).toHaveTextContent("VERIFY");

    const helm = within(mfgOpsManagerPartNumber).queryByDataField("helm");
    expect(helm).toHaveTextContent("LIMIT");

    const station6 = within(mfgOpsManagerPartNumber).queryByDataField("station6");
    expect(station6).toHaveTextContent("DEF CHK");
  });

  it("Displays the second parameter of the third item (MfgOpsManagerPartNumber) correctly in the memory map grid.", async () => {
    const mfgOpsManagerPartNumber = screen.getByDataId("index1_MfgOpsManagerPartNumber");

    const commandName = within(mfgOpsManagerPartNumber).queryByDataField("command");
    expect(commandName).toHaveTextContent("");

    const parameterName = within(mfgOpsManagerPartNumber).getByDataField("parameter");
    expect(parameterName).toHaveTextContent("minor");

    const lowLimit = within(mfgOpsManagerPartNumber).queryByDataField("lowLimit");
    expect(lowLimit).toHaveTextContent("0");

    const value = within(mfgOpsManagerPartNumber).queryByDataField("value");
    expect(value).toHaveTextContent("0");

    const highLimit = within(mfgOpsManagerPartNumber).queryByDataField("highLimit");
    expect(highLimit).toHaveTextContent("255");

    const eol = within(mfgOpsManagerPartNumber).queryByDataField("eol");
    expect(eol).toHaveTextContent("VERIFY");

    const helm = within(mfgOpsManagerPartNumber).queryByDataField("helm");
    expect(helm).toHaveTextContent("LIMIT");

    const station6 = within(mfgOpsManagerPartNumber).queryByDataField("station6");
    expect(station6).toHaveTextContent("DEF CHK");
  });

  it("Displays the third parameter of the third item (MfgOpsManagerPartNumber) correctly in the memory map grid.", async () => {
    const mfgOpsManagerPartNumber = screen.getByDataId("index2_MfgOpsManagerPartNumber");

    const commandName = within(mfgOpsManagerPartNumber).queryByDataField("command");
    expect(commandName).toHaveTextContent("");

    const parameterName = within(mfgOpsManagerPartNumber).getByDataField("parameter");
    expect(parameterName).toHaveTextContent("revision");

    const lowLimit = within(mfgOpsManagerPartNumber).queryByDataField("lowLimit");
    expect(lowLimit).toHaveTextContent("0 0 0");

    const value = within(mfgOpsManagerPartNumber).queryByDataField("value");
    expect(value).toHaveTextContent("0 0 0");

    const highLimit = within(mfgOpsManagerPartNumber).queryByDataField("highLimit");
    expect(highLimit).toHaveTextContent("255 255 255");

    const eol = within(mfgOpsManagerPartNumber).queryByDataField("eol");
    expect(eol).toHaveTextContent("VERIFY");

    const helm = within(mfgOpsManagerPartNumber).queryByDataField("helm");
    expect(helm).toHaveTextContent("LIMIT");

    const station6 = within(mfgOpsManagerPartNumber).queryByDataField("station6");
    expect(station6).toHaveTextContent("DEF CHK");
  });

  it("Displays the fourth parameter of the third item (MfgOpsManagerPartNumber) correctly in the memory map grid.", async () => {
    const mfgOpsManagerPartNumber = screen.getByDataId("index3_MfgOpsManagerPartNumber");

    const commandName = within(mfgOpsManagerPartNumber).queryByDataField("command");
    expect(commandName).toHaveTextContent("");

    const parameterName = within(mfgOpsManagerPartNumber).getByDataField("parameter");
    expect(parameterName).toHaveTextContent("version");

    const lowLimit = within(mfgOpsManagerPartNumber).queryByDataField("lowLimit");
    expect(lowLimit).toHaveTextContent("0");

    const value = within(mfgOpsManagerPartNumber).queryByDataField("value");
    expect(value).toHaveTextContent("0");

    const highLimit = within(mfgOpsManagerPartNumber).queryByDataField("highLimit");
    expect(highLimit).toHaveTextContent("255");

    const eol = within(mfgOpsManagerPartNumber).queryByDataField("eol");
    expect(eol).toHaveTextContent("VERIFY");

    const helm = within(mfgOpsManagerPartNumber).queryByDataField("helm");
    expect(helm).toHaveTextContent("LIMIT");

    const station6 = within(mfgOpsManagerPartNumber).queryByDataField("station6");
    expect(station6).toHaveTextContent("DEF CHK");
  });

  it("Displays part number overrides correctly in the memory map grid.", async () => {
    const mfgOpsManagerPartNumber = screen.getByDataId("index0_AgcOverrideSetting");

    const firstPartNumber = within(mfgOpsManagerPartNumber).queryByDataField("605-1346-000");
    expect(firstPartNumber).toHaveTextContent("236");

    const secondPartNumber = within(mfgOpsManagerPartNumber).queryByDataField("705-1364-000");
    expect(secondPartNumber).toHaveTextContent("222");
  });

  describe("Scrolling Configuration", () => {
    it("Has the DataGrid configured with proper scrollbar settings", async () => {
      expect(memoryMapGrid).toBeInTheDocument();
      expect(memoryMapGrid).toBeVisible();

      const gridContainer = memoryMapGrid.closest(".MuiDataGrid-root");
      expect(gridContainer).toBeInTheDocument();
    });

    it("Has columns configured with minimum widths for horizontal scrolling", async () => {
      const commandHeader = within(memoryMapGrid).getByText("COMMAND");
      expect(commandHeader).toBeInTheDocument();

      const parameterHeader = within(memoryMapGrid).getByText("PARAMETER");
      expect(parameterHeader).toBeInTheDocument();

      const lowLimitHeader = within(memoryMapGrid).getByText("LOW LIMIT");
      expect(lowLimitHeader).toBeInTheDocument();

      const valueHeader = within(memoryMapGrid).getByText("VALUE");
      expect(valueHeader).toBeInTheDocument();

      const highLimitHeader = within(memoryMapGrid).getByText("HIGH LIMIT");
      expect(highLimitHeader).toBeInTheDocument();
    });

    it("Renders all rows with proper height for vertical scrolling", async () => {
      const assemblyPartNumber = screen.getByDataId("index0_AssemblyPartNumber");
      expect(assemblyPartNumber).toBeInTheDocument();

      const gentexSerialNumber = screen.getByDataId("index0_GentexSpecificSerialNumber");
      expect(gentexSerialNumber).toBeInTheDocument();

      const mfgOpsManagerPartNumber = screen.getByDataId("index0_MfgOpsManagerPartNumber");
      expect(mfgOpsManagerPartNumber).toBeInTheDocument();
    });

    it("Supports virtualization for better scrolling performance", async () => {
      const virtualScroller = memoryMapGrid.querySelector(".MuiDataGrid-virtualScroller");
      expect(virtualScroller).toBeInTheDocument();
    });
  });
});

describe("MemoryMapGrid - Editing Cells and Verifying Dispatches", () => {
  let grid: HTMLElement;
  let user: ReturnType<typeof userEvent.setup>;
  let dispatchSpy: ReturnType<typeof vi.spyOn>;
  let store: any;
  let MemoryMapGridProvider: ReturnType<typeof mockProvider>;

  beforeEach(async () => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: createRootReducer(),
      preloadedState: AuthenticatedAndMemoryMapLoadedState,
    });

    MemoryMapGridProvider = mockProvider({
      initialHistoryStack: "/dashboard",
      logMissingMocks: true,
      reduxStore: store,
      additionalRoutes: [
        { path: "/:memoryMapName/:bomRevision/:version/:commandName/:parameterName/", component: <MemoryMapGrid /> },
      ],
    });

    user = userEvent.setup();
    dispatchSpy = vi.spyOn(store, "dispatch");

    render(
      <MemoryMapGridProvider>
        <MemoryMapGrid />
      </MemoryMapGridProvider>
    );

    grid = await waitFor(() => screen.getByTestId("memorymap-grid"));
    expect(grid).toBeVisible();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Edits lowLimit column and dispatches modifyLowLimit", async () => {
    const row = screen.getByDataId("index0_AssemblyPartNumber");
    const lowLimitCell = within(row).getByDataField("lowLimit");

    expect(lowLimitCell).toHaveTextContent("0");

    await user.click(lowLimitCell);

    await waitFor(() => {
      const input = within(lowLimitCell).queryByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    const input = within(lowLimitCell).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "10");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      const call: any = dispatchSpy.mock.calls.find((c: any) => c[0]?.type?.includes("modifyLowLimit"));
      expect(call?.[0]).toBeTruthy();
      expect(call?.[0].payload).toMatchObject({
        commandName: "AssemblyPartNumber",
        parameterName: "partNumber",
        lowLimit: "10",
      });
    });
  });

  it("Edits value column and dispatches modifyValue", async () => {
    const row = screen.getByDataId("index0_MfgOpsManagerPartNumber");
    const valueCell = within(row).getByDataField("value");

    expect(valueCell).toHaveTextContent("0");

    await user.click(valueCell);

    await waitFor(() => {
      const input = within(valueCell).queryByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    const input = within(valueCell).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "123");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      const call: any = dispatchSpy.mock.calls.find((c: any) => c[0]?.type?.includes("modifyValue"));
      expect(call?.[0]).toBeTruthy();
      expect(call?.[0].payload).toMatchObject({
        commandName: "MfgOpsManagerPartNumber",
        parameterName: "major",
        value: "123",
      });
    });
  });

  it("Edits highLimit column and dispatches modifyHighLimit", async () => {
    const row = screen.getByDataId("index0_MfgOpsManagerPartNumber");
    const highLimitCell = within(row).getByDataField("highLimit");

    expect(highLimitCell).toHaveTextContent("65535");

    await user.click(highLimitCell);

    await waitFor(() => {
      const input = within(highLimitCell).queryByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    const input = within(highLimitCell).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "200");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      const call: any = dispatchSpy.mock.calls.find((c: any) => c[0]?.type?.includes("modifyHighLimit"));
      expect(call?.[0]).toBeTruthy();
      expect(call?.[0].payload).toMatchObject({
        commandName: "MfgOpsManagerPartNumber",
        parameterName: "major",
        highLimit: "200",
      });
    });
  });

  it("Edits a part number override column (605-1346-000) and dispatches modifyPartNumberOverride", async () => {
    const row = screen.getByDataId("index0_AgcOverrideSetting");
    const partNumberField = "605-1346-000";
    const overrideCell = within(row).getByDataField(partNumberField);

    expect(overrideCell).toHaveTextContent("236");

    await user.click(overrideCell);

    await waitFor(() => {
      const input = within(overrideCell).queryByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    const input = within(overrideCell).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "250");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      const call: any = dispatchSpy.mock.calls.find((c: any) => c[0]?.type?.includes("modifyPartNumberOverride"));
      expect(call?.[0]).toBeTruthy();
      expect(call?.[0].payload).toMatchObject({
        commandName: "AgcOverrideSetting",
        parameterName: "setting",
        partNumber: partNumberField,
        overrideValue: "250",
      });
    });
  });

  it("Edits an operation column (EOL) and dispatches modifyOperation", async () => {
    const row = screen.getByDataId("index0_AgcOverrideSetting");
    const testStationField = "eol";
    const operationCell = within(row).getByDataField(testStationField);

    expect(operationCell).toHaveTextContent("NOT SET");

    const selector = within(operationCell).getByTestId("selector");
    expect(selector).toBeInTheDocument();

    const selectedOption = within(selector).getByTestId("selected-option");
    await user.click(selectedOption);

    const selectorMenu = await screen.findByTestId("selector-menu");
    expect(selectorMenu).toBeVisible();

    const calibrateOption = within(selectorMenu).getByTestId("op_calibrate-option");
    await user.click(calibrateOption);

    await waitFor(() => {
      expect(operationCell).toHaveTextContent("CALIBRATE");
    });

    await waitFor(() => {
      const call: any = dispatchSpy.mock.calls.find((c: any) => c[0]?.type?.includes("modifyOperation"));
      expect(call?.[0]).toBeTruthy();
      expect(call?.[0].payload).toMatchObject({
        commandName: "AgcOverrideSetting",
        stationName: "eol",
        operation: "OP_CALIBRATE",
      });
    });
  });
});

describe("MemoryMapGrid - Editing Cells and Verifying Redux Store Changes", () => {
  let grid: HTMLElement;
  let user: ReturnType<typeof userEvent.setup>;
  let store: any;
  let MemoryMapGridProvider: ReturnType<typeof mockProvider>;

  beforeEach(async () => {
    store = configureStore({
      reducer: createRootReducer(),
      preloadedState: AuthenticatedAndMemoryMapLoadedState,
    });

    MemoryMapGridProvider = mockProvider({
      initialHistoryStack: "/dashboard",
      logMissingMocks: true,
      reduxStore: store,
      additionalRoutes: [
        { path: "/:memoryMapName/:bomRevision/:version/:commandName/:parameterName/", component: <MemoryMapGrid /> },
      ],
    });

    user = userEvent.setup();

    render(
      <MemoryMapGridProvider>
        <MemoryMapGrid />
      </MemoryMapGridProvider>
    );

    grid = await waitFor(() => screen.getByTestId("memorymap-grid"));
    expect(grid).toBeVisible();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Edits lowLimit column and changes lowLimit in Redux", async () => {
    const row = screen.getByDataId("index0_AssemblyPartNumber");
    const lowLimitCell = within(row).getByDataField("lowLimit");

    expect(lowLimitCell).toHaveTextContent("0");

    await user.click(lowLimitCell);

    await waitFor(() => {
      const input = within(lowLimitCell).queryByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    const input = within(lowLimitCell).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "10002");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        store.getState().Editor.present.memoryMap?.commands["AssemblyPartNumber"].parameters["partNumber"].lowLimit
      ).toEqual("10002");
    });
  });

  it("Edits value column and changes value in Redux", async () => {
    const row = screen.getByDataId("index0_MfgOpsManagerPartNumber");
    const valueCell = within(row).getByDataField("value");

    expect(valueCell).toHaveTextContent("0");

    await user.click(valueCell);

    await waitFor(() => {
      const input = within(valueCell).queryByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    const input = within(valueCell).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "123456");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        store.getState().Editor.present.memoryMap?.commands["MfgOpsManagerPartNumber"].parameters["major"].value
      ).toEqual("123456");
    });
  });

  it("Edits highLimit column and changes highLimit in Redux", async () => {
    const row = screen.getByDataId("index0_MfgOpsManagerPartNumber");
    const highLimitCell = within(row).getByDataField("highLimit");

    expect(highLimitCell).toHaveTextContent("65535");

    await user.click(highLimitCell);

    await waitFor(() => {
      const input = within(highLimitCell).queryByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    const input = within(highLimitCell).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "2006");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        store.getState().Editor.present.memoryMap?.commands["MfgOpsManagerPartNumber"].parameters["major"].highLimit
      ).toEqual("2006");
    });
  });

  it("Edits a part number override column (605-1346-000) and changes override in Redux", async () => {
    const row = screen.getByDataId("index0_AgcOverrideSetting");
    const partNumberField = "605-1346-000";
    const overrideCell = within(row).getByDataField(partNumberField);

    expect(overrideCell).toHaveTextContent("236");

    await user.click(overrideCell);

    await waitFor(() => {
      const input = within(overrideCell).queryByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    const input = within(overrideCell).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "1337");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      const overridePartNumber = store.getState().Editor.present.memoryMap?.partNumbers?.["605-1346-000"];
      const overrideCommand = overridePartNumber?.["AgcOverrideSetting"];
      const overrideValue = overrideCommand?.["setting"];
      expect(overrideValue).toEqual("1337");
    });
  });
});
