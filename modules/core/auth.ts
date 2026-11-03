import { OpsManagerUser, OpsManagerUserAndAppKey } from "modules/helpers/user-information";

export type NotAuthenticatedResponse = {
  auth: false;
};

export type AuthenticatedResponse = {
  auth: true;
  token: string;
};

export type AuthenticationResponse = AuthenticatedResponse | NotAuthenticatedResponse;

export const isAnyTypeOfAuthenticationResponse = (response: any): response is AuthenticationResponse => {
  return isAuthenticatedResponse(response) || isNotAuthenticatedResponse(response);
};

export const isAuthenticatedResponse = (response: any): response is AuthenticatedResponse =>
  "auth" in response &&
  typeof response.auth === "boolean" &&
  response.auth === true &&
  "token" in response &&
  typeof response.token === "string";

export const isNotAuthenticatedResponse = (response: any): response is NotAuthenticatedResponse =>
  "auth" in response && typeof response.auth === "boolean" && response.auth === false;

export const isValidOpsManagerUser = (data: any): data is OpsManagerUser =>
  "distinguishedName" in data &&
  typeof data.distinguishedName === "string" &&
  "principalName" in data &&
  typeof data.principalName === "string" &&
  "userName" in data &&
  typeof data.userName === "string" &&
  "employeeNumber" in data &&
  typeof data.employeeNumber === "number" &&
  "firstName" in data &&
  typeof data.firstName === "string" &&
  "lastName" in data &&
  typeof data.lastName === "string" &&
  "formattedName" in data &&
  typeof data.formattedName === "string" &&
  "department" in data &&
  typeof data.department === "string" &&
  "emailAddress" in data &&
  typeof data.emailAddress === "string" &&
  "mobilePhone" in data &&
  typeof data.mobilePhone === "string" &&
  "gentexPhone" in data &&
  typeof data.gentexPhone === "string" &&
  "sid" in data &&
  typeof data.sid === "string" &&
  "pager" in data &&
  typeof data.pager === "string" &&
  "manager" in data &&
  typeof data.manager === "string" &&
  "readOnly" in data &&
  typeof data.readOnly === "boolean";

export const isValidOpsManagerUserAndAppKey = (data: any): data is OpsManagerUserAndAppKey =>
  "distinguishedName" in data &&
  typeof data.distinguishedName === "string" &&
  "principalName" in data &&
  typeof data.principalName === "string" &&
  "userName" in data &&
  typeof data.userName === "string" &&
  "employeeNumber" in data &&
  typeof data.employeeNumber === "number" &&
  "firstName" in data &&
  typeof data.firstName === "string" &&
  "lastName" in data &&
  typeof data.lastName === "string" &&
  "formattedName" in data &&
  typeof data.formattedName === "string" &&
  "department" in data &&
  typeof data.department === "string" &&
  "emailAddress" in data &&
  typeof data.emailAddress === "string" &&
  "mobilePhone" in data &&
  typeof data.mobilePhone === "string" &&
  "gentexPhone" in data &&
  typeof data.gentexPhone === "string" &&
  "sid" in data &&
  typeof data.sid === "string" &&
  "pager" in data &&
  typeof data.pager === "string" &&
  "manager" in data &&
  typeof data.manager === "string" &&
  "readOnly" in data &&
  typeof data.readOnly === "boolean" &&
  "AppKey" in data &&
  typeof data.AppKey === "string";
