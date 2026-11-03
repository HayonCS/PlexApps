import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import OperationSelector from "../OperationSelector";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { AuthenticatedAndMemoryMapLoadedState } from "modules/client/test-helpers/state/authenticated-memorymap-loaded-state";
import { OperationType } from "modules/core/types";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndMemoryMapLoadedState,
});

const OperationSelectorProvider = mockProvider({
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
  reduxStore: store,
});

vi.mock("@mui/x-data-grid", async () => {
  const actual = await vi.importActual("@mui/x-data-grid");
  return {
    ...actual,
    useGridApiContext: vi.fn(() => ({ current: undefined })),
  };
});

describe("Operation Selector", () => {
  let selector: HTMLElement;
  const user = userEvent.setup();

  beforeEach(async () => {
    render(
      <OperationSelectorProvider>
        <OperationSelector
          id={"index0_TestCommand"}
          field={"HELM"}
          isEditable={true}
          value={OperationType.OP_NOT_SET}
        />
      </OperationSelectorProvider>
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
    expect(selectedOption).toHaveTextContent("NOT SET");

    const selectedOptionAdornment = within(selectedOption).getByTestId("not-set-adornment");
    expect(selectedOptionAdornment).toBeInTheDocument();
    expect(selectedOptionAdornment).toBeVisible();
  });

  it("Shows the selector menu and all of the options when the arrow is clicked.", async () => {
    const selectedOption = screen.getByTestId("selected-option");
    expect(selectedOption).toBeVisible();
    expect(selectedOption).toBeInTheDocument();

    await user.click(selectedOption);

    const selectorMenu = screen.getByTestId("selector-menu");
    expect(selectorMenu).toBeInTheDocument();
    expect(selectorMenu).toBeVisible();

    let notSetOption = screen.getByTestId("op_not_set-option");
    expect(notSetOption).toBeInTheDocument();
    expect(notSetOption).toBeVisible();

    const notSetAdornment = within(notSetOption).getByTestId("not-set-adornment");
    expect(notSetAdornment).toBeInTheDocument();
    expect(notSetAdornment).toBeVisible();

    let writeOption = screen.getByTestId("op_write-option");
    expect(writeOption).toBeInTheDocument();
    expect(writeOption).toBeVisible();

    const writeAdornment = within(writeOption).getByTestId("write-adornment");
    expect(writeAdornment).toBeInTheDocument();
    expect(writeAdornment).toBeVisible();

    let verifyOption = screen.getByTestId("op_verify-option");
    expect(verifyOption).toBeInTheDocument();
    expect(verifyOption).toBeVisible();

    const verifyAdornment = within(verifyOption).getByTestId("verify-adornment");
    expect(verifyAdornment).toBeInTheDocument();
    expect(verifyAdornment).toBeVisible();

    let calibrateOption = screen.getByTestId("op_calibrate-option");
    expect(calibrateOption).toBeInTheDocument();
    expect(calibrateOption).toBeVisible();

    const calibrateAdornment = within(calibrateOption).getByTestId("calibrate-adornment");
    expect(calibrateAdornment).toBeInTheDocument();
    expect(calibrateAdornment).toBeVisible();

    let limitOption = screen.getByTestId("op_limit-option");
    expect(limitOption).toBeInTheDocument();
    expect(limitOption).toBeVisible();

    const limitAdornment = within(limitOption).getByTestId("limit-adornment");
    expect(limitAdornment).toBeInTheDocument();
    expect(limitAdornment).toBeVisible();

    let defaultCheckOption = screen.getByTestId("op_def_chk-option");
    expect(defaultCheckOption).toBeInTheDocument();
    expect(defaultCheckOption).toBeVisible();

    const defaultCheckAdornment = within(defaultCheckOption).getByTestId("default-check-adornment");
    expect(defaultCheckAdornment).toBeInTheDocument();
    expect(defaultCheckAdornment).toBeVisible();
  });

  it("Selects another option when one is clicked.", async () => {
    let selectedOption = screen.getByTestId("selected-option");
    expect(selectedOption).toBeInTheDocument();
    expect(selectedOption).toBeVisible();
    expect(selectedOption).toHaveTextContent("NOT SET");

    await user.click(selectedOption);

    const selectorMenu = screen.getByTestId("selector-menu");
    expect(selectorMenu).toBeInTheDocument();
    expect(selectorMenu).toBeVisible();

    const defaultCheckOption = screen.getByTestId("op_def_chk-option");
    expect(defaultCheckOption).toBeInTheDocument();
    expect(defaultCheckOption).toBeVisible();

    await user.click(defaultCheckOption);

    expect(selectorMenu).not.toBeInTheDocument();
    expect(selectorMenu).not.toBeVisible();

    selectedOption = screen.getByTestId("selected-option");
    expect(selectedOption).toBeInTheDocument();
    expect(selectedOption).toBeVisible();
    expect(selectedOption).toHaveTextContent("DEF CHK");
  });
});
