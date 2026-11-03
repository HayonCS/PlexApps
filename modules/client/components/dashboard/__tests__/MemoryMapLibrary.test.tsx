import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryMapLibrary } from "../MemoryMapLibrary";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@storybook/test";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryMapLibraryMocks } from "modules/client/test-helpers/mocks/memorymap-library-mocks";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";

describe("Memory Map Library", () => {
  let memoryMapLibrary: HTMLElement;
  const user = userEvent.setup();

  beforeEach(async () => {
    const store = configureStore({
      reducer: createRootReducer(),
      preloadedState: {
        Authentication: {
          type: "Authenticated",
          user: {
            readOnly: false,
            userName: "bill.brasky",
            distinguishedName: "CN=Brasky\\, Bill,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
            principalName: "bill.brasky@gentex.com",
            employeeNumber: 69,
            firstName: "Bill",
            lastName: "Brasky",
            formattedName: "Brasky, Bill",
            department: "Test and Measurement",
            emailAddress: "bill.brasky@gentex.com",
            mobilePhone: "9895684589",
            gentexPhone: "+1 (616) 7721590 x2345",
            sid: "S-1-5-21-56231545-804616388-477645130-30460",
            pager: "19992",
            manager: "CN=Meyer\\, Oscar,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
          },
        },
      },
    });

    const MemoryMapLibraryProvider = mockProvider({
      initialHistoryStack: "/dashboard",
      logMissingMocks: true,
      reduxStore: store,
      additionalRoutes: [
        {
          path: "/305-0195-000/BBB/4",
          component: <div data-testid={"MemoryMapPage"}>305-0195-000/BBB/4</div>,
        },
      ],
    });
    render(
      <MockedProvider mocks={MemoryMapLibraryMocks}>
        <MemoryMapLibraryProvider>
          <MemoryMapLibrary />
        </MemoryMapLibraryProvider>
      </MockedProvider>
    );

    memoryMapLibrary = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("memory-map-library");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(memoryMapLibrary).toBeInTheDocument();
    expect(memoryMapLibrary).toBeVisible();
  });

  it("Has an export speed dial.", async () => {
    const exportBtn = screen.getByTestId("export-speed-dial");
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).toBeVisible();
  });

  it("Has a search bar.", async () => {
    const searchButton = screen.getByRole("button", { name: "Search" });
    expect(searchButton).toBeInTheDocument();

    const searchInput = screen.getByRole("searchbox");
    await waitFor(() => {
      expect(searchInput).toBeVisible();
    });
  });

  it("Has all of the correct memory maps in it.", async () => {
    const memorymap1 = screen.getByTestId("auto-generated-row-PartNumber/305-0014-000");
    expect(memorymap1).toBeInTheDocument();
    expect(memorymap1).toBeVisible();

    const memorymap2 = screen.getByTestId("auto-generated-row-PartNumber/305-0191-002");
    expect(memorymap2).toBeInTheDocument();
    expect(memorymap2).toBeVisible();

    const memorymap3 = screen.getByTestId("auto-generated-row-PartNumber/305-0191-002");
    expect(memorymap3).toBeInTheDocument();
    expect(memorymap3).toBeVisible();
  });

  it("Allows you to search for a memory map.", async () => {
    const memorymap1Before = screen.getByTestId("auto-generated-row-PartNumber/305-0014-000");
    expect(memorymap1Before).toBeInTheDocument();
    expect(memorymap1Before).toBeVisible();

    const memorymap2Before = screen.getByTestId("auto-generated-row-PartNumber/305-0191-002");
    expect(memorymap2Before).toBeInTheDocument();
    expect(memorymap2Before).toBeVisible();

    const memorymap3Before = screen.getByTestId("auto-generated-row-PartNumber/305-0191-002");
    expect(memorymap3Before).toBeInTheDocument();
    expect(memorymap3Before).toBeVisible();

    const searchButton = screen.getByRole("button", { name: "Search" });
    expect(searchButton).toBeInTheDocument();

    const searchInput = screen.getByRole("searchbox");
    await waitFor(() => {
      expect(searchInput).toBeVisible();
    });

    await React.act(async () => {
      await userEvent.type(searchInput, "305-00");
    });

    await waitFor(() => {
      const memorymap1After = screen.getByTestId("auto-generated-row-PartNumber/305-0014-000");
      expect(memorymap1After).toBeInTheDocument();
      expect(memorymap1After).toBeVisible();

      const memorymap2After = screen.queryByTestId("auto-generated-row-PartNumber/305-0191-002");
      expect(memorymap2After).toBeNull();

      const memorymap3After = screen.queryByTestId("auto-generated-row-PartNumber/305-0191-002");
      expect(memorymap3After).toBeNull();
    });
  });

  it("Allows you to view only the working copy memory maps.", async () => {
    const memorymap1Group = screen.getByTestId("auto-generated-row-PartNumber/305-0014-000");
    expect(memorymap1Group).toBeInTheDocument();
    expect(memorymap1Group).toBeVisible();

    const memorymap2Group = screen.getByTestId("auto-generated-row-PartNumber/305-0191-002");
    expect(memorymap2Group).toBeInTheDocument();
    expect(memorymap2Group).toBeVisible();

    const memorymap3Group = screen.getByTestId("auto-generated-row-PartNumber/305-0191-002");
    expect(memorymap3Group).toBeInTheDocument();
    expect(memorymap3Group).toBeVisible();

    const workingCopyFilter = screen.getByTestId("working-copy-filter-button");
    expect(workingCopyFilter).toBeInTheDocument();
    expect(workingCopyFilter).toBeVisible();

    await React.act(async () => {
      await user.click(workingCopyFilter);
    });

    const memoryMap1 = screen.getByTestId("305-0014-000,001,1");
    expect(memoryMap1).toBeInTheDocument();
    expect(memoryMap1).toBeVisible();

    const memoryMap3 = screen.getByTestId("305-0195-000,BBB,4");
    expect(memoryMap3).toBeInTheDocument();
    expect(memoryMap3).toBeVisible();

    const memoryMap2 = screen.getByTestId("305-0191-002,A", { exact: false });
    expect(memoryMap2).toBeInTheDocument();
    expect(memoryMap2).toBeVisible();
  });

  it("Allows you to view only the prod releasable memory maps.", async () => {
    const memorymap1Group = screen.getByTestId("auto-generated-row-PartNumber/305-0014-000");
    expect(memorymap1Group).toBeInTheDocument();
    expect(memorymap1Group).toBeVisible();

    const memorymap2Group = screen.getByTestId("auto-generated-row-PartNumber/305-0191-002");
    expect(memorymap2Group).toBeInTheDocument();
    expect(memorymap2Group).toBeVisible();

    const memorymap3Group = screen.getByTestId("auto-generated-row-PartNumber/305-0191-002");
    expect(memorymap3Group).toBeInTheDocument();
    expect(memorymap3Group).toBeVisible();

    const prodReleaseFilter = screen.getByTestId("prod-release-filter-button");
    expect(prodReleaseFilter).toBeInTheDocument();
    expect(prodReleaseFilter).toBeVisible();

    await React.act(async () => {
      await user.click(prodReleaseFilter);
    });

    const memoryMap2 = screen.getByTestId("305-0191-002,A", { exact: false });
    expect(memoryMap2).toBeInTheDocument();
    expect(memoryMap2).toBeVisible();
  });

  it("Loads a memory map when you click on one.", async () => {
    const memoryMap = screen.getByTestId("auto-generated-row-PartNumber/305-0195-000");
    expect(memoryMap).toBeInTheDocument();
    expect(memoryMap).toBeVisible();

    let expandButton = await within(memoryMap).findByRole("button");

    await React.act(async () => {
      await userEvent.click(expandButton);
    });

    await waitFor(() => {
      const memoryMapWithBomRevision = screen.getByTestId("auto-generated-row-PartNumber/305-0195-000-BOMRevision/BBB");
      expect(memoryMapWithBomRevision).toBeInTheDocument();
      expect(memoryMapWithBomRevision).toBeVisible();
    });

    const memoryMapWithBomRevision = screen.getByTestId("auto-generated-row-PartNumber/305-0195-000-BOMRevision/BBB");
    expandButton = await within(memoryMapWithBomRevision).findByRole("button");

    await React.act(async () => {
      await userEvent.click(expandButton);
    });

    const memoryMapToLoad = screen.getByTestId("305-0195-000,BBB,4");
    expect(memoryMapToLoad).toBeInTheDocument();
    expect(memoryMapToLoad).toBeVisible();

    await React.act(async () => {
      await userEvent.click(memoryMapToLoad);
    });

    await waitFor(() => {
      const newMemoryMapPage = screen.getByTestId("MemoryMapPage");
      expect(newMemoryMapPage).toBeInTheDocument();
      expect(newMemoryMapPage).toBeVisible();
    });
  });
});
