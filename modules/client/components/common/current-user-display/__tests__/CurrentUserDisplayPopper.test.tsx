import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { render, screen, waitFor } from "@testing-library/react";
import { CurrentUserDisplayPopper } from "../CurrentUserDisplayPopper";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { USER_PICTURE_FOR_TESTS } from "modules/client/test-helpers/mocks/employee-picture-mocks";

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

const CurrentUserDisplayPopperProvider = mockProvider({
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
  reduxStore: store,
});

describe("Current User Display Popper - Full Size", () => {
  let currentUserDisplayPopper: HTMLElement;

  beforeEach(async () => {
    render(
      <CurrentUserDisplayPopperProvider>
        <div
          data-testid={"current-user-display-bill.brasky"}
          id={"current-user-display-bill.brasky"}
          style={{ height: "10px", width: "10px", backgroundColor: "blue", display: "block" }}
        >
          <CurrentUserDisplayPopper
            userName="bill.brasky"
            fullName="Bill Brasky"
            location="Test and Measurement"
            emailAddress="bill.brasky@gentex.com"
            employeeNumber={69}
            phoneNumber="+1 (616) 772-1590"
            userPicture={USER_PICTURE_FOR_TESTS}
            open={true}
            slimDisplay={false}
            setMouseOver={() => {}}
          />
        </div>
      </CurrentUserDisplayPopperProvider>
    );

    currentUserDisplayPopper = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("current-user-display-popper-bill.brasky");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(currentUserDisplayPopper).toBeInTheDocument();
    expect(currentUserDisplayPopper).toBeVisible();
  });

  it("Has a user profile picture.", async () => {
    const avatar = screen.getByTestId("popper-user-avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toBeVisible();
  });

  it("Has social buttons.", async () => {
    const socialButtons = screen.getByTestId("popper-social-buttons");
    expect(socialButtons).toBeInTheDocument();
    expect(socialButtons).toBeVisible();
  });

  it("Has the user's full name text.", async () => {
    const fullName = screen.getByTestId("popper-fullname");
    expect(fullName).toBeInTheDocument();
    expect(fullName).toBeVisible();
    expect(fullName).toHaveTextContent("Bill Brasky");
  });

  it("Has the user's formatted phone number.", async () => {
    const phoneNumber = screen.getByTestId("popper-phone-number-formatted");
    expect(phoneNumber).toBeInTheDocument();
    expect(phoneNumber).toBeVisible();
    expect(phoneNumber).toHaveTextContent("+1 (616) 772-1590");
  });

  it("Has the user's location.", async () => {
    const location = screen.getByTestId("popper-location");
    expect(location).toBeInTheDocument();
    expect(location).toBeVisible();
    expect(location).toHaveTextContent("Test and Measurement");
  });

  it("Has the user's email address.", async () => {
    const location = screen.getByTestId("popper-email-address");
    expect(location).toBeInTheDocument();
    expect(location).toBeVisible();
    expect(location).toHaveTextContent("bill.brasky@gentex.com");
  });

  it("Has a settings button.", async () => {
    const button = screen.getByTestId("popper-button-settings");
    expect(button).toBeInTheDocument();
    expect(button).toBeVisible();
  });

  it("Has a logout button.", async () => {
    const button = screen.getByTestId("popper-button-logout");
    expect(button).toBeInTheDocument();
    expect(button).toBeVisible();
  });
});

describe("Current User Display Popper - Slim Size", () => {
  let currentUserDisplayPopper: HTMLElement;

  beforeEach(async () => {
    render(
      <CurrentUserDisplayPopperProvider>
        <div
          data-testid={"current-user-display-bill.brasky"}
          id={"current-user-display-bill.brasky"}
          style={{ height: "10px", width: "10px", backgroundColor: "blue", display: "block" }}
        >
          <CurrentUserDisplayPopper
            userName="bill.brasky"
            fullName="Bill Brasky"
            location="Test and Measurement"
            emailAddress="bill.brasky@gentex.com"
            employeeNumber={69}
            phoneNumber="(616) 772-1590"
            userPicture={USER_PICTURE_FOR_TESTS}
            open={true}
            slimDisplay={true}
            setMouseOver={() => {}}
          />
        </div>
      </CurrentUserDisplayPopperProvider>
    );

    currentUserDisplayPopper = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("current-user-display-popper-bill.brasky-slim");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(currentUserDisplayPopper).toBeInTheDocument();
    expect(currentUserDisplayPopper).toBeVisible();
  });

  it("Does NOT have a user profile picture.", async () => {
    const avatar = screen.queryByTestId("popper-user-avatar");
    expect(avatar).not.toBeInTheDocument();
    expect(avatar).toBeNull();
  });

  it("Has social buttons.", async () => {
    const socialButtons = screen.getByTestId("popper-social-buttons-slim");
    expect(socialButtons).toBeInTheDocument();
    expect(socialButtons).toBeVisible();
  });

  it("Does NOT the user's full name text.", async () => {
    const fullName = screen.queryByTestId("popper-fullname");
    expect(fullName).not.toBeInTheDocument();
    expect(fullName).toBeNull();
  });

  it("Does NOT have the user's formatted phone number.", async () => {
    const phoneNumber = screen.queryByTestId("popper-phone-number-formatted");
    expect(phoneNumber).not.toBeInTheDocument();
    expect(phoneNumber).toBeNull();
  });

  it("Does NOT have the user's location.", async () => {
    const location = screen.queryByTestId("popper-location");
    expect(location).not.toBeInTheDocument();
    expect(location).toBeNull();
  });

  it("Does NOT have the user's email address.", async () => {
    const location = screen.queryByTestId("popper-email-address");
    expect(location).not.toBeInTheDocument();
    expect(location).toBeNull();
  });

  it("Does NOT have a settings button.", async () => {
    const button = screen.queryByTestId("popper-button-settings");
    expect(button).not.toBeInTheDocument();
    expect(button).toBeNull();
  });

  it("Does NOT have a logout button.", async () => {
    const button = screen.queryByTestId("popper-button-logout");
    expect(button).not.toBeInTheDocument();
    expect(button).toBeNull();
  });
});

describe("Current User Display Popper - OpsManager Author/Write Permissions", () => {
  let currentUserDisplayPopper: HTMLElement;

  beforeEach(async () => {
    render(
      <CurrentUserDisplayPopperProvider>
        <div
          data-testid={"current-user-display-bill.brasky"}
          id={"current-user-display-bill.brasky"}
          style={{ height: "10px", width: "10px", backgroundColor: "blue", display: "block" }}
        >
          <CurrentUserDisplayPopper
            userName="bill.brasky"
            fullName="Bill Brasky"
            location="Test and Measurement"
            readOnly={false}
            emailAddress="bill.brasky@gentex.com"
            employeeNumber={69}
            phoneNumber="+1 (616) 772-1590"
            userPicture={USER_PICTURE_FOR_TESTS}
            open={true}
            slimDisplay={false}
            setMouseOver={() => {}}
          />
        </div>
      </CurrentUserDisplayPopperProvider>
    );

    currentUserDisplayPopper = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("current-user-display-popper-bill.brasky");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(currentUserDisplayPopper).toBeInTheDocument();
    expect(currentUserDisplayPopper).toBeVisible();
  });

  it("Has the user's full name text with the author permissions.", async () => {
    const fullName = screen.getByTestId("popper-fullname");
    expect(fullName).toBeInTheDocument();
    expect(fullName).toBeVisible();
    expect(fullName).toHaveTextContent("Bill Brasky (Author)");
  });
});

describe("Current User Display Popper - OpsManager User/Read-Only Permissions", () => {
  let currentUserDisplayPopper: HTMLElement;

  beforeEach(async () => {
    render(
      <CurrentUserDisplayPopperProvider>
        <div
          data-testid={"current-user-display-bill.brasky"}
          id={"current-user-display-bill.brasky"}
          style={{ height: "10px", width: "10px", backgroundColor: "blue", display: "block" }}
        >
          <CurrentUserDisplayPopper
            userName="bill.brasky"
            fullName="Bill Brasky"
            location="Test and Measurement"
            readOnly={true}
            emailAddress="bill.brasky@gentex.com"
            employeeNumber={69}
            phoneNumber="+1 (616) 772-1590"
            userPicture={USER_PICTURE_FOR_TESTS}
            open={true}
            slimDisplay={false}
            setMouseOver={() => {}}
          />
        </div>
      </CurrentUserDisplayPopperProvider>
    );

    currentUserDisplayPopper = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("current-user-display-popper-bill.brasky");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(currentUserDisplayPopper).toBeInTheDocument();
    expect(currentUserDisplayPopper).toBeVisible();
  });

  it("Has the user's full name text with the author permissions.", async () => {
    const fullName = screen.getByTestId("popper-fullname");
    expect(fullName).toBeInTheDocument();
    expect(fullName).toBeVisible();
    expect(fullName).toHaveTextContent("Bill Brasky (User)");
  });
});
