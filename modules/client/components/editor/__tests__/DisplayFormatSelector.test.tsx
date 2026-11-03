import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createRootReducer } from "modules/client/redux/store";
import { configureStore } from "@reduxjs/toolkit";
import { DisplayFormatSelector } from "../DisplayFormatSelector";
import { userEvent } from "@storybook/test";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: {
    Editor: {
      past: [],
      present: {
        displayFormat: "DECIMAL",
        memoryMap: null,
        pristineMemoryMap: null,
        commandSet: null,
        readOnly: false,
      },
      future: [],
    },
  },
});
const AppBarProvider = mockProvider({
  reduxStore: store,
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
});

describe("Display Format Selector", () => {
  let displayFormatSelector: HTMLElement;

  beforeEach(async () => {
    render(
      <AppBarProvider>
        <DisplayFormatSelector />
      </AppBarProvider>
    );

    displayFormatSelector = await waitFor<HTMLElement>(async () => {
      const element = screen.getByTestId("display-format-selector");
      return element;
    });
  });

  it("Shows up on the screen and is visible.", async () => {
    expect(displayFormatSelector).toBeInTheDocument();
    expect(displayFormatSelector).toBeVisible();
  });

  it("Shows all of the formats that can be selected.", async () => {
    const decimalSelector = screen.getByTestId("decimal-format-selector");
    expect(decimalSelector).toBeInTheDocument();
    expect(decimalSelector).toBeVisible();

    const binarySelector = screen.getByTestId("binary-format-selector");
    expect(binarySelector).toBeInTheDocument();
    expect(binarySelector).toBeVisible();

    const hexadecimalSelector = screen.getByTestId("hexadecimal-format-selector");
    expect(hexadecimalSelector).toBeInTheDocument();
    expect(hexadecimalSelector).toBeVisible();

    const asciiSelector = screen.getByTestId("ascii-format-selector");
    expect(asciiSelector).toBeInTheDocument();
    expect(asciiSelector).toBeVisible();
  });

  it("Allows you to select a different format and reflects the change in redux.", async () => {
    expect(store.getState().Editor.present.displayFormat).toEqual("DECIMAL");

    const binaryFormatRadio = screen.getByTestId("binary-format-radio");

    await act(async () => {
      await userEvent.click(binaryFormatRadio);
    });

    expect(store.getState().Editor.present.displayFormat).toEqual("BINARY");

    const hexadecimalFormatRadio = screen.getByTestId("hexadecimal-format-radio");

    await act(async () => {
      await userEvent.click(hexadecimalFormatRadio);
    });

    expect(store.getState().Editor.present.displayFormat).toEqual("HEXADECIMAL");

    const asciiFormatRadio = screen.getByTestId("ascii-format-radio");

    await act(async () => {
      await userEvent.click(asciiFormatRadio);
    });

    expect(store.getState().Editor.present.displayFormat).toEqual("ASCII");

    const decimalFormatRadio = screen.getByTestId("decimal-format-radio");

    await act(async () => {
      await userEvent.click(decimalFormatRadio);
    });

    expect(store.getState().Editor.present.displayFormat).toEqual("DECIMAL");
  });
});
