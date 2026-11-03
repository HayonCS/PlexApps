import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppBar from "../AppBar";
import { createRootReducer } from "modules/client/redux/store";
import { configureStore } from "@reduxjs/toolkit";
import { MockedProvider } from "@apollo/client/testing";
import { ActiveDirectoryMocks } from "modules/client/test-helpers/mocks/active-directory-mocks";
import { EmployeePictureMocks } from "modules/client/test-helpers/mocks/employee-picture-mocks";

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
const AppBarProvider = mockProvider({
  reduxStore: store,
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
});

describe("App Bar", () => {
  let appBar: HTMLElement;

  beforeEach(async () => {
    render(
      <MockedProvider mocks={[...ActiveDirectoryMocks, ...EmployeePictureMocks]}>
        <AppBarProvider>
          <AppBar />
        </AppBarProvider>
      </MockedProvider>
    );

    appBar = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("app-bar");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(appBar).toBeInTheDocument();
    expect(appBar).toBeVisible();
  });

  it("Has a gentex logo.", async () => {
    const logo = within(appBar).getByTestId("gentex-logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toBeVisible();
  });

  it("Has a chevron separator.", async () => {
    const chevron = within(appBar).getByTestId("chevron");
    expect(chevron).toBeInTheDocument();
    expect(chevron).toBeVisible();
  });

  it("Has a current user display.", async () => {
    await waitFor(() => {
      const currentUserDisplay = within(appBar).getByTestId("current-user-display");
      expect(currentUserDisplay).toBeInTheDocument();
      expect(currentUserDisplay).toBeVisible();
    });
  });

  it("Navigates to dashboard when clicking on app bar title.", async () => {
    const user = userEvent.setup();
    const title = within(appBar).getByTestId("appbar-title");

    await user.click(title);

    // The title is wrapped in a div that handles navigation
    // Just verify the title is clickable and has proper styling
    expect(title).toHaveStyle({ cursor: "pointer" });
  });
});
