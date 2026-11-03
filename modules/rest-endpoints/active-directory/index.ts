import * as Hexagonal from "atomic-object/hexagonal";
import { ActiveDirectoryPort } from "./port";
import {
  ADMemberResponse,
  getActiveDirectoryGroupMembers,
  getActiveDirectoryUser,
  getActiveDirectoryUsers,
  GroupType,
  SearchByType,
} from "./active-directory-api";

export type ActiveDirectory = {
  getActiveDirectoryGroupMembers: (
    groupName: string,
    searchBy?: SearchByType | undefined | null,
    groupType?: GroupType | undefined | null,
    recursive?: boolean | undefined | null
  ) => Promise<ADMemberResponse[]>;

  getActiveDirectoryUsers: (searchString: string) => Promise<ADMemberResponse[]>;
  getActiveDirectoryUser: (searchString: string) => Promise<ADMemberResponse>;
};

export const activeDirectoryAdapter = Hexagonal.adapter({
  port: ActiveDirectoryPort,
  requires: [],
  build: () => {
    return {
      getActiveDirectoryGroupMembers: async (
        groupName: string,
        searchBy?: SearchByType | undefined | null,
        groupType?: GroupType | undefined | null,
        recursive?: boolean | undefined | null
      ) => {
        return await getActiveDirectoryGroupMembers(groupName, searchBy, groupType, recursive);
      },
      getActiveDirectoryUsers: async (searchString: string) => {
        return await getActiveDirectoryUsers(searchString);
      },
      getActiveDirectoryUser: async (searchString: string) => {
        return await getActiveDirectoryUser(searchString);
      },
    };
  },
});
