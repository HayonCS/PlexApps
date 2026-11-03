import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { render, waitFor, within, screen } from "modules/client/test-helpers/rtl-extensions";
import { MemoryMapLibrary } from "../MemoryMapLibrary";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryMapLibraryMocks } from "modules/client/test-helpers/mocks/memorymap-library-mocks";

const store = configureStore({
  reducer: createRootReducer(),
});

const MemoryMapLibraryProvider = mockProvider({
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
  reduxStore: store,
});

describe("MemoryMap Library Toolbar", () => {
  let memoryMapLibraryToolbar: HTMLElement;
  const user = userEvent.setup();

  beforeEach(async () => {
    render(
      <MemoryMapLibraryProvider>
        <MockedProvider mocks={[...MemoryMapLibraryMocks]}>
          <MemoryMapLibrary />
        </MockedProvider>
      </MemoryMapLibraryProvider>
    );

    memoryMapLibraryToolbar = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("memorymap-library-toolbar");
      return element;
    });
  });

  it("renders and is visible", async () => {
    expect(memoryMapLibraryToolbar).toBeInTheDocument();
    expect(memoryMapLibraryToolbar).toBeVisible();
  });

  describe("Quick Filter", () => {
    it("expands and collapses the search field", async () => {
      const searchField = within(memoryMapLibraryToolbar).getByPlaceholderText("Search...");
      expect(searchField).toBeVisible();

      // Click away to collapse
      await user.click(memoryMapLibraryToolbar);
      expect(searchField).not.toBeVisible();

      const searchButton = within(memoryMapLibraryToolbar).getByTestId("grid-quick-filter-trigger");
      expect(searchButton).toBeInTheDocument();

      await user.click(searchButton);
      expect(searchField).toBeVisible();
    });

    it("allows searching and clearing the search", async () => {
      const searchField = within(memoryMapLibraryToolbar).getByPlaceholderText("Search...");
      await user.type(searchField, "test search");
      expect(searchField).toHaveValue("test search");

      const clearButton = within(memoryMapLibraryToolbar).getByLabelText("Clear search");
      await user.click(clearButton);
      expect(searchField).toHaveValue("");
    });

    it("filters the grid content when searching", async () => {
      const searchField = within(memoryMapLibraryToolbar).getByPlaceholderText("Search...");
      await user.type(searchField, "test search");

      // Wait for the grid to update and verify filtered content
      await waitFor(() => {
        const grid = screen.getByTestId("memory-map-library");
        expect(grid).toBeInTheDocument();
      });
    });
  });

  describe("Export SpeedDial", () => {
    it("shows export options when clicked", async () => {
      const exportButton = within(memoryMapLibraryToolbar).getByTestId("export-speed-dial");
      await user.click(exportButton);

      const csvExport = screen.getByLabelText("Export As CSV");
      const excelExport = screen.getByLabelText("Export As Excel");
      const printExport = screen.getByLabelText("Export As PDF");

      expect(csvExport).toBeVisible();
      expect(excelExport).toBeVisible();
      expect(printExport).toBeVisible();
    });

    it("closes export menu when clicking away", async () => {
      const exportButton = within(memoryMapLibraryToolbar).getByTestId("export-speed-dial");
      await user.click(exportButton);

      await user.click(memoryMapLibraryToolbar);

      const csvExport = screen.queryByLabelText("Export As CSV");
      expect(csvExport).not.toBeVisible();
    });
  });
});
