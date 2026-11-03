import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { PlaceholderCard } from "./PlaceholderCard";

const StorybookProvider = mockProvider({});

export default {
  component: PlaceholderCard,

  title: "Dashboard/PlaceholderCard",
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
  args: {},
};
