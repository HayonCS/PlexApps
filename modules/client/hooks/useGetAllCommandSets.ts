import * as React from "react";
import { useGetAllCommandSetsQuery } from "../graphql/types.gen";

export type GetAllCommandSetsHookResponseType = "ERROR" | "LOADING" | string[];

export const useGetAllCommandSets = (): GetAllCommandSetsHookResponseType => {
  const [commandSets, setCommandSets] = React.useState<GetAllCommandSetsHookResponseType>("LOADING");

  const query = useGetAllCommandSetsQuery({ fetchPolicy: "cache-and-network" });

  React.useEffect(() => {
    if (query.called && !query.loading) {
      if (query.data) {
        if (query.data.getAllCommandSets) {
          setCommandSets(query.data.getAllCommandSets);
        }
      }

      if (query.error) {
        setCommandSets("ERROR");
      }
    } else if (query.loading) {
      setCommandSets("LOADING");
    }
  }, [query]);

  return commandSets;
};
