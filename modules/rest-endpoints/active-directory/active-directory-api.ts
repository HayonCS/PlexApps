import config from "config";
import { GraphQLError } from "graphql";

export type ADMemberResponse = {
  distinguishedName: string;
  principalName: string;
  accountName: string;
  employeeId: string;
  givenName: string;
  surname: string;
  name: string;
  department: string;
  email: string;
  mobilePhone: string;
  phone: string;
  website: string | null;
  azureADObjectId: string;
  objectId: string;
  sid: string;
  pager: string;
  manager: string;
};

export type SearchByType = "Name" | "DistinguishedName" | "ObjectId" | "Sid";
export type GroupType = "SecurityGroup" | "DistributionList";

export const getActiveDirectoryGroupMembers = async (
  groupName: string,
  searchBy?: SearchByType | null,
  groupType?: GroupType | null,
  recursive?: boolean | null
): Promise<ADMemberResponse[]> => {
  const url = config.get<string>("restApi.mesActiveDirectoryEndpoint");
  const params = new URLSearchParams();

  if (searchBy && searchBy !== undefined) {
    params.append("searchBy", searchBy);
  }

  if (groupType && groupType !== undefined) {
    params.append("groupType", groupType);
  }

  if (recursive !== null && recursive !== undefined) {
    params.append("recursive", recursive === true ? "true" : "false");
  }

  const query = `${url}groups/${groupName}/users?${params.toString()}`;

  return fetch(query, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then(async (response) => {
      return await response.json();
    })
    .catch((error: any) => {
      return new GraphQLError(`An error occurred while querying the active directory api. ${error}`);
    });
};

export const getActiveDirectoryUsers = async (searchString: string): Promise<ADMemberResponse[]> => {
  const url = config.get<string>("restApi.mesActiveDirectoryEndpoint");
  const params = new URLSearchParams({ search: searchString });
  const query = `${url}users?${params.toString()}`;

  return fetch(query, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then(async (response) => {
      return await response.json();
    })
    .catch((error: GraphQLError) => {
      return new GraphQLError(`An error occurred while querying the active directory api. ${error}`);
    });
};

export const getActiveDirectoryUser = async (searchString: string): Promise<ADMemberResponse> => {
  const url = config.get<string>("restApi.mesActiveDirectoryEndpoint");
  const query = `${url}users/${searchString}`;

  return fetch(query, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then(async (response) => {
      return await response.json();
    })
    .catch((error: GraphQLError) => {
      return new GraphQLError(`An error occurred while querying the active directory api. ${error}`);
    });
};
