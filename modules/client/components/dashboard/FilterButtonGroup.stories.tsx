import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { FilterButtonGroup } from "./FilterButtonGroup";

const StorybookProvider = mockProvider({});

export default {
  component: FilterButtonGroup,

  title: "Dashboard/FilterButtonGroup",
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
