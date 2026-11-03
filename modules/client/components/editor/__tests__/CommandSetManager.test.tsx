import * as React from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import {
  AuthenticatedAndMemoryMapLoadedState,
  AuthenticatedAndReadOnlyMemoryMapLoadedState,
} from "modules/client/test-helpers/state/authenticated-memorymap-loaded-state";
import { render, waitFor, screen } from "modules/client/test-helpers/rtl-extensions";
import CommandSetManager from "../CommandSetManager";
import { userEvent } from "@storybook/test";
import { MockedProvider } from "@apollo/client/testing";
import { GetAllCommandSetsMock } from "modules/client/test-helpers/mocks/commandset-mocks";
import { within } from "@testing-library/react";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndMemoryMapLoadedState,
});

const CommandSetManagerProvider = mockProvider({
  initialHistoryStack: "/305-0195-000/BBB/4",
  logMissingMocks: true,
  reduxStore: store,
});

describe("Commandset Manager", () => {
  let commandsetManager: HTMLElement;
  const user = userEvent.setup();

  beforeAll(async () => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(async () => {
    render(
      <MockedProvider mocks={[GetAllCommandSetsMock()]}>
        <CommandSetManagerProvider>
          <CommandSetManager />
        </CommandSetManagerProvider>
      </MockedProvider>
    );

    commandsetManager = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("commandset-manager");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(commandsetManager).toBeInTheDocument();
    expect(commandsetManager).toBeVisible();
  });

  it("Displays the whole commandset manager when you click the button.", async () => {
    const expandButton = screen.getByTestId("expand-button");
    expect(expandButton).toBeInTheDocument();
    expect(expandButton).toBeVisible();

    void user.click(expandButton);

    await waitFor(() => {
      expect(expandButton).not.toBeVisible();
    });
  });

  it("Has header text.", async () => {
    const headerText = screen.getByTestId("header-text");
    expect(headerText).toBeInTheDocument();
    expect(headerText).toBeVisible();
  });

  it("Has the correct commandset filename loaded into the commandset selector.", async () => {
    const commandsetSelector = screen.getByTestId("commandset-selector");
    expect(commandsetSelector).toBeInTheDocument();
    expect(commandsetSelector).toBeVisible();

    await waitFor(() => {
      expect(commandsetSelector).toHaveTextContent("1845_BMW_Project_2021.cmdset");
    });
  });

  it("Displays the revision header and correct revision number.", async () => {
    const revisionHeader = screen.getByTestId("commandset-revision-header");
    expect(revisionHeader).toBeInTheDocument();
    expect(revisionHeader).toBeVisible();

    expect(revisionHeader).toHaveTextContent("Revision:");

    const revisionNumber = screen.getByTestId("commandset-revision");
    expect(revisionNumber).toBeInTheDocument();
    expect(revisionNumber).toBeVisible();

    expect(revisionNumber).toHaveTextContent("52497");
  });

  it("Displays the description header and correct description.", async () => {
    const descriptionHeader = screen.getByTestId("commandset-description-header");
    expect(descriptionHeader).toBeInTheDocument();
    expect(descriptionHeader).toBeVisible();

    expect(descriptionHeader).toHaveTextContent("Description:");

    const descriptionNumber = screen.getByTestId("commandset-description");
    expect(descriptionNumber).toBeInTheDocument();
    expect(descriptionNumber).toBeVisible();

    expect(descriptionNumber).toHaveTextContent("1845 BMW Project 2021");
  });

  it("Displays the command list.", async () => {
    const commandList = screen.getByTestId("command-list");
    expect(commandList).toBeInTheDocument();
    expect(commandList).toBeVisible();
  });

  it("Shows commands in the command list.", async () => {
    const commandList = screen.getByTestId("command-list");
    const commandItems = within(commandList).getAllByTestId("command-list-command");
    expect(commandItems).toHaveLength(256);
  });

  it("Shows the parameter list and shows parameters when you click on a command.", async () => {
    const commandList = screen.getByTestId("command-list");
    const commandItems = within(commandList).getAllByTestId("command-list-command");

    void user.click(commandItems[2]);

    await waitFor(() => {
      const parameterList = screen.getByTestId("parameter-list");
      expect(parameterList).toBeInTheDocument();
      expect(parameterList).toBeVisible();

      const parameterItems = within(parameterList).getAllByTestId("command-parameter");
      expect(parameterItems).toHaveLength(4);
    });
  });
});

const readOnlyStore = configureStore({
  reducer: createRootReducer(),
  preloadedState: AuthenticatedAndReadOnlyMemoryMapLoadedState,
});

const CommandSetManagerReadOnlyProvider = mockProvider({
  initialHistoryStack: "/305-0195-000/BBB/4",
  logMissingMocks: true,
  reduxStore: readOnlyStore,
});

describe("Commandset Manager - Read Only", () => {
  let commandsetManager: HTMLElement;
  const user = userEvent.setup();

  beforeAll(async () => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  beforeEach(async () => {
    render(
      <MockedProvider mocks={[GetAllCommandSetsMock()]}>
        <CommandSetManagerReadOnlyProvider>
          <CommandSetManager />
        </CommandSetManagerReadOnlyProvider>
      </MockedProvider>
    );

    commandsetManager = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("commandset-manager");
      return element;
    });
  });

  it("Has a disabled commandset selector.", async () => {
    expect(commandsetManager).toBeInTheDocument();
    expect(commandsetManager).toBeVisible();

    const expandButton = screen.getByTestId("expand-button");
    expect(expandButton).toBeInTheDocument();
    expect(expandButton).toBeVisible();

    void user.click(expandButton);

    await waitFor(() => {
      expect(expandButton).not.toBeVisible();
    });

    const commandsetSelector = screen.getByTestId("commandset-selector");
    expect(commandsetSelector).toBeInTheDocument();
    expect(commandsetSelector).toBeVisible();

    const selectorCombobox = within(commandsetSelector).getByRole("combobox");
    expect(selectorCombobox).toBeInTheDocument();
    expect(selectorCombobox).toBeVisible();
    expect(selectorCombobox).toHaveAttribute("aria-disabled", "true");
  });
});
