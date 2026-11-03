import * as React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "../../store";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import authenticationSlice, {
  AuthenticatedState,
  AuthenticationActions,
  AuthenticationState,
  UncheckedState,
} from "../authentication-slice";
import { Dashboard } from "@mui/icons-material";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: {
    Authentication: {
      type: "Unauthenticated",
    },
  },
});

const userForAuthentication = {
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
};

const AuthenticationSliceProvider = mockProvider({
  reduxStore: store,
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
});

describe("Authentication Slice", () => {
  beforeEach(async () => {
    render(
      <AuthenticationSliceProvider>
        <Dashboard />
      </AuthenticationSliceProvider>
    );
  });

  it("Populates the correct information during a login error.", async () => {
    const authenticationState: UncheckedState = {
      type: "Unchecked",
    };

    const newState = authenticationSlice.reducer(
      authenticationState,
      AuthenticationActions.loginError({ error: "This is a test error." })
    );

    expect(newState).toEqual({ type: "Error", error: "This is a test error." } as AuthenticationState);
  });

  it("Populates the correct information during the login pending state.", async () => {
    const authenticationState: UncheckedState = {
      type: "Unchecked",
    };

    const newState = authenticationSlice.reducer(authenticationState, AuthenticationActions.loginPending());

    expect(newState).toEqual({ type: "Authenticating" } as AuthenticationState);
  });

  it("Populates the correct user information after a user logs in.", async () => {
    const authenticationState: UncheckedState = {
      type: "Unchecked",
    };

    const newState = authenticationSlice.reducer(
      authenticationState,
      AuthenticationActions.loginSuccessful(userForAuthentication)
    );

    expect(newState).toEqual({
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
    } as AuthenticationState);
  });

  it("Clears all of the redux data when a user logs out.", async () => {
    const authenticationState: AuthenticatedState = {
      type: "Authenticated",
      user: userForAuthentication,
    };

    const newState = authenticationSlice.reducer(authenticationState, AuthenticationActions.logout());

    expect(newState).toEqual({
      type: "Unauthenticated",
    } as AuthenticationState);
  });

  it("Clears all of the redux data when a user signs out.", async () => {
    const authenticationState: AuthenticatedState = {
      type: "Authenticated",
      user: userForAuthentication,
    };

    const newState = authenticationSlice.reducer(authenticationState, AuthenticationActions.signout());

    expect(newState).toEqual({
      type: "Unauthenticated",
    } as AuthenticationState);
  });
});
