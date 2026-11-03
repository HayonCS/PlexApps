import * as Hexagonal from "atomic-object/hexagonal";
import { MesSecurityPort } from "./port";
import { UserInfoResponse, getUserInfo, getManagerInfo } from "./mes-security-api";
import { UserNameOrEmployeeNumber } from "modules/helpers/user-information";

export type MesSecurity = {
  getUserInfo: (userIdentifier: UserNameOrEmployeeNumber, includeGroupInfo?: boolean) => Promise<UserInfoResponse>;
  managerInfo: (userIdentifier: UserNameOrEmployeeNumber, includeGroupInfo?: boolean) => Promise<UserInfoResponse>;
};

export const mesSecurityAdapter = Hexagonal.adapter({
  port: MesSecurityPort,
  requires: [],
  build: () => {
    return {
      getUserInfo: async (userIdentifier: UserNameOrEmployeeNumber, includeGroupInfo?: boolean) => {
        return await getUserInfo(userIdentifier, includeGroupInfo);
      },
      managerInfo: async (userIdentifier: UserNameOrEmployeeNumber, includeGroupInfo?: boolean) => {
        return await getManagerInfo(userIdentifier, includeGroupInfo);
      },
    };
  },
});
