import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { ApolloClient, ApolloError, ApolloProvider, InMemoryCache } from "@apollo/client";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { EditorActions, EditorSelectors } from "modules/client/redux/slices/editor-slice";
import MEMORYMAP_FOR_TESTING from "modules/client/test-helpers/memorymap";
import { useSaveMemoryMap } from "../useSaveMemoryMap";

const { mutate, show } = vi.hoisted(() => ({ mutate: vi.fn(), show: vi.fn() }));
vi.mock("@toolpad/core", () => ({ useNotifications: () => ({ show }) }));
vi.mock("modules/client/graphql/types.gen", async (importOriginal) => ({
  ...(await importOriginal<typeof import("modules/client/graphql/types.gen")>()),
  useSaveMemoryMapMutation: () => [mutate],
}));

const setup = () => {
  const store = configureStore({ reducer: createRootReducer() });
  store.dispatch(EditorActions.memoryMapLoaded({ memoryMap: MEMORYMAP_FOR_TESTING }));
  store.dispatch(EditorActions.setReadOnly(false));
  const client = new ApolloClient({ cache: new InMemoryCache() });
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <ApolloProvider client={client}>
      <Provider store={store}>{children}</Provider>
    </ApolloProvider>
  );
  return { store, client, ...renderHook(useSaveMemoryMap, { wrapper }) };
};
const change = (value: string) =>
  EditorActions.modifyValue({ commandName: "AssemblyPartNumber", parameterName: "partNumber", value });

describe("Save coordinator", () => {
  beforeEach(() => {
    mutate.mockReset();
    show.mockReset();
  });

  it("awaits commit, reads the latest store, saves once, and checkpoints canonical content/token", async () => {
    const { store, result } = setup();
    const canonical = structuredClone(MEMORYMAP_FOR_TESTING);
    canonical.concurrencyToken = "new-token";
    canonical.commands.AssemblyPartNumber.parameters.partNumber.value = "42";
    mutate.mockResolvedValue({ data: { saveMemoryMap: canonical } });
    let release!: () => void;
    result.current.registerCommit(
      () =>
        new Promise<void>((resolve) => {
          release = () => {
            store.dispatch(change("42"));
            resolve();
          };
        })
    );
    let save!: Promise<boolean>;
    act(() => {
      save = result.current.save();
    });
    expect(result.current.pending).toBe(true);
    expect(await result.current.save()).toBe(false);
    expect(mutate).not.toHaveBeenCalled();
    await act(async () => {
      release();
      expect(await save).toBe(true);
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0].variables.expectedToken).toBe("test-server-token");
    expect(mutate.mock.calls[0][0].variables.document.commands.AssemblyPartNumber.parameters.partNumber.value).toBe(
      "42"
    );
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(false);
    expect(store.getState().Editor.present.pristineMemoryMap?.concurrencyToken).toBe("new-token");
    expect(store.getState().Editor.past).toHaveLength(0);
  });

  it.each(["network", "conflict", "validation"])("preserves edits/history after %s failure", async (kind) => {
    const { store, result } = setup();
    store.dispatch(change("9"));
    const before = store.getState().Editor;
    mutate.mockRejectedValue(
      kind === "network"
        ? new Error("offline")
        : new ApolloError({
            graphQLErrors: [
              {
                message: "rejected",
                extensions: { code: kind === "conflict" ? "MEMORY_MAP_CONFLICT" : "BAD_USER_INPUT" },
              },
            ],
          })
    );
    await act(async () => {
      expect(await result.current.save()).toBe(false);
    });
    expect(store.getState().Editor).toEqual(before);
    expect(result.current.pending).toBe(false);
    expect(result.current.conflict).toBe(kind === "conflict");
    expect(show).toHaveBeenCalled();
  });

  it("never silently supplies a token for a restored legacy draft", async () => {
    const { store, result } = setup();
    const legacy = { ...MEMORYMAP_FOR_TESTING, concurrencyToken: undefined };
    store.dispatch(EditorActions.memoryMapLoaded({ memoryMap: legacy }));
    store.dispatch(change("9"));
    await act(async () => {
      expect(await result.current.save()).toBe(false);
    });
    expect(mutate).not.toHaveBeenCalled();
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(true);
    expect(show.mock.calls[0][0]).toContain("no server token");
  });

  it("does not overwrite a different map after a late response", async () => {
    const { store, result } = setup();
    store.dispatch(change("9"));
    let respond!: (value: unknown) => void;
    mutate.mockImplementation(
      () =>
        new Promise((resolve) => {
          respond = resolve;
        })
    );
    let save!: Promise<boolean>;
    await act(async () => {
      save = result.current.save();
      await Promise.resolve();
    });
    const other = { ...MEMORYMAP_FOR_TESTING, version: 5 };
    store.dispatch(EditorActions.memoryMapLoaded({ memoryMap: other }));
    await act(async () => {
      respond({ data: { saveMemoryMap: MEMORYMAP_FOR_TESTING } });
      await save;
    });
    expect(store.getState().Editor.present.memoryMap?.version).toBe(5);
  });
});
