import { gql } from "@apollo/client";
import MEMORYMAP_FOR_TESTING from "../memorymap";

export const GetAllMemoryMapsQuery = gql`
  query GetAllMemoryMaps {
    getAllMemoryMaps
  }
`;

export const GetMemoryMapQuery = gql`
  query GetMemoryMap($memoryMapName: String!, $bomRevision: String!, $version: Int!) {
    getMemoryMap(memoryMapName: $memoryMapName, bomRevision: $bomRevision, version: $version) {
      name
      concurrencyToken
      bomRevision
      version
      commandset
      commands
      testers
      partNumbers
    }
  }
`;

export const MemoryMapLibraryMocks = [
  {
    request: {
      query: GetAllMemoryMapsQuery,
    },
    result: {
      data: {
        getAllMemoryMaps: [
          {
            PartNumber: "305-0014-000",
            Description: "MEMORY MAP, LGT3/CMP3/TMP/HL3 DDG GMR",
            BOMRevision: "001",
            InternalRevision: 1,
            ID: 2631,
            FirmwareID: 0,
            CommandSetID: 631,
            IsWorkingCopy: true,
            AncestorID: 0,
          },
          {
            PartNumber: "305-0191-002",
            Description: "MEMORY MAP, EC+RCD PIC 1-BTN PRNDL TMC",
            BOMRevision: "A  ",
            InternalRevision: 1,
            ID: 310,
            FirmwareID: 31,
            CommandSetID: 114,
            IsWorkingCopy: false,
            AncestorID: 0,
          },
          {
            PartNumber: "305-0191-002",
            Description: "MEMORY MAP, EC+RCD PIC 1-BTN PRNDL TMC",
            BOMRevision: "A  ",
            InternalRevision: 2,
            ID: 311,
            FirmwareID: 31,
            CommandSetID: 114,
            IsWorkingCopy: true,
            AncestorID: 0,
          },
          {
            PartNumber: "305-0195-000",
            Description: "test1234",
            BOMRevision: "BBB",
            InternalRevision: 4,
            ID: 20536,
            FirmwareID: null,
            IsWorkingCopy: true,
            CommandSetID: 3332,
            AncestorID: 20297,
          },
        ],
      },
    },
  },
  {
    request: {
      query: GetMemoryMapQuery,
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
