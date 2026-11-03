import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { stubRouterRequest } from "modules/client/test-helpers/router-request";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { AuthenticatedAndMemoryMapLoadedState } from "modules/client/test-helpers/state/authenticated-memorymap-loaded-state";
import { render, waitFor, within, screen } from "modules/client/test-helpers/rtl-extensions";
import { Editor } from "../Editor";
import { MockedProvider } from "@apollo/client/testing";
import { EditorMocks } from "modules/client/test-helpers/mocks/editor-mocks";
import { ActiveDirectoryMocks } from "modules/client/test-helpers/mocks/active-directory-mocks";
import { EmployeePictureMocks } from "modules/client/test-helpers/mocks/employee-picture-mocks";
import { GetAllCommandSetsMock, GetCommandSetMock } from "modules/client/test-helpers/mocks/commandset-mocks";

describe("Memory Map Routing", () => {
  beforeEach(() => {
    stubRouterRequest();
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  describe("Route with command and parameter specified", () => {
    let store: any;
    let EditorProvider: ReturnType<typeof mockProvider>;

    beforeEach(async () => {
      store = configureStore({
        reducer: createRootReducer(),
        preloadedState: AuthenticatedAndMemoryMapLoadedState,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            immutableCheck: false,
          }),
      });

      EditorProvider = mockProvider({
        dataRouter: true,
        initialHistoryStack: "/305-0195-000/BBB/4/AssemblyPartNumber/partNumber",
        urlOverride: {
          url: "/305-0195-000/BBB/4/AssemblyPartNumber/partNumber",
          route: "/:memoryMapName/:bomRevision/:version/:commandName/:parameterName",
        },
        logMissingMocks: true,
        reduxStore: store,
      });
    });

    it(
      "Loads the correct memory map when navigating to a URL with command and parameter",
      { timeout: 30000 },
      async () => {
        render(
          <EditorProvider>
            <MockedProvider
              mocks={[
                ...EditorMocks,
                ...ActiveDirectoryMocks,
                ...EmployeePictureMocks,
                GetCommandSetMock(),
                GetAllCommandSetsMock(),
              ]}
            >
              <Editor />
            </MockedProvider>
          </EditorProvider>
        );

        const editorToolbar = await waitFor<HTMLElement>(async () => {
          const element = screen.getByTestId("editor-toolbar");
          return element;
        });

        expect(editorToolbar).toBeInTheDocument();
        expect(editorToolbar).toHaveTextContent("305-0195-000 / BBB / 4");
      }
    );

    it("Selects the correct command in the grid", { timeout: 10000 }, async () => {
      render(
        <EditorProvider>
          <MockedProvider
            mocks={[
              ...EditorMocks,
              ...ActiveDirectoryMocks,
              ...EmployeePictureMocks,
              GetCommandSetMock(),
              GetAllCommandSetsMock(),
            ]}
          >
            <Editor />
          </MockedProvider>
        </EditorProvider>
      );

      const memoryMapGrid = await waitFor<HTMLElement>(async () => {
        const element = screen.getByTestId("memorymap-grid");
        return element;
      });

      const assemblyPartNumberRow = await waitFor(() => within(memoryMapGrid).getByTestId("AssemblyPartNumber"));

      expect(assemblyPartNumberRow).toBeInTheDocument();
    });

    it("Selects the correct row in the grid based on command and parameter", { timeout: 10000 }, async () => {
      render(
        <EditorProvider>
          <MockedProvider
            mocks={[
              ...EditorMocks,
              ...ActiveDirectoryMocks,
              ...EmployeePictureMocks,
              GetCommandSetMock(),
              GetAllCommandSetsMock(),
            ]}
          >
            <Editor />
          </MockedProvider>
        </EditorProvider>
      );

      const memoryMapGrid = await waitFor<HTMLElement>(async () => {
        const element = screen.getByTestId("memorymap-grid");
        return element;
      });

      const assemblyPartNumberRow = await waitFor(() => within(memoryMapGrid).getByTestId("AssemblyPartNumber"));

      const parameterCell = within(assemblyPartNumberRow).queryByDataField("parameter");
      expect(parameterCell).toHaveTextContent("partNumber");

      await waitFor(() => {
        expect(assemblyPartNumberRow).toHaveAttribute("aria-selected", "true");
      });
    });
  });

  describe("Route with command only (no parameter)", () => {
    let store: any;
    let EditorProvider: ReturnType<typeof mockProvider>;

    beforeEach(async () => {
      store = configureStore({
        reducer: createRootReducer(),
        preloadedState: AuthenticatedAndMemoryMapLoadedState,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            immutableCheck: false,
          }),
      });

      EditorProvider = mockProvider({
        dataRouter: true,
        initialHistoryStack: "/305-0195-000/BBB/4/MfgOpsManagerPartNumber/",
        urlOverride: {
          url: "/305-0195-000/BBB/4/MfgOpsManagerPartNumber/",
          route: "/:memoryMapName/:bomRevision/:version/:commandName/",
        },
        logMissingMocks: true,
        reduxStore: store,
      });
    });

    it("Loads the memory map and selects the first parameter of the command", { timeout: 6000 }, async () => {
      render(
        <EditorProvider>
          <MockedProvider
            mocks={[
              ...EditorMocks,
              ...ActiveDirectoryMocks,
              ...EmployeePictureMocks,
              GetCommandSetMock(),
              GetAllCommandSetsMock(),
            ]}
          >
            <Editor />
          </MockedProvider>
        </EditorProvider>
      );

      await waitFor(() => {
        const editorToolbar = screen.getByTestId("editor-toolbar");
        expect(editorToolbar).toBeInTheDocument();
        expect(editorToolbar).toHaveTextContent("305-0195-000 / BBB / 4");
      });

      await waitFor(() => {
        const memoryMapGrid = screen.getByTestId("memorymap-grid");
        expect(memoryMapGrid).toBeInTheDocument();
      });

      await waitFor(() => {
        const firstParamRow = screen.getByDataId("index0_MfgOpsManagerPartNumber");
        expect(firstParamRow).toBeInTheDocument();
        expect(firstParamRow).toHaveAttribute("aria-selected", "true");
      });
    });
  });

  describe("Route with no command or parameter", () => {
    let store: any;
    let EditorProvider: ReturnType<typeof mockProvider>;

    beforeEach(async () => {
      store = configureStore({
        reducer: createRootReducer(),
        preloadedState: AuthenticatedAndMemoryMapLoadedState,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            immutableCheck: false,
          }),
      });

      EditorProvider = mockProvider({
        dataRouter: true,
        initialHistoryStack: "/305-0195-000/BBB/4/",
        urlOverride: {
          url: "/305-0195-000/BBB/4/",
          route: "/:memoryMapName/:bomRevision/:version/",
        },
        logMissingMocks: true,
        reduxStore: store,
      });
    });

    it("Loads the memory map without selecting any row", async () => {
      render(
        <EditorProvider>
          <MockedProvider
            mocks={[
              ...EditorMocks,
              ...ActiveDirectoryMocks,
              ...EmployeePictureMocks,
              GetCommandSetMock(),
              GetAllCommandSetsMock(),
            ]}
          >
            <Editor />
          </MockedProvider>
        </EditorProvider>
      );

      const editorToolbar = await waitFor<HTMLElement>(async () => {
        const element = screen.getByTestId("editor-toolbar");
        return element;
      });

      expect(editorToolbar).toBeInTheDocument();
      expect(editorToolbar).toHaveTextContent("305-0195-000 / BBB / 4");

      const memoryMapGrid = await waitFor<HTMLElement>(async () => {
        const element = screen.getByTestId("memorymap-grid");
        return element;
      });

      expect(memoryMapGrid).toBeInTheDocument();
    });
  });

  describe("Route with case-insensitive command and parameter", () => {
    let store: any;
    let EditorProvider: ReturnType<typeof mockProvider>;

    beforeEach(async () => {
      store = configureStore({
        reducer: createRootReducer(),
        preloadedState: AuthenticatedAndMemoryMapLoadedState,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            immutableCheck: false,
          }),
      });

      EditorProvider = mockProvider({
        dataRouter: true,
        initialHistoryStack: "/305-0195-000/BBB/4/assemblYPartNumber/PARTnumber",
        urlOverride: {
          url: "/305-0195-000/BBB/4/assemblYPartNumber/PARTnumber",
          route: "/:memoryMapName/:bomRevision/:version/:commandName/:parameterName",
        },
        logMissingMocks: true,
        reduxStore: store,
      });
    });

    it("Matches commands and parameters case-insensitively", async () => {
      render(
        <EditorProvider>
          <MockedProvider
            mocks={[
              ...EditorMocks,
              ...ActiveDirectoryMocks,
              ...EmployeePictureMocks,
              GetCommandSetMock(),
              GetAllCommandSetsMock(),
            ]}
          >
            <Editor />
          </MockedProvider>
        </EditorProvider>
      );

      const memoryMapGrid = await waitFor<HTMLElement>(async () => {
        const element = screen.getByTestId("memorymap-grid");
        return element;
      });

      const assemblyPartNumberRow = await waitFor(() => within(memoryMapGrid).getByTestId("AssemblyPartNumber"));

      expect(assemblyPartNumberRow).toBeInTheDocument();

      const parameterCell = within(assemblyPartNumberRow).queryByDataField("parameter");
      expect(parameterCell).toHaveTextContent("partNumber");

      await waitFor(() => {
        expect(assemblyPartNumberRow).toHaveAttribute("aria-selected", "true");
      });
    });
  });
});
