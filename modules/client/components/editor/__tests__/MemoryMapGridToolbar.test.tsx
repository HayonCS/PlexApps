import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { AuthenticatedAndMemoryMapLoadedState } from "modules/client/test-helpers/state/authenticated-memorymap-loaded-state";
import { render, waitFor, within, screen } from "modules/client/test-helpers/rtl-extensions";
import MemoryMapGrid from "../MemoryMapGrid";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndMemoryMapLoadedState,
});

const MemoryMapGridToolbarProvider = mockProvider({
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
  reduxStore: store,
});

describe("MemoryMap Grid Toolbar", () => {
  let memoryMapGridToolbar: HTMLElement;
  const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

  beforeEach(async () => {
    render(
      <MemoryMapGridToolbarProvider>
        <MemoryMapGrid />
      </MemoryMapGridToolbarProvider>
    );

    memoryMapGridToolbar = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("memorymap-grid-toolbar");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(memoryMapGridToolbar).toBeInTheDocument();
    expect(memoryMapGridToolbar).toBeVisible();
  });

  describe("Quick Filter", () => {
    it("expands and collapses the search field", async () => {
      const searchButton = within(memoryMapGridToolbar).getByTestId("grid-quick-filter-trigger");
      expect(searchButton).toBeInTheDocument();

      await user.click(searchButton);
      const searchField = within(memoryMapGridToolbar).getByPlaceholderText("Search...");
      expect(searchField).toBeVisible();

      // Click away to collapse
      await user.click(memoryMapGridToolbar);
      expect(searchField).not.toBeVisible();
    });

    it("allows searching and clearing the search", async () => {
      const searchButton = within(memoryMapGridToolbar).getByTestId("grid-quick-filter-trigger");
      await user.click(searchButton);

      const searchField = within(memoryMapGridToolbar).getByPlaceholderText("Search...");
      await user.type(searchField, "test search");

      expect(searchField).toHaveValue("test search");

      const clearButton = within(memoryMapGridToolbar).getByLabelText("Clear search");
      await user.click(clearButton);

      expect(searchField).toHaveValue("");
    });
  });

  describe("Display Format Selector", () => {
    it("shows the current display format", () => {
      const formatSelector = within(memoryMapGridToolbar).getByTestId("display-format-selector");
      expect(formatSelector).toBeInTheDocument();
      expect(formatSelector).toBeVisible();
    });

    it("allows changing the display format", async () => {
      const formatSelector = within(memoryMapGridToolbar).getByTestId("display-format-selector");
      await user.click(formatSelector);

      const binaryOption = screen.getByText("BINARY");
      await user.click(binaryOption);

      expect(formatSelector).toHaveTextContent("BINARY");
    });
  });

  describe("Export SpeedDial", () => {
    it("shows export options when clicked", async () => {
      const exportButton = within(memoryMapGridToolbar).getByTestId("export-speed-dial");
      await user.click(exportButton);

      const csvExport = screen.getByLabelText("Export As CSV");
      const excelExport = screen.getByLabelText("Export As Excel");
      const pdfExport = screen.getByLabelText("Export As PDF");

      expect(csvExport).toBeVisible();
      expect(excelExport).toBeVisible();
      expect(pdfExport).toBeVisible();
    });

    it("closes export menu when clicking away", async () => {
      const exportButton = within(memoryMapGridToolbar).getByTestId("export-speed-dial");
      await user.click(exportButton);

      await user.click(memoryMapGridToolbar);

      const csvExport = screen.queryByLabelText("Export As CSV");
      expect(csvExport).not.toBeVisible();
    });
  });

  // describe("Filtered Indicator", () => {
  //   it("does not show the filtered badge by default", () => {
  //     expect(screen.queryByTestId("filtered-indicator")).not.toBeInTheDocument();
  //   });

  //   it("shows the filtered badge when a quick filter search is active", async () => {
  //     const searchField = within(memoryMapGridToolbar).getByPlaceholderText("Search...");
  //     await user.type(searchField, "test");

  //     expect(await screen.findByTestId("filtered-indicator")).toBeInTheDocument();
  //     expect(screen.getByTestId("filtered-indicator")).toHaveTextContent("FILTERED");
  //   });

  //   it("hides the filtered badge when the quick filter is cleared", async () => {
  //     const searchField = within(memoryMapGridToolbar).getByPlaceholderText("Search...");
  //     await user.type(searchField, "test");

  //     expect(await screen.findByTestId("filtered-indicator")).toBeInTheDocument();

  //     const clearButton = within(memoryMapGridToolbar).getByLabelText("Clear search");
  //     await user.click(clearButton);

  //     await waitFor(() => {
  //       expect(screen.queryByTestId("filtered-indicator")).not.toBeInTheDocument();
  //     });
  //   });

  //   it("shows the filtered badge when a column is hidden", async () => {
  //     const columnsButton = screen.getByTestId("columns-panel-trigger");
  //     await user.click(columnsButton);

  //     // Toggle the COMMAND column off
  //     const commandToggle = await screen.findByRole("checkbox", { name: /command/i });
  //     await user.click(commandToggle);

  //     expect(await screen.findByTestId("filtered-indicator")).toBeInTheDocument();
  //     expect(screen.getByTestId("filtered-indicator")).toHaveTextContent("FILTERED");
  //   });

  //   it("hides the filtered badge when a hidden column is re-shown", async () => {
  //     const columnsButton = screen.getByTestId("columns-panel-trigger");
  //     await user.click(columnsButton);

  //     // Hide COMMAND column
  //     const commandToggle = await screen.findByRole("checkbox", { name: /command/i });
  //     await user.click(commandToggle);
  //     expect(await screen.findByTestId("filtered-indicator")).toBeInTheDocument();

  //     // Re-show COMMAND column
  //     await user.click(commandToggle);
  //     await waitFor(() => {
  //       expect(screen.queryByTestId("filtered-indicator")).not.toBeInTheDocument();
  //     });
  //   });
  // });
});
