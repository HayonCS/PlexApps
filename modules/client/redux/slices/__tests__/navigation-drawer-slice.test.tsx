import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "../../store";
import { NavigationDrawerActions, NavigationDrawerSelectors, navigationDrawerSlice } from "../navigation-drawer-slice";

describe("Navigation Drawer Slice", () => {
  describe("Reducer", () => {
    it("should return the initial state", () => {
      const initialState = navigationDrawerSlice.reducer(undefined, { type: "" });
      expect(initialState).toEqual({
        drawerOpen: false,
        changelogDialogOpen: false,
        bugReportDialogOpen: false,
      });
    });

    it("should handle setDrawerOpen", () => {
      const initialState = {
        drawerOpen: false,
        changelogDialogOpen: false,
        bugReportDialogOpen: false,
      };

      // Test setting to true
      const stateTrue = navigationDrawerSlice.reducer(initialState, NavigationDrawerActions.setDrawerOpen(true));
      expect(stateTrue).toEqual({
        drawerOpen: true,
        changelogDialogOpen: false,
        bugReportDialogOpen: false,
      });

      // Test setting to false
      const stateFalse = navigationDrawerSlice.reducer(stateTrue, NavigationDrawerActions.setDrawerOpen(false));
      expect(stateFalse).toEqual({
        drawerOpen: false,
        changelogDialogOpen: false,
        bugReportDialogOpen: false,
      });
    });

    it("should handle setChangelogDialogOpen", () => {
      const initialState = {
        drawerOpen: false,
        changelogDialogOpen: false,
        bugReportDialogOpen: false,
      };

      // Test setting to true
      const stateTrue = navigationDrawerSlice.reducer(
        initialState,
        NavigationDrawerActions.setChangelogDialogOpen(true)
      );
      expect(stateTrue).toEqual({
        drawerOpen: false,
        changelogDialogOpen: true,
        bugReportDialogOpen: false,
      });

      // Test setting to false
      const stateFalse = navigationDrawerSlice.reducer(
        stateTrue,
        NavigationDrawerActions.setChangelogDialogOpen(false)
      );
      expect(stateFalse).toEqual({
        drawerOpen: false,
        changelogDialogOpen: false,
        bugReportDialogOpen: false,
      });
    });

    it("should handle setBugReportDialogOpen", () => {
      const initialState = {
        drawerOpen: false,
        changelogDialogOpen: false,
        bugReportDialogOpen: false,
      };

      // Test setting to true
      const stateTrue = navigationDrawerSlice.reducer(
        initialState,
        NavigationDrawerActions.setBugReportDialogOpen(true)
      );
      expect(stateTrue).toEqual({
        drawerOpen: false,
        changelogDialogOpen: false,
        bugReportDialogOpen: true,
      });

      // Test setting to false
      const stateFalse = navigationDrawerSlice.reducer(
        stateTrue,
        NavigationDrawerActions.setBugReportDialogOpen(false)
      );
      expect(stateFalse).toEqual({
        drawerOpen: false,
        changelogDialogOpen: false,
        bugReportDialogOpen: false,
      });
    });
  });

  describe("Selectors", () => {
    const store = configureStore({
      reducer: createRootReducer(),
      preloadedState: {
        NavigationDrawer: {
          drawerOpen: true,
          changelogDialogOpen: true,
          bugReportDialogOpen: true,
        },
      },
    });

    it("should select drawerOpen state", () => {
      const drawerOpen = NavigationDrawerSelectors.drawerOpen(store.getState());
      expect(drawerOpen).toBe(true);
    });

    it("should select changelogDialogOpen state", () => {
      const changelogDialogOpen = NavigationDrawerSelectors.changelogDialogOpen(store.getState());
      expect(changelogDialogOpen).toBe(true);
    });

    it("should select bugReportDialogOpen state", () => {
      const bugReportDialogOpen = NavigationDrawerSelectors.bugReportDialogOpen(store.getState());
      expect(bugReportDialogOpen).toBe(true);
    });
  });

  describe("Integration", () => {
    const store = configureStore({
      reducer: createRootReducer(),
    });

    it("should update and select drawer state", () => {
      // Initial state check
      expect(NavigationDrawerSelectors.drawerOpen(store.getState())).toBe(false);

      // Dispatch action to change state
      store.dispatch(NavigationDrawerActions.setDrawerOpen(true));

      // Check if state was updated
      expect(NavigationDrawerSelectors.drawerOpen(store.getState())).toBe(true);
    });

    it("should update and select changelog dialog state", () => {
      // Initial state check
      expect(NavigationDrawerSelectors.changelogDialogOpen(store.getState())).toBe(false);

      // Dispatch action to change state
      store.dispatch(NavigationDrawerActions.setChangelogDialogOpen(true));

      // Check if state was updated
      expect(NavigationDrawerSelectors.changelogDialogOpen(store.getState())).toBe(true);
    });
    it("should update and select bug report dialog state", () => {
      // Initial state check
      expect(NavigationDrawerSelectors.bugReportDialogOpen(store.getState())).toBe(false);

      // Dispatch action to change state
      store.dispatch(NavigationDrawerActions.setBugReportDialogOpen(true));

      // Check if state was updated
      expect(NavigationDrawerSelectors.bugReportDialogOpen(store.getState())).toBe(true);
    });
  });
});
