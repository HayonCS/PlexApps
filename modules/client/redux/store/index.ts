import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authenticationSlice } from "../slices/authentication-slice";
import { editorSlice } from "../slices/editor-slice";
import { userSettingsSlice } from "../slices/user-settings-slice";
import { navigationDrawerSlice } from "../slices/navigation-drawer-slice";
import { commandSetManagerSlice } from "../slices/commandsetmanager-slice";
import { dashboardSlice } from "../slices/dashboard-slice";
import undoable from "redux-undo";
import { persistStore, persistReducer } from "redux-persist";
import type { PersistConfig } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import hardSet from "redux-persist/es/stateReconciler/hardSet";

//eslint-disable-next-line  @typescript-eslint/no-unused-vars
const logger = (store: any) => (next: any) => (action: any) => {
  let result = next(action);
  return result;
};

export type AppDispatch = typeof store.dispatch;

/**
 * Builds a fresh root reducer instance. `undoable()` closes over mutable history state internally,
 * so every store (including each store created in tests) must get its own reducer instance rather
 * than sharing a single module-level one, or undo/redo history leaks between stores.
 */
export const createRootReducer = () => {
  const editorReducer = undoable(editorSlice.reducer, {
    filter: (action) =>
      [
        "editor/modifyLowLimit",
        "editor/modifyValue",
        "editor/modifyHighLimit",
        "editor/addCommand",
        "editor/removeCommand",
        "editor/modifyOperation",
        "editor/modifyPartNumberOverride",
        "editor/updateTesters",
      ].includes(action.type),
  });
  return combineReducers({
    Authentication: authenticationSlice.reducer,
    Editor: (state: Parameters<typeof editorReducer>[0], action: Parameters<typeof editorReducer>[1]) => {
      const next = editorReducer(state, action);
      if (action.type === "editor/memoryMapLoaded" || action.type === "editor/clearMemoryMap") {
        return { ...next, past: [], future: [], _latestUnfiltered: next.present };
      }
      return next;
    },
    UserSettings: userSettingsSlice.reducer,
    NavigationDrawer: navigationDrawerSlice.reducer,
    CommandSetManager: commandSetManagerSlice.reducer,
    Dashboard: dashboardSlice.reducer,
  });
};

export const rootReducer = createRootReducer();

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: "root",
  storage: storageSession,
  stateReconciler: hardSet,
};

const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(persistConfig, rootReducer);

export type State = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: (gDM) => gDM().concat(logger),
});

export const persistor = persistStore(store);

export const InitialState = {
  ...authenticationSlice.getInitialState(),
  ...editorSlice.getInitialState(),
  ...userSettingsSlice.getInitialState(),
  ...navigationDrawerSlice.getInitialState(),
  ...commandSetManagerSlice.getInitialState(),
  ...dashboardSlice.getInitialState(),
};
