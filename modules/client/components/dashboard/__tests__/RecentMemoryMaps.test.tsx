import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { render, screen, waitFor, within } from "@testing-library/react";
import { RecentMemoryMaps } from "../RecentMemoryMaps";
import { MockedProvider } from "@apollo/client/testing";
import { RecentMemoryMapMocks } from "modules/client/test-helpers/mocks/recent-memory-map-mocks";
import { AuthenticatedAndMemoryMapLoadedState } from "modules/client/test-helpers/state/authenticated-memorymap-loaded-state";
import { createRootReducer } from "modules/client/redux/store";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndMemoryMapLoadedState,
});

const RecentMemoryMapProvider = mockProvider({
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
  reduxStore: store,
});

describe("Recent Memory Map Card", () => {
  describe("With recent memory maps", () => {
    let recentMemoryMaps: HTMLElement;

    beforeEach(async () => {
      render(
        <RecentMemoryMapProvider>
          <MockedProvider mocks={[...RecentMemoryMapMocks]}>
            <RecentMemoryMaps />
          </MockedProvider>
        </RecentMemoryMapProvider>
      );

      recentMemoryMaps = await waitFor<HTMLElement>(async () => {
        const element = screen.getByTestId("recent-memory-maps");
        return element;
      });
    });

    it("Shows up on the screen and is visible.", async () => {
      expect(recentMemoryMaps).toBeInTheDocument();
      expect(recentMemoryMaps).toBeVisible();
    });

    it("Has all of the correct recent memory maps within it.", async () => {
      await waitFor(() => {
        const card1 = within(recentMemoryMaps).getByTestId("recent-memorymap-card-305-0195-000-BBB-4");
        expect(card1).toBeInTheDocument();
        expect(card1).toBeVisible();

        const card2 = within(recentMemoryMaps).getByTestId("recent-memorymap-card-305-1111-000-AAA-2");
        expect(card2).toBeInTheDocument();
        expect(card2).toBeVisible();

        const card3 = within(recentMemoryMaps).getByTestId("recent-memorymap-card-305-1234-000-CCC-3");
        expect(card3).toBeInTheDocument();
        expect(card3).toBeVisible();
      });
    });

    it("Shows the clear button when there are recent memory maps", async () => {
      await waitFor(() => {
        const clearButton = screen.getByTestId("clear-recent-maps-button");
        expect(clearButton).toBeInTheDocument();
        expect(clearButton).toBeVisible();
      });
    });

    it("Container has auto overflow when there are real cards", async () => {
      await waitFor(() => {
        const container = screen.getByTestId("recent-memory-maps");
        const styles = window.getComputedStyle(container);
        expect(styles.overflowX).toBe("auto");
      });
    });
  });

  describe("Without recent memory maps", () => {
    it("Shows placeholder cards when there are no recent memory maps", async () => {
      const emptyRecentMemoryMapMocks = [
        {
          request: {
            query: RecentMemoryMapMocks[0].request.query,
            variables: {
              userName: "bill.brasky",
            },
          },
          result: {
            data: {
              getRecentMemoryMaps: {
                recentMemoryMaps: [],
              },
            },
          },
        },
      ];

      render(
        <RecentMemoryMapProvider>
          <MockedProvider mocks={emptyRecentMemoryMapMocks}>
            <RecentMemoryMaps />
          </MockedProvider>
        </RecentMemoryMapProvider>
      );

      const recentMemoryMapsContainer = await waitFor<HTMLElement>(async () => {
        const element = screen.getByTestId("recent-memory-maps");
        return element;
      });

      await waitFor(() => {
        const placeholderCards = within(recentMemoryMapsContainer).getAllByTestId("placeholder-card");
        expect(placeholderCards.length).toBeGreaterThan(0);
        placeholderCards.forEach((card) => {
          expect(card).toBeInTheDocument();
          expect(card).toBeVisible();
        });
      });
    });

    it("Does not show the clear button when there are no recent memory maps", async () => {
      const emptyRecentMemoryMapMocks = [
        {
          request: {
            query: RecentMemoryMapMocks[0].request.query,
            variables: {
              userName: "bill.brasky",
            },
          },
          result: {
            data: {
              getRecentMemoryMaps: {
                recentMemoryMaps: [],
              },
            },
          },
        },
      ];

      render(
        <RecentMemoryMapProvider>
          <MockedProvider mocks={emptyRecentMemoryMapMocks}>
            <RecentMemoryMaps />
          </MockedProvider>
        </RecentMemoryMapProvider>
      );

      await waitFor(() => {
        const container = screen.getByTestId("recent-memory-maps");
        expect(container).toBeInTheDocument();
      });

      const clearButton = screen.queryByTestId("clear-recent-maps-button");
      expect(clearButton).not.toBeInTheDocument();
    });

    it("Container has hidden overflow when there are only placeholder cards", async () => {
      const emptyRecentMemoryMapMocks = [
        {
          request: {
            query: RecentMemoryMapMocks[0].request.query,
            variables: {
              userName: "bill.brasky",
            },
          },
          result: {
            data: {
              getRecentMemoryMaps: {
                recentMemoryMaps: [],
              },
            },
          },
        },
      ];

      render(
        <RecentMemoryMapProvider>
          <MockedProvider mocks={emptyRecentMemoryMapMocks}>
            <RecentMemoryMaps />
          </MockedProvider>
        </RecentMemoryMapProvider>
      );

      await waitFor(() => {
        const container = screen.getByTestId("recent-memory-maps");
        const styles = window.getComputedStyle(container);
        expect(styles.overflowX).toBe("hidden");
      });
    });
  });
});
