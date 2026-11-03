import * as React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { stubRouterRequest } from "modules/client/test-helpers/router-request";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { AuthenticatedAndMemoryMapLoadedState } from "modules/client/test-helpers/state/authenticated-memorymap-loaded-state";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { Editor } from "../Editor";
import { MockedProvider } from "@apollo/client/testing";
import { EditorMocks } from "modules/client/test-helpers/mocks/editor-mocks";
import { GetAllCommandSetsMock, GetCommandSetMock } from "modules/client/test-helpers/mocks/commandset-mocks";
import { ActiveDirectoryMocks } from "modules/client/test-helpers/mocks/active-directory-mocks";
import { EmployeePictureMocks } from "modules/client/test-helpers/mocks/employee-picture-mocks";
import { act, render, waitFor, within, screen } from "@testing-library/react";

let dispatchStore = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndMemoryMapLoadedState,
});

const MemoryMapGridDispatchProvider = mockProvider({
  dataRouter: true,
  initialHistoryStack: "/305-0195-000/BBB/4",
  urlOverride: {
    url: "/305-0195-000/BBB/4",
    route: "/:memoryMapName/:bomRevision/:version/",
  },
  additionalRoutes: [
    { path: "/:memoryMapName/:bomRevision/:version/:commandName/:parameterName/", component: <Editor /> },
  ],
  logMissingMocks: true,
  reduxStore: dispatchStore,
});

describe("MemoryMapGrid - Testing Undo/Redo Dispatches", () => {
  let grid: HTMLElement;
  let user: ReturnType<typeof userEvent.setup>;
  let dispatchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    stubRouterRequest();
    user = userEvent.setup();
    dispatchSpy = vi.spyOn(dispatchStore, "dispatch");

    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    render(
      <MockedProvider
        mocks={[
          ...EditorMocks,
          ...ActiveDirectoryMocks,
          ...EmployeePictureMocks,
          GetCommandSetMock(),
          GetAllCommandSetsMock(),
        ]}
      >
        <MemoryMapGridDispatchProvider>
          <Editor />
        </MemoryMapGridDispatchProvider>
      </MockedProvider>
    );

    grid = await waitFor(() => screen.getByTestId("memorymap-grid"));
    expect(grid).toBeVisible();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("Edits value column and dispatches undo action when undo button is clicked.", { timeout: 10000 }, async () => {
    const rows = screen.getAllByTestId("MfgOpsManagerPartNumber");
    const row = rows[0];
    const cells = within(row).getAllByRole("gridcell");
    const valueCell = cells[3];

    expect(valueCell).toHaveTextContent("0");

    await user.click(valueCell);

    const input = await waitFor(() => within(valueCell).getByRole("textbox"));
    await user.clear(input);
    await user.type(input, "123");

    await user.keyboard("{Enter}");

    const undoButton = screen.getByTestId("undoButton");
    expect(undoButton).toBeEnabled();

    await user.click(undoButton);

    await waitFor(() => {
      const call: any = dispatchSpy.mock.calls.find((c: any) => c[0]?.type?.includes("UNDO"));
      expect(call?.[0]).toBeTruthy();
      expect(call?.[0]).toEqual({ type: "@@redux-undo/UNDO" });
    });
  });

  it("Edits value column and dispatches redo action when redo button is clicked.", { timeout: 10000 }, async () => {
    const rows = screen.getAllByTestId("MfgOpsManagerPartNumber");
    const row = rows[0];
    const cells = within(row).getAllByRole("gridcell");
    const valueCell = cells[3];

    expect(valueCell).toHaveTextContent("0");

    await user.click(valueCell);
    const input = await waitFor(() => within(valueCell).getByRole("textbox"));
    await user.clear(input);
    await user.type(input, "123");

    await act(async () => {
      await user.keyboard("{Enter}");
    });

    const undoButton = screen.getByTestId("undoButton");
    expect(undoButton).toBeEnabled();

    await act(async () => {
      await user.click(undoButton);
    });

    await waitFor(() => {
      expect(valueCell).toHaveTextContent("0");
    });

    const redoButton = screen.getByTestId("redoButton");
    expect(redoButton).toBeEnabled();
    await user.click(redoButton);

    await waitFor(() => {
      const call: any = dispatchSpy.mock.calls.find((c: any) => c[0]?.type?.includes("REDO"));
      expect(call?.[0]).toBeTruthy();
      expect(call?.[0]).toEqual({ type: "@@redux-undo/REDO" });
    });
  });
});

const stateStore = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndMemoryMapLoadedState,
});

const MemoryMapGridStateProvider = mockProvider({
  dataRouter: true,
  initialHistoryStack: "/305-0195-000/BBB/4",
  urlOverride: {
    url: "/305-0195-000/BBB/4",
    route: "/:memoryMapName/:bomRevision/:version/",
  },
  additionalRoutes: [
    { path: "/:memoryMapName/:bomRevision/:version/:commandName/:parameterName/", component: <Editor /> },
  ],
  logMissingMocks: true,
  reduxStore: stateStore,
});

describe("MemoryMapGrid - Testing Undo/Redo State", () => {
  let grid: HTMLElement;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    stubRouterRequest();
    user = userEvent.setup();

    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    render(
      <MockedProvider
        mocks={[
          ...EditorMocks,
          ...ActiveDirectoryMocks,
          ...EmployeePictureMocks,
          GetCommandSetMock(),
          GetAllCommandSetsMock(),
        ]}
      >
        <MemoryMapGridStateProvider>
          <Editor />
        </MemoryMapGridStateProvider>
      </MockedProvider>
    );

    grid = await waitFor(() => screen.getByTestId("memorymap-grid"));
    expect(grid).toBeVisible();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it(
    "Edits value column and reverts to the correct state when undo button is clicked.",
    { timeout: 10000 },
    async () => {
      const rows = screen.getAllByTestId("MfgOpsManagerPartNumber");
      const valueCell = within(rows[0]).getAllByRole("gridcell")[3];

      expect(valueCell).toHaveTextContent("0");

      const stateBefore = stateStore.getState().Editor.present.memoryMap;

      await user.click(valueCell);
      const input = await waitFor(() => within(valueCell).getByRole("textbox"));
      await user.clear(input);
      await user.type(input, "123{Enter}");

      const stateAfterEdit = stateStore.getState().Editor.present.memoryMap;
      expect(stateBefore).not.toEqual(stateAfterEdit);

      const undoButton = screen.getByTestId("undoButton");
      await user.click(undoButton);

      expect(stateStore.getState().Editor.present.memoryMap).toEqual(stateBefore);
    }
  );

  it(
    "Edits value column and reverts to the correct state when redo button is clicked.",
    { timeout: 10000 },
    async () => {
      const rows = screen.getAllByTestId("MfgOpsManagerPartNumber");
      const valueCell = within(rows[0]).getAllByRole("gridcell")[3];

      expect(valueCell).toHaveTextContent("0");

      const stateBefore = stateStore.getState().Editor.present.memoryMap;

      await user.click(valueCell);
      const input = await waitFor(() => within(valueCell).getByRole("textbox"));
      await user.clear(input);
      await user.type(input, "123{Enter}");

      const stateAfterEdit = stateStore.getState().Editor.present.memoryMap;
      expect(stateBefore).not.toEqual(stateAfterEdit);

      const undoButton = screen.getByTestId("undoButton");
      await user.click(undoButton);

      expect(stateStore.getState().Editor.present.memoryMap).toEqual(stateBefore);

      const redoButton = screen.getByTestId("redoButton");
      await user.click(redoButton);

      expect(stateStore.getState().Editor.present.memoryMap).toEqual(stateAfterEdit);
    }
  );
});
