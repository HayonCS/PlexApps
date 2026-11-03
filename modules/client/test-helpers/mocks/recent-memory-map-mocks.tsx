import { gql } from "@apollo/client";
import { RecentMemoryMap } from "modules/graphql-api/server-types.gen";

export const GetRecentMemoryMaps = gql`
  query GetRecentMemoryMaps($userName: String!) {
    getRecentMemoryMaps(userName: $userName) {
      recentMemoryMaps {
        memoryMapName
        bomRevision
        version
        lastAccessed
      }
    }
  }
`;

export const IsWorkingCopyMemoryMap = gql`
  query IsWorkingCopyMemoryMap($memoryMapName: String!, $bomRevision: String!, $version: Int!) {
    isWorkingCopyMemoryMap(memoryMapName: $memoryMapName, bomRevision: $bomRevision, version: $version)
  }
`;

export const RecentMemoryMapMocks = [
  {
    request: {
      query: GetRecentMemoryMaps,
      variables: {
        userName: "bill.brasky",
      },
    },
    result: {
      data: {
        getRecentMemoryMaps: {
          recentMemoryMaps: [
            {
              memoryMapName: "305-0195-000",
              bomRevision: "BBB",
              version: 4,
              __typename: "RecentMemoryMap",
              lastAccessed: "2025-14-11T12:00:00Z",
            },

            {
              memoryMapName: "305-1111-000",
              bomRevision: "AAA",
              version: 2,
              __typename: "RecentMemoryMap",
              lastAccessed: "2025-14-11T3:00:00Z",
            },

            {
              memoryMapName: "305-1234-000",
              bomRevision: "CCC",
              version: 3,
              __typename: "RecentMemoryMap",
              lastAccessed: "2025-14-11T6:00:00Z",
            },
          ] as RecentMemoryMap[],
        },
      },
    },
  },
  {
    request: {
      query: IsWorkingCopyMemoryMap,
      variables: {
        memoryMapName: "305-0195-000",
        bomRevision: "BBB",
        version: 4,
      },
    },
    result: {
      data: {
        isWorkingCopyMemoryMap: true,
      },
    },
  },
  {
    request: {
      query: IsWorkingCopyMemoryMap,
      variables: {
        memoryMapName: "305-1111-000",
        bomRevision: "AAA",
        version: 2,
      },
    },
    result: {
      data: {
        isWorkingCopyMemoryMap: false,
      },
    },
  },
  {
    request: {
      query: IsWorkingCopyMemoryMap,
      variables: {
        memoryMapName: "305-1234-000",
        bomRevision: "CCC",
        version: 3,
      },
    },
    result: {
      data: {
        isWorkingCopyMemoryMap: false,
      },
    },
  },
  {
    request: {
      query: IsWorkingCopyMemoryMap,
      variables: {
        memoryMapName: "305-1234-000",
        bomRevision: "AAA",
        version: 1,
      },
    },
    result: {
      data: {
        isWorkingCopyMemoryMap: false,
      },
    },
  },
];
