import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { render, screen, waitFor, within } from "@testing-library/react";
import { createRootReducer } from "modules/client/redux/store";
import { configureStore } from "@reduxjs/toolkit";
import { EditorToolbar } from "../EditorToolbar";
import {
  AuthenticatedAndMemoryMapLoadedState,
  AuthenticatedAndReadOnlyMemoryMapLoadedState,
} from "modules/client/test-helpers/state/authenticated-memorymap-loaded-state";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndMemoryMapLoadedState,
});
const EditorToolbarProvider = mockProvider({
  reduxStore: store,
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
});

describe("Editor Toolbar", () => {
  let editorToolbar: HTMLElement;

  beforeEach(async () => {
    render(
      <EditorToolbarProvider>
        <EditorToolbar />
      </EditorToolbarProvider>
    );

    editorToolbar = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("editor-toolbar");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(editorToolbar).toBeInTheDocument();
    expect(editorToolbar).toBeVisible();
  });

  it("Has the correct memory map text.", async () => {
    expect(editorToolbar).toHaveTextContent("305-0195-000 / BBB / 4");
  });

  it("Has an edit icon to show it is editable.", async () => {
    const editIcon = within(editorToolbar).getByTestId("EditIcon");
    expect(editIcon).toBeInTheDocument();
    expect(editIcon).toBeVisible();
  });
});

const readOnlyStore = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndReadOnlyMemoryMapLoadedState,
});
const EditorToolbarReadOnlyProvider = mockProvider({
  reduxStore: readOnlyStore,
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
});

describe("Editor Toolbar - Read Only", () => {
  let editorToolbar: HTMLElement;

  beforeEach(async () => {
    render(
      <EditorToolbarReadOnlyProvider>
        <EditorToolbar />
      </EditorToolbarReadOnlyProvider>
    );

    editorToolbar = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("editor-toolbar");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(editorToolbar).toBeInTheDocument();
    expect(editorToolbar).toBeVisible();
  });

  it("Has the correct memory map text.", async () => {
    expect(editorToolbar).toHaveTextContent("305-0195-000 / BBB / 4");
  });

  it("Has an read only icon to show it is read only.", async () => {
    const editIcon = within(editorToolbar).getByTestId("EditOffIcon");
    expect(editIcon).toBeInTheDocument();
    expect(editIcon).toBeVisible();
  });
});
