import * as React from "react";
import { useGetCommandSetQuery } from "../graphql/types.gen";
import { CommandSetDocument } from "modules/core/schemas/commandset.gen";

export type GetCommandSetHookResponseType = "ERROR" | "LOADING" | CommandSetDocument;

export const useGetCommandSet = (name: string, revision: number): GetCommandSetHookResponseType => {
  const [commandSet, setCommandSet] = React.useState<GetCommandSetHookResponseType>("LOADING");

  const query = useGetCommandSetQuery({
    variables: { name, revision },
    fetchPolicy: "cache-first",
    skip: name === "" || revision === -1,
  });

  React.useEffect(() => {
    if (query.called && !query.loading) {
      if (query.data) {
        if (query.data.getCommandSet) {
          setCommandSet(query.data.getCommandSet);
        }
      }

      if (query.error) {
        setCommandSet("ERROR");
      }
    } else if (query.loading) {
      setCommandSet("LOADING");
    }
  }, [query]);

  return commandSet;
};
