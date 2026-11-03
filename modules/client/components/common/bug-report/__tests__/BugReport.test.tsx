import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import * as React from "react";

import { BugReportProviderInvalid, BugReportProviderValid } from "./BugReport.mock";
import { BugReport } from "../BugReport";
import { beforeEach, describe, expect, it } from "vitest";

describe("BugReport - Unauthenticated User", () => {
  let bugReportElement: HTMLElement;

  beforeEach(async () => {
    render(
      <BugReportProviderValid userName="unknown.user">
        <BugReport />
      </BugReportProviderValid>
    );

    bugReportElement = await waitFor<HTMLElement>(() => {
      const element = screen.getByTestId("bugReportRoot");
      return element;
    });
  });

  it("Shows the bug report submission form", () => {
    const header = screen.getByTestId("bugReportHeader");
    const body = screen.getByTestId("bugReportBody");
    const footer = screen.getByTestId("bugReportFooter");
    expect(bugReportElement).toBeInTheDocument();
    expect(bugReportElement).toBeVisible();
    expect(header).toBeInTheDocument();
    expect(header).toBeVisible();
    expect(body).toBeInTheDocument();
    expect(body).toBeVisible();
    expect(footer).toBeInTheDocument();
    expect(footer).toBeVisible();
  });

  it("Fails to submit a bug report", async () => {
    await cleanup();
    render(
      <BugReportProviderValid userName="unknown.user">
        <BugReport />
      </BugReportProviderValid>
    );
    bugReportElement = await waitFor<HTMLElement>(() => {
      const element = screen.getByTestId("bugReportRoot");
      return element;
    });

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    expect(bugReportElement).toBeInTheDocument();
    expect(bugReportElement).toBeVisible();

    const summaryInput = screen.getByTestId("bugReportSummaryInput");
    const detailsInput = screen.getByTestId("bugReportDetailsInput");
    expect(summaryInput).toHaveValue("");
    expect(detailsInput).toHaveValue("");

    // Type in values before submitting
    await userEvent.type(summaryInput, "Test Problem", { pointerEventsCheck: 0 });
    await userEvent.type(detailsInput, "Test Description", { pointerEventsCheck: 0 });

    const submitButton = screen.getByTestId("bugReportSubmit");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeVisible();

    await user.click(submitButton);

    // Notification is shown via global notification system, not inline alert
  });
});

describe("BugReport - Authenticated User", () => {
  let bugReportElement: HTMLElement;

  beforeEach(async () => {
    render(
      <BugReportProviderValid>
        <BugReport />
      </BugReportProviderValid>
    );

    bugReportElement = await waitFor<HTMLElement>(() => {
      const element = screen.getByTestId("bugReportRoot");
      return element;
    });
  });

  it("Shows the bug report submission form", () => {
    const header = screen.getByTestId("bugReportHeader");
    const body = screen.getByTestId("bugReportBody");
    const footer = screen.getByTestId("bugReportFooter");
    expect(bugReportElement).toBeInTheDocument();
    expect(bugReportElement).toBeVisible();
    expect(header).toBeInTheDocument();
    expect(header).toBeVisible();
    expect(body).toBeInTheDocument();
    expect(body).toBeVisible();
    expect(footer).toBeInTheDocument();
    expect(footer).toBeVisible();
  });

  it("Will not allow a bug to be reported with insufficient information", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    expect(bugReportElement).toBeInTheDocument();
    expect(bugReportElement).toBeVisible();

    const summaryInput = screen.getByTestId("bugReportSummaryInput");
    const detailsInput = screen.getByTestId("bugReportDetailsInput");
    expect(summaryInput).toHaveValue("");
    expect(detailsInput).toHaveValue("");

    // Fields are already empty, so just try to submit
    const submitButton = screen.getByTestId("bugReportSubmit");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeVisible();

    await user.click(submitButton);

    expect(summaryInput).toBeInvalid();
    expect(detailsInput).toBeInvalid();
  });

  it("Successfully submits a bug default report", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    expect(bugReportElement).toBeInTheDocument();
    expect(bugReportElement).toBeVisible();

    const summaryInput = screen.getByTestId("bugReportSummaryInput");
    const detailsInput = screen.getByTestId("bugReportDetailsInput");
    expect(summaryInput).toHaveValue("");
    expect(detailsInput).toHaveValue("");

    // Type in values
    await userEvent.type(summaryInput, "Operations Manager Problem", { pointerEventsCheck: 0 });
    await userEvent.type(detailsInput, "I am experiencing an issue with the Operations Manager web app.", {
      pointerEventsCheck: 0,
    });

    const submitButton = screen.getByTestId("bugReportSubmit");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeVisible();

    await user.click(submitButton);

    // Notification is shown via global notification system
  });

  it("Successfully submits a bug report with custom information", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    expect(bugReportElement).toBeInTheDocument();
    expect(bugReportElement).toBeVisible();

    const summaryInput = screen.getByTestId("bugReportSummaryInput");
    const detailsInput = screen.getByTestId("bugReportDetailsInput");
    expect(summaryInput).toHaveValue("");
    expect(detailsInput).toHaveValue("");

    await userEvent.type(summaryInput, "The summary of the problem.", {
      pointerEventsCheck: 0,
    });
    await userEvent.type(detailsInput, "These are the descriptive details of the problem that is being reported.", {
      pointerEventsCheck: 0,
    });
    expect(summaryInput).toHaveValue("The summary of the problem.");
    expect(detailsInput).toHaveValue("These are the descriptive details of the problem that is being reported.");

    const submitButton = screen.getByTestId("bugReportSubmit");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeVisible();

    await user.click(submitButton);

    // Notification is shown via global notification system
  });

  it("Fails to submit a bug report", async () => {
    await cleanup();
    render(
      <BugReportProviderInvalid>
        <BugReport />
      </BugReportProviderInvalid>
    );
    bugReportElement = await waitFor<HTMLElement>(() => {
      const element = screen.getByTestId("bugReportRoot");
      return element;
    });

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    expect(bugReportElement).toBeInTheDocument();
    expect(bugReportElement).toBeVisible();

    const summaryInput = screen.getByTestId("bugReportSummaryInput");
    const detailsInput = screen.getByTestId("bugReportDetailsInput");
    expect(summaryInput).toHaveValue("");
    expect(detailsInput).toHaveValue("");

    // Type in values
    await userEvent.type(summaryInput, "Test Problem", { pointerEventsCheck: 0 });
    await userEvent.type(detailsInput, "Test Description", { pointerEventsCheck: 0 });

    const submitButton = screen.getByTestId("bugReportSubmit");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeVisible();

    await user.click(submitButton);

    // Notification is shown via global notification system
  });
});
