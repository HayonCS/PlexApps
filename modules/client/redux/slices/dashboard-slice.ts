import { createSlice } from "@reduxjs/toolkit";
import { ActionType } from "../types";
import { State } from "../store";
import { CurrentLibraryFilterOptions } from "modules/core/types";

export type DashboardState = {
  currentLibraryFilters: CurrentLibraryFilterOptions[];
};

const initialDashboardState: DashboardState = {
  currentLibraryFilters: [],
};

export const dashboardSlice = createSlice({
  name: "Dashboard",
  initialState: initialDashboardState,
  reducers: {
    setCurrentLibraryFilters: (state, action) => {
      return {
        ...state,
        currentLibraryFilters: action.payload,
      };
    },
  },
});

export const DashboardActions = dashboardSlice.actions;
export type DashboardActionsType = ActionType<typeof DashboardActions>;

export const DashboardSelectors = {
  currentLibraryFilters: (state: State) => state.Dashboard.currentLibraryFilters,
};
