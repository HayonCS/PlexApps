import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { RecentMemoryMapCard } from "./RecentMemoryMapCard";
import { IsWorkingCopyMemoryMap } from "modules/client/test-helpers/mocks/recent-memory-map-mocks";

const StorybookProvider = mockProvider({});

export default {
  component: RecentMemoryMapCard,

  title: "Dashboard/RecentMemoryMapCard",
  tags: ["autodocs"],
  args: {},
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <Story />
        </StorybookProvider>
      );
    },
  ],
};

export const Default = {
  args: {
    memoryMapName: "305-0123-000",
    bomRevision: "AAA",
    version: 1,
  },

  parameters: {
    apolloClient: {
      mocks: [
        {
          request: {
            query: IsWorkingCopyMemoryMap,
          },
        },
      ],
    },
  },
};
