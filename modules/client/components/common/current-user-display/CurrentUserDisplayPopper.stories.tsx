import * as React from "react";
import { CurrentUserDisplayPopper } from "./CurrentUserDisplayPopper";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { formatUserPhone } from "modules/client/utilities/user-util";
import { USER_PICTURE_FOR_TESTS } from "modules/client/test-helpers/mocks/employee-picture-mocks";

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
  component: CurrentUserDisplayPopper,
  title: "Common/CurrentUserDisplay/CurrentUserDisplayPopper",
  tags: ["autodocs"],
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <div
            id="current-user-display-bill.brasky"
            style={{
              backgroundColor: "grey",
              display: "inline",
              padding: "10px",
              borderRadius: "1em",
            }}
          >
            Parent Element
          </div>

          <Story />
        </StorybookProvider>
      );
    },
  ],
  args: {
    userName: "bill.brasky",
    fullName: "Bill Brasky",
    phoneNumber: formatUserPhone("+1 (616) 772-1590 x2345"),
    location: "Test and Measurement",
    emailAddress: "bill.brasky@gentex.com",
    employeeNumber: 69,
    userPicture: USER_PICTURE_FOR_TESTS,
    open: true,
    setMouseOver: () => {},
    slimDisplay: false,
  } as React.ComponentProps<typeof CurrentUserDisplayPopper>,
};

export const Default = {
  args: {
    userName: "bill.brasky",
    fullName: "Bill Brasky",
    phoneNumber: formatUserPhone("+1 (616) 772-1590 x2345"),
    location: "Test and Measurement",
    emailAddress: "bill.brasky@gentex.com",
    employeeNumber: 69,
    userPicture: USER_PICTURE_FOR_TESTS,
    open: true,
    setMouseOver: () => {},
    slimDisplay: false,
  } as React.ComponentProps<typeof CurrentUserDisplayPopper>,
};
