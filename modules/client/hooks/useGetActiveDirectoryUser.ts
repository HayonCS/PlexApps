import * as React from "react";
import { ADMemberResponse } from "modules/rest-endpoints/active-directory/active-directory-api";
import { useGetActiveDirectoryUserQuery } from "../graphql/types.gen";

export type GetActiveDirectoryUserHookResponseType = "ERROR" | "LOADING" | ADMemberResponse;

export const useGetActiveDirectoryUser = (searchString: string): GetActiveDirectoryUserHookResponseType => {
  const [activeDirectoryUser, setActiveDirectoryUser] =
    React.useState<GetActiveDirectoryUserHookResponseType>("LOADING");

  const query = useGetActiveDirectoryUserQuery({
    variables: {
      searchString: searchString,
    },
    skip: searchString === "" || searchString === "unknown",
  });

  React.useEffect(() => {
    if (query.called && !query.loading) {
      if (query.data) {
        if (query.data.getActiveDirectoryUser) {
          setActiveDirectoryUser(query.data.getActiveDirectoryUser);
        }
      }

      if (query.error) {
        setActiveDirectoryUser("ERROR");
      }
    } else if (query.loading) {
      setActiveDirectoryUser("LOADING");
    }
  }, [query, searchString]);

  return activeDirectoryUser;
};
