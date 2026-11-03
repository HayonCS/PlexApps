import { RecentMemoryMap } from "modules/graphql-api/server-types.gen";
import * as React from "react";
import { useGetRecentMemoryMapsQuery } from "../graphql/types.gen";

export type GetRecentMemoryMapsHookResponseType = "ERROR" | "LOADING" | RecentMemoryMap[];

export const useGetRecentMemoryMaps = (userName: string): GetRecentMemoryMapsHookResponseType => {
  const [recentMemoryMaps, setRecentMemoryMaps] = React.useState<GetRecentMemoryMapsHookResponseType>("LOADING");

  const query = useGetRecentMemoryMapsQuery({
    variables: { userName: userName },
    skip: userName === "unknown",
    fetchPolicy: "cache-and-network",
  });

  React.useEffect(() => {
    if (query.called && !query.loading) {
      if (query.data) {
        if (query.data.getRecentMemoryMaps) {
          setRecentMemoryMaps(query.data.getRecentMemoryMaps.recentMemoryMaps);
        }
      }

      if (query.error) {
        setRecentMemoryMaps("ERROR");
      }
    } else if (query.loading) {
      setRecentMemoryMaps("LOADING");
    }
  }, [query]);

  return recentMemoryMaps;
};
