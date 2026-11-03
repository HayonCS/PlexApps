import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { BugReportDialog } from "./BugReportDialog";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import OpsManagerAppBar from "modules/client/components/common/app-bar/AppBar";
import { EmployeePictureMocks } from "modules/client/test-helpers/mocks/employee-picture-mocks";
import { ActiveDirectoryMocks } from "modules/client/test-helpers/mocks/active-directory-mocks";

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

const StorybookProvider = mockProvider({
  reduxStore: store,
  logMissingMocks: true,
  mocks: {
    Query: () => ({
      getFreshserviceGTMCatalogId: () => 12345,
    }),
    FreshserviceServiceRequest: () => ({
      id: 1,
      subject: "Test Problem",
      description: "Test Description",
      status: 2,
    }),
  },
});

export default {
  component: BugReportDialog,
  title: "Freshservice/BugReportDialog",
  tags: ["autodocs"],
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <Story />
        </StorybookProvider>
      );
    },
  ],
};

export const Default = {
  args: {
    open: false,
  },
  render: (args: any) => (
    <div style={{ width: "100%", minHeight: "300px" }}>
      <OpsManagerAppBar />
      <BugReportDialog {...args} />
    </div>
  ),
  parameters: {
    apolloClient: {
      mocks: [...EmployeePictureMocks, ...ActiveDirectoryMocks],
    },
  },
};

export const Open = {
  args: {
    open: true,
  },
  render: (args: any) => (
    <div style={{ width: "100%", minHeight: "300px" }}>
      <OpsManagerAppBar />
      <BugReportDialog {...args} />
    </div>
  ),
  parameters: {
    apolloClient: {
      mocks: [...EmployeePictureMocks, ...ActiveDirectoryMocks],
    },
  },
};
