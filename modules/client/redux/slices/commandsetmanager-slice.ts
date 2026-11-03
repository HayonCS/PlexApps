import { createSlice } from "@reduxjs/toolkit";
import { ActionType } from "../types";
import { State } from "../store";

export type CommandSetManagerState = {
  drawerOpen: boolean;
  selectedCommand: string | null;
};

const initialCommandSetManagerState: CommandSetManagerState = {
  drawerOpen: false,
  selectedCommand: null,
};

export const commandSetManagerSlice = createSlice({
  name: "Command Set Manager",
  initialState: initialCommandSetManagerState,
  reducers: {
    setDrawerOpen: (state, action) => {
      return {
        ...state,
        drawerOpen: action.payload,
      };
    },
    setSelectedCommand: (state, action) => {
      return {
        ...state,
        selectedCommand: action.payload,
      };
    },
  },
});

export const CommandSetManagerActions = commandSetManagerSlice.actions;
export type CommandSetManagerActionsType = ActionType<typeof CommandSetManagerActions>;

export const CommandSetManagerSelectors = {
  drawerOpen: (state: State) => state.CommandSetManager.drawerOpen,
  selectedCommand: (state: State) => state.CommandSetManager.selectedCommand,
};
