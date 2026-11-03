import * as React from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { configureStore } from "@reduxjs/toolkit";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { createRootReducer } from "modules/client/redux/store";
import { Actions } from "modules/client/redux/actions";

vi.mock("modules/../CHANGELOG.md?raw", () => ({
  default: `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# 0.0.1 - 2024-09-10

## Fixed

- Fixed critical bug in memory map loading.

## Changed

- Initial commit of the baseline template for new apps. This will be the starting point for OpsManager.

## Added

- Added new user settings feature.
`,
}));

// Import after mock is set up
import { ChangeLogDialog } from "../ChangeLogDialog";

const createStore = (changelogDialogOpen: boolean) =>
  configureStore({
    reducer: createRootReducer(),
    preloadedState: {
      NavigationDrawer: {
        drawerOpen: false,
        bugReportDialogOpen: false,
        changelogDialogOpen,
      },
    },
  });

const renderWithProvider = (store: ReturnType<typeof createStore>) => {
  const MockProvider = mockProvider({ reduxStore: store });
  return render(
    <MockProvider>
      <ChangeLogDialog />
    </MockProvider>
  );
};

describe("ChangeLogDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render when closed", () => {
    const store = createStore(false);
    renderWithProvider(store);
    expect(screen.queryByText(/Operations Manager/)).not.toBeInTheDocument();
  });

  it("renders dialog when open", async () => {
    const store = createStore(true);
    renderWithProvider(store);

    await waitFor(() => {
      expect(screen.getByText(/Operations Manager/)).toBeInTheDocument();
    });
  });

  it("displays changelog content", async () => {
    const store = createStore(true);
    renderWithProvider(store);

    await waitFor(() => {
      expect(screen.getByText(/Initial commit of the baseline template/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Fixed critical bug in memory map loading/)).toBeInTheDocument();
    expect(screen.getByText(/Added new user settings feature/)).toBeInTheDocument();
  });

  it("extracts and displays version number in title", async () => {
    const store = createStore(true);
    renderWithProvider(store);

    await waitFor(() => {
      expect(screen.getByText(/Version 0\.0\.1/)).toBeInTheDocument();
    });
  });

  it("dispatches close action when Close button is clicked", async () => {
    const store = createStore(true);
    renderWithProvider(store);

    const closeButton = await screen.findByRole("button", { name: /close/i });
    await userEvent.click(closeButton);

    expect(store.getState().NavigationDrawer.changelogDialogOpen).toBe(false);
  });

  it("dispatches close action when clicking outside dialog", async () => {
    const store = createStore(true);
    const { container } = renderWithProvider(store);

    await waitFor(() => {
      expect(screen.getByText(/Initial commit/)).toBeInTheDocument();
    });

    // Click on backdrop
    const backdrop = container.querySelector(".MuiBackdrop-root");
    if (backdrop) {
      await userEvent.click(backdrop);
      expect(store.getState().NavigationDrawer.changelogDialogOpen).toBe(false);
    }
  });

  it("only processes changelog when dialog is opened", async () => {
    const store = createStore(false);
    renderWithProvider(store);

    // Dialog is closed, content should not be visible
    expect(screen.queryByText(/Initial commit/)).not.toBeInTheDocument();

    await act(async () => {
      store.dispatch(Actions.NavigationDrawerActions.setChangelogDialogOpen(true));
    });

    await waitFor(() => {
      expect(screen.getByText(/Initial commit/)).toBeInTheDocument();
    });
  });
});
