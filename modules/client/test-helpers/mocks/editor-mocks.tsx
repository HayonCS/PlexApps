import { GetMemoryMapDocument } from "modules/client/graphql/types.gen";
import MEMORYMAP_FOR_TESTING from "../memorymap";

export const GetMemoryMapQuery = GetMemoryMapDocument;

export const EditorMocks = [
  {
    request: {
      query: GetMemoryMapQuery,
      variables: {
        memoryMapName: "305-0195-000",
        bomRevision: "BBB",
        version: 4,
      },
    },
    result: {
      data: {
        getMemoryMap: {
          ...MEMORYMAP_FOR_TESTING,
        },
      },
    },
  },
];
