import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { BugReport } from "./BugReport";

// Create a mock provider with proper structure
const BugReportMockProvider = mockProvider({
  logMissingMocks: true,
  mocks: {
    Query: () => ({
      getFreshserviceGTMCatalogId: () => 12345,
    }),
  },
});

const BugReportMockProviderError = mockProvider({
  logMissingMocks: true,
  mocks: {
    Query: () => ({
      getFreshserviceGTMCatalogId: () => {
        throw new Error("Failed to fetch catalog ID");
      },
    }),
  },
});

export default {
  component: BugReport,
  title: "Freshservice/BugReport",
  tags: ["autodocs"],
};

// Default story
export const Default = {
  render: () => (
    <BugReportMockProvider>
      <div style={{ width: "450px" }}>
        <BugReport />
      </div>
    </BugReportMockProvider>
  ),
};

// Error state
export const ErrorState = {
  render: () => (
    <BugReportMockProviderError>
      <div style={{ width: "450px" }}>
        <BugReport />
      </div>
    </BugReportMockProviderError>
  ),
};
