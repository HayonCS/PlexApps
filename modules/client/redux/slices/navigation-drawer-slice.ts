import { createSlice } from "@reduxjs/toolkit";
import { ActionType } from "../types";
import { State } from "../store";

export type NavigationDrawerState = {
  drawerOpen: boolean;
  bugReportDialogOpen: boolean;
  changelogDialogOpen: boolean;
};

const initialNavigationDrawerState: NavigationDrawerState = {
  drawerOpen: false,
  bugReportDialogOpen: false,
  changelogDialogOpen: false,
};

export const navigationDrawerSlice = createSlice({
  name: "navigation drawer",
  initialState: initialNavigationDrawerState,
  reducers: {
    setDrawerOpen: (state, action) => {
      return {
        ...state,
        drawerOpen: action.payload,
      };
    },
    setChangelogDialogOpen: (state, action) => {
      return {
        ...state,
        changelogDialogOpen: action.payload,
      };
    },
    setBugReportDialogOpen: (state, action) => {
      return {
        ...state,
        bugReportDialogOpen: action.payload,
      };
    },
  },
});

export const NavigationDrawerActions = navigationDrawerSlice.actions;
export type NavigationDrawerActionsType = ActionType<typeof NavigationDrawerActions>;

export const NavigationDrawerSelectors = {
  drawerOpen: (state: State) => state.NavigationDrawer.drawerOpen,
  bugReportDialogOpen: (state: State) => state.NavigationDrawer.bugReportDialogOpen,
  changelogDialogOpen: (state: State) => state.NavigationDrawer.changelogDialogOpen,
};
