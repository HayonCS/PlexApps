import * as React from "react";
import { useGetAllMemoryMapsQuery } from "../graphql/types.gen";
import { MemoryMapsWithWC } from "modules/core/types";

export type GetAllMemoryMapsHookResponseType = "ERROR" | "LOADING" | MemoryMapsWithWC[];

export const useGetAllMemoryMaps = (): GetAllMemoryMapsHookResponseType => {
  const [allMemoryMaps, setMemoryMaps] = React.useState<GetAllMemoryMapsHookResponseType>("LOADING");

  const query = useGetAllMemoryMapsQuery({ fetchPolicy: "cache-and-network" });

  React.useEffect(() => {
    if (query.called && !query.loading) {
      if (query.data) {
        if (query.data.getAllMemoryMaps) {
          const memoryMaps = query.data.getAllMemoryMaps;
          setMemoryMaps(memoryMaps);
        }
      }

      if (query.error) {
        setMemoryMaps("ERROR");
      }
    } else if (query.loading) {
      setMemoryMaps("LOADING");
    }
  }, [query]);

  return allMemoryMaps;
};
