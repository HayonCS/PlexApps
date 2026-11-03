import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { RecentMemoryMapMocks } from "modules/client/test-helpers/mocks/recent-memory-map-mocks";
import { AuthenticatedAndMemoryMapLoadedState } from "modules/client/test-helpers/state/authenticated-memorymap-loaded-state";
import { createRootReducer } from "modules/client/redux/store";
import { configureStore } from "@reduxjs/toolkit";
import { userEvent } from "@storybook/test";
import { DataGridPremium } from "@mui/x-data-grid-premium";
import { MemoryMapLibraryToolbar } from "../MemoryMapLibraryToolbar";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndMemoryMapLoadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
    }),
});

const FilterButtonGroupProvider = mockProvider({
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
  reduxStore: store,
});

describe("Filter Button Group", () => {
  let filterButtonGroup: HTMLElement;
  const user = userEvent.setup();

  beforeEach(async () => {
    render(
      <FilterButtonGroupProvider>
        <MockedProvider mocks={[...RecentMemoryMapMocks]}>
          <DataGridPremium columns={[]} showToolbar={true} slots={{ toolbar: MemoryMapLibraryToolbar }} />
        </MockedProvider>
      </FilterButtonGroupProvider>
    );

    filterButtonGroup = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("filter-button-group");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(filterButtonGroup).toBeInTheDocument();
    expect(filterButtonGroup).toBeVisible();
  });

  it("Applies the working copy filter state change when clicked.", async () => {
    const workingCopyFilterButton = screen.getByTestId("working-copy-filter-button");

    expect(workingCopyFilterButton).toBeInTheDocument();
    expect(workingCopyFilterButton).toBeVisible();

    let workingCopyFilterState = store.getState().Dashboard.currentLibraryFilters;

    expect(workingCopyFilterState).toEqual([]);

    await React.act(async () => {
      await user.click(workingCopyFilterButton);
    });

    workingCopyFilterState = store.getState().Dashboard.currentLibraryFilters;
    expect(workingCopyFilterState).toEqual(["WORKING COPY"]);
  });

  it("Clears the working copy filter state when unclicked.", async () => {
    const workingCopyFilterButton = screen.getByTestId("working-copy-filter-button");

    expect(workingCopyFilterButton).toBeInTheDocument();
    expect(workingCopyFilterButton).toBeVisible();

    let workingCopyFilterState = store.getState().Dashboard.currentLibraryFilters;

    expect(workingCopyFilterState).toEqual(["WORKING COPY"]);

    await React.act(async () => {
      await user.click(workingCopyFilterButton);
    });

    workingCopyFilterState = store.getState().Dashboard.currentLibraryFilters;
    expect(workingCopyFilterState).toEqual([]);
  });

  it("Applies the prod release filter state change when clicked.", async () => {
    const prodReleaseFilterButton = screen.getByTestId("prod-release-filter-button");

    expect(prodReleaseFilterButton).toBeInTheDocument();
    expect(prodReleaseFilterButton).toBeVisible();

    let prodReleaseFilterState = store.getState().Dashboard.currentLibraryFilters;

    expect(prodReleaseFilterState).toEqual([]);

    await React.act(async () => {
      await user.click(prodReleaseFilterButton);
    });

    prodReleaseFilterState = store.getState().Dashboard.currentLibraryFilters;
    expect(prodReleaseFilterState).toEqual(["PRODUCTION RELEASE"]);
  });

  it("Clears the prod release filter state when unclicked.", async () => {
    const prodReleaseFilterButton = screen.getByTestId("prod-release-filter-button");

    expect(prodReleaseFilterButton).toBeInTheDocument();
    expect(prodReleaseFilterButton).toBeVisible();

    let prodReleaseFilterState = store.getState().Dashboard.currentLibraryFilters;

    expect(prodReleaseFilterState).toEqual(["PRODUCTION RELEASE"]);

    await React.act(async () => {
      await user.click(prodReleaseFilterButton);
    });

    prodReleaseFilterState = store.getState().Dashboard.currentLibraryFilters;
    expect(prodReleaseFilterState).toEqual([]);
  });
});
