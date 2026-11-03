/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "../store";
import { ActionType } from "../types";
import { OpsManagerUser } from "modules/helpers/user-information";

export type UncheckedState = {
  type: "Unchecked";
};

export type AuthenticatedState = {
  type: "Authenticated";
  user: OpsManagerUser;
};

export type UnauthenticatedState = {
  type: "Unauthenticated";
};

export type AuthenticatingState = {
  type: "Authenticating";
};

export type AuthenticationErrorState = {
  type: "Error";
  error: string;
};

export type AuthenticationState =
  | UncheckedState
  | AuthenticatedState
  | AuthenticatingState
  | UnauthenticatedState
  | AuthenticationErrorState;

const initialState = {
  type: "Unchecked",
} as AuthenticationState;

export const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    loginError: (state, action) => {
      return {
        type: "Error",
        error: action.payload.error,
      };
    },
    loginPending: (state) => {
      return {
        type: "Authenticating",
      };
    },
    loginSuccessful: (state, action: PayloadAction<OpsManagerUser>) => {
      return {
        type: "Authenticated",
        user: action.payload,
      };
    },
    logout: (state) => {
      return {
        type: "Unauthenticated",
      };
    },
    signout: (state) => {
      return {
        type: "Unauthenticated",
      };
    },
  },
});

export const AuthenticationActions = authenticationSlice.actions;
export type AuthenticationActionsType = ActionType<typeof AuthenticationActions>;

const logoutThunk = createAsyncThunk("logout", () => {
  return "Unauthenticated";
});

export const AuthenticationSelectors = {
  type: (state: State) => state.Authentication.type,
  errorText: (state: State) => (state.Authentication.type === "Error" ? state.Authentication.error : undefined),
  isNotUnauthenticated: (state: State) =>
    state.Authentication.type !== "Unauthenticated" && state.Authentication.type !== "Error",
  currentUserName: (state: State) => {
    if (state.Authentication.type === "Authenticated") {
      return state.Authentication.user.userName;
    } else {
      return "unknown";
    }
  },
  currentEmployeeNumber: (state: State) =>
    state.Authentication.type === "Authenticated" ? state.Authentication.user.employeeNumber : "unknown",
  currentFormattedName: (state: State) =>
    state.Authentication.type === "Authenticated" ? state.Authentication.user.formattedName : "unknown",
  currentFullName: (state: State) =>
    state.Authentication.type === "Authenticated"
      ? `${state.Authentication.user.firstName} ${state.Authentication.user.lastName}`
      : "unknown",
  currentEmailAddress: (state: State) =>
    state.Authentication.type === "Authenticated" ? state.Authentication.user.emailAddress : "unknown",
  userIsReadOnly: (state: State) =>
    state.Authentication.type === "Authenticated" ? state.Authentication.user.readOnly : true,
};

export default authenticationSlice;
