import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ApolloClient, ApolloError, ApolloProvider, InMemoryCache } from "@apollo/client";
import { ThemeProvider } from "@mui/material";
import { createMemoryRouter, RouterProvider, useNavigate } from "react-router";
import { createRootReducer } from "modules/client/redux/store";
import { EditorActions, EditorSelectors } from "modules/client/redux/slices/editor-slice";
import { AppTheme } from "modules/client/styles/mui-theme";
import MEMORYMAP_FOR_TESTING from "modules/client/test-helpers/memorymap";
import { Editor, editorRouteIdentity } from "../Editor";
import { AuthenticationActions } from "modules/client/redux/slices/authentication-slice";
import { AuthenticatedUser } from "modules/client/test-helpers/user";
import { stubRouterRequest } from "modules/client/test-helpers/router-request";

const { mutate, show, getMap } = vi.hoisted(() => ({ mutate: vi.fn(), show: vi.fn(), getMap: vi.fn() }));
vi.mock("@toolpad/core", () => ({ useNotifications: () => ({ show }) }));
vi.mock("modules/client/graphql/types.gen", async (importOriginal) => ({
  ...(await importOriginal<typeof import("modules/client/graphql/types.gen")>()),
  useSaveMemoryMapMutation: () => [mutate],
}));
vi.mock("modules/client/hooks/useGetMemoryMap", () => ({ useGetMemoryMap: getMap }));
vi.mock("modules/client/hooks/useGetCommandSet", () => ({ useGetCommandSet: () => "LOADING" }));
vi.mock("../CommandSetManager", () => ({ CommandSetManager: () => null }));
vi.mock("../TestersDialog", () => ({ TestersDialog: () => null }));
vi.mock("allotment", () => ({
  Allotment: Object.assign(({ children }: React.PropsWithChildren) => <div>{children}</div>, {
    Pane: ({ children }: React.PropsWithChildren) => <div style={{ height: 400, width: 1200 }}>{children}</div>,
  }),
  setSashSize: () => {},
}));

const setup = () => {
  const store = configureStore({ reducer: createRootReducer() });
  const document = {
    ...MEMORYMAP_FOR_TESTING,
    commands: { AssemblyPartNumber: MEMORYMAP_FOR_TESTING.commands.AssemblyPartNumber },
    testers: {},
    partNumbers: {},
  };
  store.dispatch(EditorActions.memoryMapLoaded({ memoryMap: document }));
  store.dispatch(EditorActions.setReadOnly(false));
  store.dispatch(AuthenticationActions.loginSuccessful(AuthenticatedUser));
  // Editor derives permissions from Authentication; use the established authenticated fixture.
  const Navigation = () => {
    const navigate = useNavigate();
    return (
      <>
        <button onClick={() => navigate("/dashboard")}>Leave editor</button>
        <Editor />
      </>
    );
  };
  const router = createMemoryRouter(
    [
      { path: "/:memoryMapName/:bomRevision/:version/*", element: <Navigation /> },
      { path: "/dashboard", element: <div>Dashboard destination</div> },
    ],
    { initialEntries: ["/305-0195-000/BBB/4"] }
  );
  mutate.mockImplementation(async ({ variables }) => ({
    data: { saveMemoryMap: { ...document, ...variables.document, concurrencyToken: "new-token" } },
  }));
  const client = new ApolloClient({ cache: new InMemoryCache() });
  render(
    <ApolloProvider client={client}>
      <Provider store={store}>
        <ThemeProvider theme={AppTheme}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </ApolloProvider>
  );
  return { store, router, client, document };
};

describe("editor explicit Save integration", () => {
  beforeEach(() => {
    mutate.mockReset();
    show.mockReset();
    getMap.mockReset();
    getMap.mockReturnValue("LOADING");
    stubRouterRequest();
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each(["Control", "Meta", "click"])("commits the last active-cell keystroke before %s Save", async (method) => {
    const { store } = setup();
    const user = userEvent.setup();
    const grid = await screen.findByTestId("memorymap-grid");
    const cell = grid.querySelector('[data-field="value"][role="gridcell"]') as HTMLElement;
    await user.click(cell);
    const input = await within(cell).findByRole("textbox");
    await user.clear(input);
    await user.type(input, "123");
    if (method === "click") await user.click(screen.getByRole("button", { name: "Save memory map" }));
    else await user.keyboard(`{${method}>}s{/${method}}`);
    await waitFor(
      () =>
        expect({
          calls: mutate.mock.calls.length,
          errors: show.mock.calls,
          value: store.getState().Editor.present.memoryMap?.commands.AssemblyPartNumber.parameters.partNumber.value,
        }).toMatchObject({ calls: 1 }),
      { timeout: 4500 }
    );
    expect(mutate.mock.calls[0][0].variables.document.commands.AssemblyPartNumber.parameters.partNumber.value).toBe(
      "123"
    );
    await waitFor(() => expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(false));
    expect(show).not.toHaveBeenCalled();
  });

  it("ignores same-map selection routes, blocks leaving, and allows Cancel/Discard", async () => {
    const { store, router } = setup();
    act(() => {
      store.dispatch(
        EditorActions.modifyValue({ commandName: "AssemblyPartNumber", parameterName: "partNumber", value: "17" })
      );
    });
    const user = userEvent.setup();
    await user.click(screen.getByText("AssemblyPartNumber"));
    expect(router.state.location.pathname).toContain("/AssemblyPartNumber/partNumber");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByText("Leave editor"));
    expect(await screen.findByRole("dialog")).toHaveTextContent("Unsaved memory map");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(true);
    await user.click(screen.getByText("Leave editor"));
    await user.click(screen.getByRole("button", { name: /^Discard$/ }));
    expect(await screen.findByText("Dashboard destination")).toBeInTheDocument();
    expect(store.getState().Editor.present.memoryMap).toBeNull();
  });

  it("compares route identity without row selections", () => {
    expect(editorRouteIdentity("/305-0195-000/BBB/4/Command/Parameter")).toBe(
      editorRouteIdentity("/305-0195-000/BBB/4")
    );
    expect(editorRouteIdentity("/305-0195-000/BBB/5")).not.toBe(editorRouteIdentity("/305-0195-000/BBB/4"));
  });

  it("allows Undo with history even after editing back to the saved content", async () => {
    const { store } = setup();
    act(() => {
      store.dispatch(
        EditorActions.modifyValue({ commandName: "AssemblyPartNumber", parameterName: "partNumber", value: "17" })
      );
      store.dispatch(
        EditorActions.modifyValue({ commandName: "AssemblyPartNumber", parameterName: "partNumber", value: "0" })
      );
    });
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(false);
    const user = userEvent.setup();
    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(store.getState().Editor.present.memoryMap?.commands.AssemblyPartNumber.parameters.partNumber.value).toBe(
      "17"
    );
    await user.click(screen.getByRole("button", { name: "Redo" }));
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(false);
  });

  it("blocks keyboard/double-click edits, Undo/Redo, and duplicate Save while pending", async () => {
    const { store, document } = setup();
    act(() => {
      store.dispatch(
        EditorActions.modifyValue({ commandName: "AssemblyPartNumber", parameterName: "partNumber", value: "17" })
      );
      store.dispatch(
        EditorActions.modifyValue({ commandName: "AssemblyPartNumber", parameterName: "partNumber", value: "18" })
      );
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: "Redo" })).toBeEnabled();
    let finish!: (result: any) => void;
    mutate.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    await user.click(screen.getByRole("button", { name: "Save memory map" }));
    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    const draft = store.getState().Editor.present.memoryMap;
    const grid = screen.getByTestId("memorymap-grid");
    const cell = grid.querySelector('[data-field="value"][role="gridcell"]') as HTMLElement;
    act(() => cell.focus());
    await user.keyboard("{Enter}{F2}9");
    // Fire DOM events directly as well: the pointer-events lock must not be the only edit-start protection.
    fireEvent.doubleClick(cell);
    expect(within(grid).queryByRole("textbox")).not.toBeInTheDocument();
    for (const name of ["Undo", "Redo", "Save memory map", "Manage test stations"]) {
      const button = screen.getByRole("button", { name });
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    await user.keyboard("{Control>}s{/Control}");
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(store.getState().Editor.present.memoryMap).toEqual(draft);
    await act(async () =>
      finish({ data: { saveMemoryMap: { ...document, ...draft, concurrencyToken: "saved-token" } } })
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "Save memory map" })).toBeEnabled());
    expect(store.getState().Editor.past).toHaveLength(0);
    expect(store.getState().Editor.future).toHaveLength(0);
    await user.dblClick(cell);
    expect(await within(grid).findByRole("textbox")).toBeInTheDocument();
  });

  it("Save and leave only proceeds after success; failure keeps the draft", async () => {
    const { store } = setup();
    act(() => {
      store.dispatch(
        EditorActions.modifyValue({ commandName: "AssemblyPartNumber", parameterName: "partNumber", value: "17" })
      );
    });
    const succeed = mutate.getMockImplementation()!;
    mutate.mockRejectedValue(new Error("offline"));
    const user = userEvent.setup();
    await user.click(screen.getByText("Leave editor"));
    await user.click(screen.getByRole("button", { name: "Save and leave" }));
    await waitFor(() => expect(show).toHaveBeenCalled());
    expect(screen.getByRole("dialog")).toHaveTextContent("Unsaved memory map");
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(true);
    mutate.mockImplementation(succeed);
    await user.click(screen.getByRole("button", { name: "Save and leave" }));
    expect(await screen.findByText("Dashboard destination")).toBeInTheDocument();
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(false);
  });

  it("conflict preserves the draft until explicit reload and discard confirmation", async () => {
    const { store, client, document } = setup();
    act(() => {
      store.dispatch(
        EditorActions.modifyValue({ commandName: "AssemblyPartNumber", parameterName: "partNumber", value: "17" })
      );
    });
    mutate.mockRejectedValue(
      new ApolloError({ graphQLErrors: [{ message: "conflict", extensions: { code: "MEMORY_MAP_CONFLICT" } }] })
    );
    const reload = vi.spyOn(client, "query").mockResolvedValue({
      data: { getMemoryMap: { ...document, concurrencyToken: "latest-token" } },
      loading: false,
      networkStatus: 7,
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Save memory map" }));
    expect(await screen.findByText("Server conflict. Your unsaved draft is preserved.")).toBeInTheDocument();
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(true);
    expect(reload).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Reload memory map" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Discard draft and reload?");
    const dialog = screen.getByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitForElementToBeRemoved(dialog);
    expect(reload).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Reload memory map" }));
    await user.click(screen.getByRole("button", { name: "Discard and reload" }));
    await waitFor(() => expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(false));
    expect(store.getState().Editor.present.pristineMemoryMap?.concurrencyToken).toBe("latest-token");
  });

  it("warns on beforeunload only while dirty and blocks pending navigation", async () => {
    const { store } = setup();
    const clean = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(clean);
    expect(clean.defaultPrevented).toBe(false);
    act(() => {
      store.dispatch(
        EditorActions.modifyValue({ commandName: "AssemblyPartNumber", parameterName: "partNumber", value: "17" })
      );
    });
    const dirty = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirty);
    expect(dirty.defaultPrevented).toBe(true);
    mutate.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Save memory map" }));
    await user.click(screen.getByText("Leave editor"));
    expect(await screen.findByRole("dialog")).toHaveTextContent("Wait for Save to finish");
    expect(screen.getByRole("button", { name: /^Discard$/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save and leave" })).toBeDisabled();
  });

  it("loads a version-only identity change, rejects mismatched responses, and preserves same-map drafts", async () => {
    const { store, router, document } = setup();
    const next = { ...document, version: 5 };
    getMap.mockReturnValue(next);
    act(() => {
      store.dispatch(
        EditorActions.modifyValue({ commandName: "AssemblyPartNumber", parameterName: "partNumber", value: "17" })
      );
    });
    expect(store.getState().Editor.present.memoryMap?.version).toBe(4);
    getMap.mockReturnValue(document);
    act(() => {
      store.dispatch(EditorActions.setDisplayFormat("BINARY"));
    });
    expect(store.getState().Editor.present.memoryMap?.commands.AssemblyPartNumber.parameters.partNumber.value).toBe(
      "17"
    );
    // Explicit discard is required for the identity change.
    getMap.mockReturnValue(next);
    await act(async () => {
      await router.navigate("/305-0195-000/BBB/5");
    });
    await userEvent.click(screen.getByRole("button", { name: /^Discard$/ }));
    await waitFor(() => expect(store.getState().Editor.present.memoryMap?.version).toBe(5));
    expect(store.getState().Editor.past).toHaveLength(0);
  });
});
