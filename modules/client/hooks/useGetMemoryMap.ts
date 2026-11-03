import * as React from "react";
import { MemoryMapDocument } from "modules/core/schemas/memory-map.gen";
import { useGetMemoryMapQuery } from "../graphql/types.gen";

export type GetMemoryMapHookResponseType = "ERROR" | "LOADING" | MemoryMapDocument;

export const useGetMemoryMap = (
  memoryMapName: string,
  bomRevision: string,
  version: number
): GetMemoryMapHookResponseType => {
  const [memoryMap, setMemoryMap] = React.useState<GetMemoryMapHookResponseType>("LOADING");

  const query = useGetMemoryMapQuery({
    variables: {
      memoryMapName: memoryMapName,
      bomRevision: bomRevision,
      version: version,
    },
    skip: memoryMapName === "" || bomRevision === "",
    fetchPolicy: "cache-and-network",
  });

  React.useEffect(() => {
    if (query.called && !query.loading) {
      if (query.data) {
        if (query.data.getMemoryMap) {
          const responseData = query.data.getMemoryMap;
          setMemoryMap({
            name: responseData.name,
            bomRevision: responseData.bomRevision,
            version: responseData.version,
            isWorkingCopy: responseData.isWorkingCopy,
            concurrencyToken: responseData.concurrencyToken,
            commandset: responseData.commandset,
            commands: responseData.commands,
            partNumbers: responseData.partNumbers,
            testers: responseData.testers,
          });
        }
      }

      if (query.error || query.data?.getMemoryMap === null) {
        setMemoryMap("ERROR");
      }
    } else if (query.loading) {
      setMemoryMap("LOADING");
    }
  }, [query]);

  return memoryMap;
};
