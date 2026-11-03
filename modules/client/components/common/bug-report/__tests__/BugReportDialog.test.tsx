import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import * as React from "react";

import { BugReportProviderInvalid, BugReportProviderValid } from "./BugReport.mock";
import { BugReportDialog } from "../BugReportDialog";
import { beforeEach, describe, expect, it } from "vitest";

describe("BugReportDialog - Closed", () => {
  beforeEach(() => {
    render(
      <BugReportProviderValid bugReportDialogOpen={false}>
        <BugReportDialog />
      </BugReportProviderValid>
    );
  });

  it("Does not show the bug report dialog and its component", () => {
    const bugReportDialog = screen.queryByTestId("BugReportDialog");
    const bugReportComponent = screen.queryByTestId("bugReportRoot");
    expect(bugReportDialog).not.toBeInTheDocument();
    expect(bugReportComponent).not.toBeInTheDocument();
  });

  it("Does not show the bug report submission form", () => {
    const bugReportElement = screen.queryByTestId("bugReportRoot");
    const header = screen.queryByTestId("bugReportHeader");
    const body = screen.queryByTestId("bugReportBody");
    const footer = screen.queryByTestId("bugReportFooter");
    expect(bugReportElement).not.toBeInTheDocument();
    expect(header).not.toBeInTheDocument();
    expect(body).not.toBeInTheDocument();
    expect(footer).not.toBeInTheDocument();
  });
});

describe("BugReportDialog - Unauthenticated User", () => {
  let bugReportDialog: HTMLElement;

  beforeEach(async () => {
    render(
      <BugReportProviderValid userName="unknown.user" bugReportDialogOpen={true}>
        <BugReportDialog />
      </BugReportProviderValid>
    );

    bugReportDialog = await waitFor<HTMLElement>(() => {
      const element = screen.getByTestId("BugReportDialog");
      return element;
    });
  });

  it("Shows the bug report dialog and its component", () => {
    const bugReportComponent = screen.getByTestId("bugReportRoot");
    expect(bugReportDialog).toBeInTheDocument();
    expect(bugReportDialog).toBeVisible();
    expect(bugReportComponent).toBeInTheDocument();
    expect(bugReportComponent).toBeVisible();
  });

  it("Shows the bug report submission form", () => {
    const bugReportElement = screen.getByTestId("bugReportRoot");
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
      <BugReportProviderValid userName="unknown.user" bugReportDialogOpen={true}>
        <BugReportDialog />
      </BugReportProviderValid>
    );
    bugReportDialog = await waitFor<HTMLElement>(() => {
      const element = screen.getByTestId("BugReportDialog");
      return element;
    });

    expect(bugReportDialog).toBeInTheDocument();
    expect(bugReportDialog).toBeVisible();

    const bugReportElement = screen.getByTestId("bugReportRoot");
    expect(bugReportElement).toBeInTheDocument();
    expect(bugReportElement).toBeVisible();

    const user = userEvent.setup({ pointerEventsCheck: 0 });

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

    // Notification is shown via global notification system
  });
});

describe("BugReportDialog - Authenticated User", () => {
  let bugReportDialog: HTMLElement;

  beforeEach(async () => {
    render(
      <BugReportProviderValid bugReportDialogOpen={true}>
        <BugReportDialog />
      </BugReportProviderValid>
    );

    bugReportDialog = await waitFor<HTMLElement>(() => {
      const element = screen.getByTestId("BugReportDialog");
      return element;
    });
  });

  it("Shows the bug report dialog and its component", () => {
    const bugReportComponent = screen.getByTestId("bugReportRoot");
    expect(bugReportDialog).toBeInTheDocument();
    expect(bugReportDialog).toBeVisible();
    expect(bugReportComponent).toBeInTheDocument();
    expect(bugReportComponent).toBeVisible();
  });

  it("Shows the bug report submission form", () => {
    const bugReportElement = screen.getByTestId("bugReportRoot");
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
    expect(bugReportDialog).toBeInTheDocument();
    expect(bugReportDialog).toBeVisible();

    const summaryInput = screen.getByTestId("bugReportSummaryInput");
    const detailsInput = screen.getByTestId("bugReportDetailsInput");
    expect(summaryInput).toHaveValue("");
    expect(detailsInput).toHaveValue("");

    // Fields are already empty, just try to submit
    const submitButton = screen.getByTestId("bugReportSubmit");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeVisible();

    await user.click(submitButton);

    expect(summaryInput).toBeInvalid();
    expect(detailsInput).toBeInvalid();
  });

  it("Successfully submits a default bug report", { timeout: 7000 }, async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    expect(bugReportDialog).toBeInTheDocument();
    expect(bugReportDialog).toBeVisible();

    const summaryInput = screen.getByTestId("bugReportSummaryInput");
    const detailsInput = screen.getByTestId("bugReportDetailsInput");
    expect(summaryInput).toHaveValue("");
    expect(detailsInput).toHaveValue("");

    await userEvent.type(summaryInput, "Operations Manager Problem", { pointerEventsCheck: 0 });
    await userEvent.type(detailsInput, "I am experiencing an issue with the Operations Manager web app.", {
      pointerEventsCheck: 0,
    });

    const submitButton = screen.getByTestId("bugReportSubmit");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeVisible();

    await user.click(submitButton);
  });

  it("Successfully submits a bug report with custom information", { timeout: 7000 }, async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    expect(bugReportDialog).toBeInTheDocument();
    expect(bugReportDialog).toBeVisible();

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
  });

  it("Fails to submit a bug report", async () => {
    await cleanup();
    render(
      <BugReportProviderInvalid bugReportDialogOpen={true}>
        <BugReportDialog />
      </BugReportProviderInvalid>
    );
    bugReportDialog = await waitFor<HTMLElement>(() => {
      const element = screen.getByTestId("BugReportDialog");
      return element;
    });

    expect(bugReportDialog).toBeInTheDocument();
    expect(bugReportDialog).toBeVisible();

    const bugReportElement = screen.getByTestId("bugReportRoot");
    expect(bugReportElement).toBeInTheDocument();
    expect(bugReportElement).toBeVisible();

    const user = userEvent.setup({ pointerEventsCheck: 0 });

    const summaryInput = screen.getByTestId("bugReportSummaryInput");
    const detailsInput = screen.getByTestId("bugReportDetailsInput");
    expect(summaryInput).toHaveValue("");
    expect(detailsInput).toHaveValue("");

    await userEvent.type(summaryInput, "Test Problem", { pointerEventsCheck: 0 });
    await userEvent.type(detailsInput, "Test Description", { pointerEventsCheck: 0 });

    const submitButton = screen.getByTestId("bugReportSubmit");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeVisible();

    await user.click(submitButton);
  });
});
