import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { render, screen, waitFor, within } from "@testing-library/react";
import { RecentMemoryMapCard } from "../RecentMemoryMapCard";
import { MockedProvider } from "@apollo/client/testing";
import { RecentMemoryMapMocks } from "modules/client/test-helpers/mocks/recent-memory-map-mocks";

const RecentMemoryMapCardProvider = mockProvider({
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
});

describe("Recent Memory Map Card", () => {
  let recentMemoryMapCard: HTMLElement;

  beforeEach(async () => {
    render(
      <RecentMemoryMapCardProvider>
        <MockedProvider mocks={[...RecentMemoryMapMocks]}>
          <RecentMemoryMapCard
            memoryMapName="305-1234-000"
            bomRevision="AAA"
            version={1}
            lastAccessed={"2025-14-11T12:00:00Z"}
          />
        </MockedProvider>
      </RecentMemoryMapCardProvider>
    );

    recentMemoryMapCard = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("recent-memorymap-card-305-1234-000-AAA-1");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(recentMemoryMapCard).toBeInTheDocument();
    expect(recentMemoryMapCard).toBeVisible();
  });

  it("Has a memory map name.", async () => {
    const name = within(recentMemoryMapCard).getByTestId("memorymap-name");
    expect(name).toHaveTextContent("305-1234-000");
  });

  it("Has a memory map bom revision.", async () => {
    const bomRevision = within(recentMemoryMapCard).getByTestId("memorymap-bom-revision");
    expect(bomRevision).toHaveTextContent("AAA");
  });

  it("Has a memory map version.", async () => {
    const version = within(recentMemoryMapCard).getByTestId("memorymap-version");
    expect(version).toHaveTextContent("1");
  });

  it("Has the last edited by text.", async () => {
    const lastEditedByText = within(recentMemoryMapCard).getByTestId("last-editor-label");
    expect(lastEditedByText).toHaveTextContent("Last Edited By");
  });

  it("Has a changelog button.", async () => {
    const changelogButton = within(recentMemoryMapCard).getByTestId("changelog-button");
    expect(changelogButton).toBeInTheDocument();
    expect(changelogButton).toBeVisible();
    expect(changelogButton).toHaveTextContent("Changelog");
  });
});

describe("Recent Memory Map Card - Working Copy Memory Map", () => {
  let recentMemoryMapCard: HTMLElement;

  beforeEach(async () => {
    render(
      <RecentMemoryMapCardProvider>
        <MockedProvider mocks={[...RecentMemoryMapMocks]}>
          <RecentMemoryMapCard
            memoryMapName="305-0195-000"
            bomRevision="BBB"
            version={4}
            lastAccessed={"2025-14-11T12:00:00Z"}
          />
        </MockedProvider>
      </RecentMemoryMapCardProvider>
    );

    recentMemoryMapCard = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("recent-memorymap-card-305-0195-000-BBB-4");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(recentMemoryMapCard).toBeInTheDocument();
    expect(recentMemoryMapCard).toBeVisible();
  });

  it("Shows the working copy symbol for working copy memory maps.", async () => {
    await waitFor(() => {
      const workingCopyIcon = within(recentMemoryMapCard).getByTestId("working-copy-icon");
      expect(workingCopyIcon).toBeDefined();
      expect(workingCopyIcon).toBeVisible();
    });
  });
});

describe("Recent Memory Map Card - Prod Release Memory Map", () => {
  let recentMemoryMapCard: HTMLElement;

  beforeEach(async () => {
    render(
      <RecentMemoryMapCardProvider>
        <MockedProvider mocks={[...RecentMemoryMapMocks]}>
          <RecentMemoryMapCard
            memoryMapName="305-1234-000"
            bomRevision="AAA"
            version={1}
            lastAccessed={"2025-14-11T12:00:00Z"}
          />
        </MockedProvider>
      </RecentMemoryMapCardProvider>
    );

    recentMemoryMapCard = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("recent-memorymap-card-305-1234-000-AAA-1");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(recentMemoryMapCard).toBeInTheDocument();
    expect(recentMemoryMapCard).toBeVisible();
  });

  it("Shows the prod release symbol for production releasable memory maps.", async () => {
    await waitFor(() => {
      const prodReleaseIcon = within(recentMemoryMapCard).getByTestId("prod-release-icon");
      expect(prodReleaseIcon).toBeDefined();
      expect(prodReleaseIcon).toBeVisible();
    });
  });
});

describe("Recent Memory Map Card - Timestamp Update", () => {
  it("Updates the displayed timestamp when lastAccessed prop changes.", async () => {
    const initialTimestamp = new Date(0).toString();
    const updatedTimestamp = new Date().toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h11",
    });

    const { rerender } = render(
      <RecentMemoryMapCardProvider>
        <MockedProvider mocks={[...RecentMemoryMapMocks]}>
          <RecentMemoryMapCard
            memoryMapName="305-1234-000"
            bomRevision="AAA"
            version={1}
            lastAccessed={initialTimestamp}
          />
        </MockedProvider>
      </RecentMemoryMapCardProvider>
    );

    const recentMemoryMapCard = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("recent-memorymap-card-305-1234-000-AAA-1");
      return element;
    });

    // Check initial timestamp
    const initialTimestampElement = within(recentMemoryMapCard).getByTestId("memorymap-last-accessed");
    expect(initialTimestampElement).toHaveTextContent(`12/31/69, 07:00 PM`);

    // Update the timestamp by rerendering with new prop
    rerender(
      <RecentMemoryMapCardProvider>
        <MockedProvider mocks={[...RecentMemoryMapMocks]}>
          <RecentMemoryMapCard
            memoryMapName="305-1234-000"
            bomRevision="AAA"
            version={1}
            lastAccessed={updatedTimestamp}
          />
        </MockedProvider>
      </RecentMemoryMapCardProvider>
    );

    // Check updated timestamp
    await waitFor(() => {
      const updatedTimestampElement = within(recentMemoryMapCard).getByTestId("memorymap-last-accessed");
      expect(updatedTimestampElement).toHaveTextContent(`${updatedTimestamp}`);
    });
  });
});
