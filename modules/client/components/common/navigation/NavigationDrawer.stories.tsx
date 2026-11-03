import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { NavigationDrawer } from "./NavigationDrawer";

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
  urlOverride: {
    route: "/dashboard",
    url: "/dashboard",
  },
});

export default {
  component: NavigationDrawer,
  title: "Common/NavigationDrawer",
  tags: ["autodocs"],
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <div style={{ height: "750px" }}>
            <Story />
          </div>
        </StorybookProvider>
      );
    },
  ],
};

export const Default = {
  args: {},
  parameters: {},
};
