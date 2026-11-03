import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { CurrentUserDisplay } from "../CurrentUserDisplay";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@storybook/test";
import { MockedProvider } from "@apollo/client/testing";
import { ActiveDirectoryMocks } from "modules/client/test-helpers/mocks/active-directory-mocks";
import { EmployeePictureMocks } from "modules/client/test-helpers/mocks/employee-picture-mocks";

const CurrentUserDisplayProvider = mockProvider({
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
});

describe("Current User Display - Full Display", () => {
  let currentUserDisplay: HTMLElement;

  beforeEach(async () => {
    render(
      <CurrentUserDisplayProvider>
        <MockedProvider mocks={[...ActiveDirectoryMocks, ...EmployeePictureMocks]}>
          <CurrentUserDisplay userName="bill.brasky"></CurrentUserDisplay>
        </MockedProvider>
      </CurrentUserDisplayProvider>
    );

    currentUserDisplay = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("current-user-display");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(currentUserDisplay).toBeInTheDocument();
    expect(currentUserDisplay).toBeVisible();
  });

  it("Has the correct user name displayed and formatted.", async () => {
    const nameText = screen.getByTestId("name-text");
    expect(nameText).toBeInTheDocument();
    expect(nameText).toBeVisible();
    expect(nameText).toHaveTextContent("BILL BRASKY");
  });

  it("Has an avatar displayed.", async () => {
    const userAvatar = screen.getByTestId("user-avatar");
    expect(userAvatar).toBeInTheDocument();
    expect(userAvatar).toBeVisible();
  });

  it("Shows the popper when hovered.", async () => {
    const userAvatar = screen.getByTestId("user-avatar");

    await React.act(async () => {
      await userEvent.hover(userAvatar);
    });

    await waitFor(
      () => {
        const popper = screen.getByTestId("current-user-display-popper-bill.brasky");
        expect(popper).toBeInTheDocument();
        expect(popper).toBeVisible();
      },
      { timeout: 1200 }
    );
  });
});

describe("Current User Display - Avatar Only", () => {
  let currentUserDisplay: HTMLElement;

  beforeEach(async () => {
    render(
      <MockedProvider mocks={[...ActiveDirectoryMocks, ...EmployeePictureMocks]}>
        <CurrentUserDisplayProvider>
          <CurrentUserDisplay avatarOnly={true} userName="bill.brasky"></CurrentUserDisplay>
        </CurrentUserDisplayProvider>
      </MockedProvider>
    );

    currentUserDisplay = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("current-user-display");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(currentUserDisplay).toBeVisible();
  });

  it("Has no username displayed.", async () => {
    const nameText = within(currentUserDisplay).queryByTestId("name-text");
    expect(nameText).toBeNull();
  });

  it("Has an avatar displayed.", async () => {
    const userAvatar = within(currentUserDisplay).getByTestId("user-avatar");
    expect(userAvatar).toBeDefined();
    expect(userAvatar).toBeVisible();
  });

  it("Shows the popper when hovered.", async () => {
    const userAvatar = screen.getByTestId("user-avatar");

    await React.act(async () => {
      await userEvent.hover(userAvatar);
    });

    await waitFor(
      () => {
        const popper = screen.getByTestId("current-user-display-popper-bill.brasky");
        expect(popper).toBeInTheDocument();
        expect(popper).toBeVisible();
      },
      { timeout: 1200 }
    );
  });
});

describe("Current User Display - Slim Popper Display", () => {
  let currentUserDisplay: HTMLElement;

  beforeEach(async () => {
    render(
      <CurrentUserDisplayProvider>
        <MockedProvider mocks={[...ActiveDirectoryMocks, ...EmployeePictureMocks]}>
          <CurrentUserDisplay slimPopperDisplay={true} userName="bill.brasky"></CurrentUserDisplay>
        </MockedProvider>
      </CurrentUserDisplayProvider>
    );

    currentUserDisplay = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("current-user-display");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(currentUserDisplay).toBeVisible();
  });

  it("Has a username displayed.", async () => {
    const nameText = within(currentUserDisplay).queryByTestId("name-text");
    expect(nameText).toBeDefined();
    expect(nameText).toBeVisible();
  });

  it("Has an avatar displayed.", async () => {
    const userAvatar = within(currentUserDisplay).getByTestId("user-avatar");
    expect(userAvatar).toBeDefined();
    expect(userAvatar).toBeVisible();
  });

  it("Shows the popper when hovered.", async () => {
    const userAvatar = screen.getByTestId("user-avatar");

    await React.act(async () => {
      await userEvent.hover(userAvatar);
    });

    await waitFor(
      () => {
        const popper = screen.getByTestId("current-user-display-popper-bill.brasky-slim");
        expect(popper).toBeInTheDocument();
        expect(popper).toBeVisible();
      },
      { timeout: 1200 }
    );
  });
});

describe("Current User Display - User Not Found", () => {
  let currentUserDisplay: HTMLElement;

  beforeEach(async () => {
    render(
      <CurrentUserDisplayProvider>
        <MockedProvider mocks={[...ActiveDirectoryMocks, ...EmployeePictureMocks]}>
          <CurrentUserDisplay slimPopperDisplay={true} userName="tony.pizza"></CurrentUserDisplay>
        </MockedProvider>
      </CurrentUserDisplayProvider>
    );

    currentUserDisplay = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("current-user-display");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(currentUserDisplay).toBeVisible();
  });

  it("Has a username displayed.", async () => {
    const nameText = within(currentUserDisplay).queryByTestId("name-text");
    expect(nameText).toBeDefined();
    expect(nameText).toBeVisible();
    expect(nameText).toHaveTextContent("UNDEFINED UNDEFINED");
  });

  it("Has an avatar displayed.", async () => {
    const userAvatar = within(currentUserDisplay).getByTestId("user-avatar");
    expect(userAvatar).toBeDefined();
    expect(userAvatar).toBeVisible();
  });

  it("Shows the popper when hovered.", async () => {
    const userAvatar = screen.getByTestId("user-avatar");

    await React.act(async () => {
      await userEvent.hover(userAvatar);
    });

    await waitFor(
      () => {
        const popper = screen.getByTestId("current-user-display-popper-tony.pizza-slim");
        expect(popper).toBeInTheDocument();
        expect(popper).toBeVisible();
      },
      { timeout: 1200 }
    );
  });
});
