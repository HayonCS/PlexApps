import * as React from "react";
import { useIsWorkingCopyMemoryMapQuery } from "../graphql/types.gen";

export type IsMemoryMapWorkingCopyHookResponseType = "ERROR" | "LOADING" | boolean;

export const useIsWorkingCopyMemoryMap = (
  memoryMapName: string,
  bomRevision: string,
  version: number
): IsMemoryMapWorkingCopyHookResponseType => {
  const [isWorkingCopy, setIsWorkingCopy] = React.useState<IsMemoryMapWorkingCopyHookResponseType>("LOADING");

  const query = useIsWorkingCopyMemoryMapQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      memoryMapName: memoryMapName,
      bomRevision: bomRevision,
      version: version,
    },
  });

  React.useEffect(() => {
    if (query.called && !query.loading) {
      if (query.data) {
        if (query.data.isWorkingCopyMemoryMap) {
          setIsWorkingCopy(query.data.isWorkingCopyMemoryMap);
        }
      }

      if (query.error) {
        setIsWorkingCopy("ERROR");
      }
    } else if (query.loading) {
      setIsWorkingCopy("LOADING");
    }
  }, [query]);

  return isWorkingCopy;
};
