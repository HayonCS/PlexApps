import * as React from "react";
import { useSelector, useStore } from "react-redux";
import { ApolloError, useApolloClient } from "@apollo/client";
import { useNotifications } from "@toolpad/core";
import { GetMemoryMapDocument, useSaveMemoryMapMutation } from "modules/client/graphql/types.gen";
import { State } from "modules/client/redux/store";
import { EditorActions, EditorSelectors, persistableMemoryMap } from "modules/client/redux/slices/editor-slice";
import { MemoryMapDocument } from "modules/core/schemas/memory-map.gen";

type MemoryMapIdentity = Pick<MemoryMapDocument, "name" | "bomRevision" | "version">;
export const sameMemoryMap = (a: MemoryMapIdentity | null, b: MemoryMapIdentity | null) =>
  Boolean(a && b && a.name === b.name && a.bomRevision === b.bomRevision && a.version === b.version);

export const useSaveMemoryMap = () => {
  const store = useStore<State>();
  const client = useApolloClient();
  const notifications = useNotifications();
  const [mutate] = useSaveMemoryMapMutation();
  const [pending, setPending] = React.useState(false);
  const [conflict, setConflict] = React.useState(false);
  const currentMap = useSelector(EditorSelectors.currentMemoryMap);
  React.useEffect(() => {
    setConflict(false);
  }, [currentMap?.name, currentMap?.bomRevision, currentMap?.version]);
  const inFlight = React.useRef(false);
  const commit = React.useRef<(() => Promise<void>) | null>(null);
  const registerCommit = React.useCallback((fn: () => Promise<void>) => {
    commit.current = fn;
    return () => {
      if (commit.current === fn) commit.current = null;
    };
  }, []);

  const save = React.useCallback(async () => {
    if (inFlight.current || EditorSelectors.readOnly(store.getState())) return false;
    const initiatingMap = EditorSelectors.currentMemoryMap(store.getState());
    if (!initiatingMap) return false;
    inFlight.current = true;
    setPending(true);
    try {
      // DataGrid stop-edit is asynchronous; snapshot only after its Redux dispatch.
      await commit.current?.();
      const state = store.getState();
      const document = EditorSelectors.currentMemoryMap(state);
      if (!sameMemoryMap(initiatingMap, document) || !document) return false;
      const expectedToken = state.Editor.present.pristineMemoryMap?.concurrencyToken;
      if (!expectedToken) {
        throw new Error(
          "This restored draft has no server token. Reload the memory map before saving (reload discards the draft)."
        );
      }
      if (!EditorSelectors.isMemoryMapModified(state)) return true;
      const variables = { memoryMapName: document.name, bomRevision: document.bomRevision, version: document.version };
      const result = await mutate({
        variables: { ...variables, expectedToken, document: persistableMemoryMap(document) },
      });
      const saved = result.data?.saveMemoryMap;
      if (!saved) throw new Error("The server did not confirm the save.");
      if (!sameMemoryMap(document, saved)) throw new Error("The server returned a different memory map.");
      client.writeQuery({ query: GetMemoryMapDocument, variables, data: { getMemoryMap: saved } });
      if (sameMemoryMap(document, EditorSelectors.currentMemoryMap(store.getState()))) {
        store.dispatch(EditorActions.memoryMapLoaded({ memoryMap: saved }));
        setConflict(false);
      }
      return true;
    } catch (error) {
      const isConflict =
        error instanceof ApolloError && error.graphQLErrors.some((e) => e.extensions?.code === "MEMORY_MAP_CONFLICT");
      if (sameMemoryMap(initiatingMap, EditorSelectors.currentMemoryMap(store.getState()))) {
        if (isConflict) setConflict(true);
        notifications.show(
          isConflict
            ? "This memory map changed on the server. Your draft is intact. Reload explicitly to discard it and load the current version."
            : `Save failed: ${error instanceof Error ? error.message : String(error)}`,
          { severity: "error" }
        );
      }
      return false;
    } finally {
      // The synchronous inFlight guard admits only one owner of this flag.
      // eslint-disable-next-line require-atomic-updates
      inFlight.current = false;
      setPending(false);
    }
  }, [client, mutate, notifications, store]);

  return { pending, conflict, save, registerCommit, clearConflict: () => setConflict(false) };
};
