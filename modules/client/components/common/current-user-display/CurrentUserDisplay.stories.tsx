import { CurrentUserDisplay } from "./CurrentUserDisplay";
import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import {
  ActiveDirectoryMocks,
  GetActiveDirectoryUserQuery,
} from "modules/client/test-helpers/mocks/active-directory-mocks";
import { EmployeePictureMocks } from "modules/client/test-helpers/mocks/employee-picture-mocks";

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
});

export default {
  component: CurrentUserDisplay,
  title: "Common/CurrentUserDisplay",
  tags: ["autodocs"],

  args: {
    userName: "bill.brasky",
  } as React.ComponentProps<typeof CurrentUserDisplay>,
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <div style={{ display: "inline-block" }}>
            <Story />
          </div>
        </StorybookProvider>
      );
    },
  ],
};

export const Default = {
  args: {},
  parameters: {
    apolloClient: {
      mocks: [...ActiveDirectoryMocks, ...EmployeePictureMocks],
    },
  },
};

export const Loading = {
  parameters: {
    apolloClient: {
      mocks: [
        {
          delay: Infinity,
          request: {
            query: GetActiveDirectoryUserQuery,
          },
          result: {
            data: {},
          },
        },
      ],
    },
  },
};
