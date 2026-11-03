import * as React from "react";
import { useGetActiveDirectoryUsersQuery } from "../graphql/types.gen";
import { ADMemberResponse } from "modules/rest-endpoints/active-directory/active-directory-api";

export type GetActiveDirectoryUsersHookResponseType = "ERROR" | "LOADING" | ADMemberResponse[];

export const useGetActiveDirectoryUsers = (searchString: string): GetActiveDirectoryUsersHookResponseType => {
  const [activeDirectoryUsers, setActiveDirectoryUsers] =
    React.useState<GetActiveDirectoryUsersHookResponseType>("LOADING");

  const query = useGetActiveDirectoryUsersQuery({
    variables: {
      searchString: searchString,
    },
    skip: searchString === "" || searchString === "unknown",
  });

  React.useEffect(() => {
    if (query.called && !query.loading) {
      if (query.data) {
        if (query.data.getActiveDirectoryUsers) {
          setActiveDirectoryUsers(query.data.getActiveDirectoryUsers);
        }
      }

      if (query.error) {
        setActiveDirectoryUsers("ERROR");
      }
    } else if (query.loading) {
      setActiveDirectoryUsers("LOADING");
    }
  }, [query, searchString]);

  return activeDirectoryUsers;
};
