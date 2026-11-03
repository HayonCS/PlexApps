import fetch, { Response } from "node-fetch";
import config from "config";
import type { UserInfoResponse, UserNameOrEmployeeNumber } from "modules/helpers/user-information";

async function fetchUserInfo(userIdentifier: UserNameOrEmployeeNumber, includeGroups: boolean): Promise<Response> {
  const userIdentifierString = userIdentifier.toString();
  const searchParams = new URLSearchParams();

  searchParams.append("includeGroups", includeGroups ? "true" : "false");
  searchParams.append("searchBy", typeof userIdentifier === "string" ? "Username" : "EmployeeId");

  const url =
    `${config.get<string>("restApi.mesSecurityEndpoint")}user/${userIdentifierString}?` + searchParams.toString();

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function fetchManagerInfo(userIdentifier: UserNameOrEmployeeNumber, includeGroups: boolean): Promise<Response> {
  const searchParams = new URLSearchParams();
  searchParams.append("includeGroups", includeGroups ? "true" : "false");

  const url = config.get<string>("restApi.mesSecurityEndpoint") + "manager/" + userIdentifier + searchParams.toString();

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function getUserInfo(
  userIdentifier: UserNameOrEmployeeNumber,
  includeGroups?: boolean
): Promise<UserInfoResponse> {
  let includeGroupInfo = false;

  if (includeGroups && includeGroups == true) {
    includeGroupInfo = true;
  }

  const fetchResponse = await fetchUserInfo(userIdentifier, includeGroupInfo);
  const jsonData = await fetchResponse.json();
  return {
    username: jsonData["username"],
    firstName: jsonData["firstName"],
    lastName: jsonData["lastName"],
    employeeId: jsonData["employeeId"],
    emailAddress: jsonData["emailAddress"],
    isServiceAccount: jsonData["isServiceAccount"],
    pager: jsonData["pager"],
    roles: jsonData["roles"],
    distributionLists: jsonData["distributionLists"],
  };
}

export async function getManagerInfo(
  userIdentifier: UserNameOrEmployeeNumber,
  includeGroups?: boolean
): Promise<UserInfoResponse> {
  let includeGroupInfo = false;
  if (includeGroups && includeGroups == true) {
    includeGroupInfo = true;
  }
  const fetchResponse = await fetchManagerInfo(userIdentifier, includeGroupInfo);
  const jsonData = await fetchResponse.json();
  return {
    username: jsonData["username"],
    firstName: jsonData["firstName"],
    lastName: jsonData["lastName"],
    employeeId: jsonData["employeeId"],
    emailAddress: jsonData["emailAddress"],
    isServiceAccount: jsonData["isServiceAccount"],
    pager: jsonData["pager"],
    roles: jsonData["roles"],
    distributionLists: jsonData["distributionLists"],
  };
}
export { UserInfoResponse };
