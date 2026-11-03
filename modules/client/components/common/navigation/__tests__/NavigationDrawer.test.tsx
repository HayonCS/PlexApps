import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { render, screen, waitFor } from "@testing-library/react";
import { createRootReducer } from "modules/client/redux/store";
import { configureStore } from "@reduxjs/toolkit";
import { NavigationDrawer } from "../NavigationDrawer";

// Mock websocket-client module to avoid socket.io-client import errors
vi.mock("client/websocket-client", () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connected: false,
    id: "test-socket",
  },
}));

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
const NavigationDrawerProvider = mockProvider({
  reduxStore: store,
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
});

describe("Navigation Drawer", () => {
  let navigationDrawer: HTMLElement;

  beforeEach(async () => {
    render(
      <NavigationDrawerProvider>
        <NavigationDrawer />
      </NavigationDrawerProvider>
    );

    navigationDrawer = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("navigation-drawer");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(navigationDrawer).toBeInTheDocument();
    expect(navigationDrawer).toBeVisible();
  });

  it("Has a header.", async () => {
    const header = screen.getByTestId("navigation-drawer-header");
    expect(header).toBeInTheDocument();
    expect(header).toBeVisible();

    const headerText = screen.getByText("NAVIGATION");
    expect(headerText).toBeInTheDocument();
    expect(headerText).toBeVisible();
  });

  it("Has all of the navigation items that are expected.", async () => {
    const dashboardItem = screen.getByTestId("navigation-item-dashboard");
    expect(dashboardItem).toBeInTheDocument();
    expect(dashboardItem).toBeVisible();

    const editorItem = screen.getByTestId("navigation-item-editor");
    expect(editorItem).toBeInTheDocument();
    expect(editorItem).toBeVisible();

    const healthItem = screen.getByTestId("navigation-item-health");
    expect(healthItem).toBeInTheDocument();
    expect(healthItem).toBeVisible();

    const settingsItem = screen.getByTestId("navigation-item-settings");
    expect(settingsItem).toBeInTheDocument();
    expect(settingsItem).toBeVisible();

    const bugReportItem = screen.getByTestId("navigation-item-report-a-problem");
    expect(bugReportItem).toBeInTheDocument();
    expect(bugReportItem).toBeVisible();
  });
});
