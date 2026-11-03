import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Selector, SelectorOption } from "../Selector";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { AuthenticatedAndMemoryMapLoadedState } from "modules/client/test-helpers/state/authenticated-memorymap-loaded-state";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndMemoryMapLoadedState,
});

const SelectorProvider = mockProvider({
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
  reduxStore: store,
});

describe("Selector", () => {
  let selector: HTMLElement;
  const user = userEvent.setup();

  beforeEach(async () => {
    render(
      <SelectorProvider>
        <Selector value={1} readOnly={false}>
          <SelectorOption
            data-testid={"option1"}
            value={1}
            displayValue="1"
            startAdornment={<div data-testid={"1-startAdornment"} />}
          />
          <SelectorOption
            data-testid={"option2"}
            value={2}
            displayValue="2"
            startAdornment={<div data-testid={"2-startAdornment"} />}
          />
          <SelectorOption
            data-testid={"option3"}
            value={3}
            displayValue="3"
            startAdornment={<div data-testid={"3-startAdornment"} />}
          />
        </Selector>
      </SelectorProvider>
    );

    selector = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("selector");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(selector).toBeInTheDocument();
    expect(selector).toBeVisible();
  });

  it("Has the correct selected option displayed.", async () => {
    const selectedOption = screen.getByTestId("selected-option");
    expect(selectedOption).toBeInTheDocument();
    expect(selectedOption).toBeVisible();
    expect(selectedOption).toHaveTextContent("1");

    const selectedOptionAdornment = within(selectedOption).getByTestId("1-startAdornment");
    expect(selectedOptionAdornment).toBeInTheDocument();
    expect(selectedOptionAdornment).toBeVisible();
  });

  it("Shows the selector menu and all of the options when the item is clicked.", async () => {
    const selectedOption = screen.getByTestId("selected-option");
    expect(selectedOption).toBeVisible();
    expect(selectedOption).toBeInTheDocument();

    await user.click(selectedOption);

    const selectorMenu = screen.getByTestId("selector-menu");
    expect(selectorMenu).toBeInTheDocument();
    expect(selectorMenu).toBeVisible();

    let option1 = screen.getByTestId("option1");
    expect(option1).toBeInTheDocument();
    expect(option1).toBeVisible();

    let option2 = screen.getByTestId("option2");
    expect(option2).toBeInTheDocument();
    expect(option2).toBeVisible();

    let option3 = screen.getByTestId("option3");
    expect(option3).toBeInTheDocument();
    expect(option3).toBeVisible();
  });

  it("Selects another option when one is clicked.", async () => {
    let selectedOption = screen.getByTestId("selected-option");
    expect(selectedOption).toBeInTheDocument();
    expect(selectedOption).toBeVisible();
    expect(selectedOption).toHaveTextContent("1");

    await user.click(selectedOption);

    const selectorMenu = screen.getByTestId("selector-menu");
    expect(selectorMenu).toBeInTheDocument();
    expect(selectorMenu).toBeVisible();

    const option2 = screen.getByTestId("option2");
    expect(option2).toBeInTheDocument();
    expect(option2).toBeVisible();

    await act(async () => {
      await user.click(option2);
    });

    expect(selectorMenu).not.toBeInTheDocument();
    expect(selectorMenu).not.toBeVisible();

    selectedOption = screen.getByTestId("selected-option");
    expect(selectedOption).toBeInTheDocument();
    expect(selectedOption).toBeVisible();
    expect(selectedOption).toHaveTextContent("2");
  });
});
