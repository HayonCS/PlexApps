import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import { ActionCreators } from "redux-undo";
import { createRootReducer, State } from "modules/client/redux/store";
import { EditorActions, EditorSelectors } from "../editor-slice";
import MEMORYMAP_FOR_TESTING from "modules/client/test-helpers/memorymap";

const makeStore = (preloadedState?: Partial<State>) => configureStore({ reducer: createRootReducer(), preloadedState });
const change = (value: string) =>
  EditorActions.modifyValue({ commandName: "AssemblyPartNumber", parameterName: "partNumber", value });

describe("explicit Save baseline", () => {
  it("compares editable content, not references, and becomes clean after edit-back", () => {
    const store = makeStore();
    store.dispatch(EditorActions.memoryMapLoaded({ memoryMap: MEMORYMAP_FOR_TESTING }));
    store.dispatch(change("0"));
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(false);
    store.dispatch(change("17"));
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(true);
    store.dispatch(change("0"));
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(false);
    store.dispatch(EditorActions.setDisplayFormat("BINARY"));
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(false);
  });

  it("preserves both clean and dirty JSON session restores and missing-token drafts", () => {
    const store = makeStore();
    store.dispatch(EditorActions.memoryMapLoaded({ memoryMap: MEMORYMAP_FOR_TESTING }));
    expect(
      EditorSelectors.isMemoryMapModified(makeStore(JSON.parse(JSON.stringify(store.getState()))).getState())
    ).toBe(false);
    store.dispatch(change("17"));
    const restored = JSON.parse(JSON.stringify(store.getState()));
    delete restored.Editor.present.pristineMemoryMap.concurrencyToken;
    delete restored.Editor.present.memoryMap.concurrencyToken;
    const restoredStore = makeStore(restored);
    expect(EditorSelectors.isMemoryMapModified(restoredStore.getState())).toBe(true);
    expect(EditorSelectors.hasConcurrencyToken(restoredStore.getState())).toBe(false);
    expect(
      restoredStore.getState().Editor.present.memoryMap?.commands.AssemblyPartNumber.parameters.partNumber.value
    ).toBe("17");
  });

  it("tracks operation, override, and tester edits in undo and resets on confirmed checkpoint", () => {
    const store = makeStore();
    store.dispatch(EditorActions.memoryMapLoaded({ memoryMap: MEMORYMAP_FOR_TESTING }));
    const edits = [
      EditorActions.modifyOperation({ commandName: "AssemblyPartNumber", stationName: "eol", operation: "OP_WRITE" }),
      EditorActions.modifyPartNumberOverride({
        commandName: "AssemblyPartNumber",
        parameterName: "partNumber",
        partNumber: "605-1346-000",
        overrideValue: "19",
      }),
      EditorActions.updateTesters({ testers: {} }),
    ];
    for (const edit of edits) {
      const before = store.getState().Editor.present.memoryMap;
      store.dispatch(edit);
      expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(true);
      store.dispatch(ActionCreators.undo());
      expect(store.getState().Editor.present.memoryMap).toEqual(before);
      store.dispatch(ActionCreators.redo());
    }
    store.dispatch(
      EditorActions.memoryMapLoaded({
        memoryMap: { ...store.getState().Editor.present.memoryMap, concurrencyToken: "saved-token" },
      })
    );
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(false);
    expect(store.getState().Editor.past).toHaveLength(0);
    expect(store.getState().Editor.future).toHaveLength(0);
    store.dispatch(change("20"));
    store.dispatch(ActionCreators.undo());
    expect(EditorSelectors.isMemoryMapModified(store.getState())).toBe(false);
  });
});
