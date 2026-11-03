/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppThunk } from "../actions";
import * as AuthRoutes from "client/auth/authentication-routes";
import querystring from "query-string";
import {
  isAnyTypeOfAuthenticationResponse,
  isNotAuthenticatedResponse,
  isValidOpsManagerUser,
} from "modules/core/auth";
import { setAuthToken, getAuthToken, clearAuthToken } from "client/auth";
import { AuthenticationActions } from "../../slices/authentication-slice";
import { jwtDecode } from "jwt-decode";
import { initializeWebSocket, emitAuthenticatedConnection, emitAuthenticatedDisconnect } from "client/websocket-client";

export const checkAuthStatus = (): AppThunk<Promise<void>> => async (dispatch) => {
  const token = getAuthToken();
  if (!token) {
    dispatch(AuthenticationActions.logout());
    return;
  }
  try {
    const user = jwtDecode(token);
    if (!isValidOpsManagerUser(user)) {
      dispatch(logout());
      return;
    }
    const result = await fetch(`${AuthRoutes.CHECK_AUTH}`, {
      method: "get",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (result.status === 401) {
      clearAuthToken();
      dispatch(logout());
    } else {
      initializeWebSocket();
      dispatch(AuthenticationActions.loginSuccessful(user));
      emitAuthenticatedConnection(user.userName);
    }
  } catch (e) {
    dispatch(logout());
  }
};

export const login =
  (username: string): AppThunk =>
  async (dispatch) => {
    dispatch(AuthenticationActions.loginPending());
    const loginQueryString = querystring.stringify({
      username,
    });

    const result = await fetch(`${AuthRoutes.LOGIN}?${loginQueryString}`, {
      method: "post",
      credentials: "include",
    });

    if (result.status === 401 || result.status !== 200) {
      dispatch(AuthenticationActions.loginError("Authentication Failed"));
      return;
    }

    const payload = await result.json();

    if (!isAnyTypeOfAuthenticationResponse(payload)) {
      dispatch(AuthenticationActions.loginError("Bad Response From Server"));
      return;
    }

    if (isNotAuthenticatedResponse(payload)) {
      dispatch(AuthenticationActions.loginError("Authentication Failed"));
      return;
    }

    try {
      const user = jwtDecode(payload.token);
      if (isValidOpsManagerUser(user)) {
        setAuthToken(payload.token);
        initializeWebSocket();
        dispatch(AuthenticationActions.loginSuccessful(user));
        emitAuthenticatedConnection(user.userName);
      } else {
        dispatch(AuthenticationActions.loginError("Parsed token did not contain user"));
      }
    } catch (e) {
      dispatch(AuthenticationActions.loginError("Could not parse authentication token from server"));
    }
  };

export const logout = (): AppThunk => async (dispatch) => {
  emitAuthenticatedDisconnect();
  await fetch(`${AuthRoutes.LOGOUT}`, {
    method: "post",
  });
  clearAuthToken();
  dispatch(AuthenticationActions.logout());
};
