import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { AuthenticatedAndMemoryMapLoadedState } from "modules/client/test-helpers/state/authenticated-memorymap-loaded-state";
import { EditorToolbar } from "./EditorToolbar";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndMemoryMapLoadedState,
});

const StorybookProvider = mockProvider({
  reduxStore: store,
});

export default {
  component: EditorToolbar,

  title: "Editor/Editor Toolbar",
  tags: ["autodocs"],
  args: {},
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <Story />
        </StorybookProvider>
      );
    },
  ],
};

export const Default = {};
