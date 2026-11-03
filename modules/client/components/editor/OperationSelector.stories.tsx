import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import OperationSelector from "./OperationSelector";

const StorybookProvider = mockProvider({
  logMissingMocks: true,
});

export default {
  component: OperationSelector,
  title: "Editor/OperationSelector",
  tags: ["autodocs"],
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <div style={{ width: "150px" }}>
            <Story />
          </div>
        </StorybookProvider>
      );
    },
  ],
};

export const Default = {
  parameters: {},
};
