import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import MemoryMapGrid from "./MemoryMapGrid";
import MEMORYMAP_FOR_TESTING from "modules/client/test-helpers/memorymap";
import { GetMemoryMapQuery } from "modules/client/test-helpers/mocks/memorymap-library-mocks";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: {
    Authentication: {
      type: "Authenticated",
      user: {
        readOnly: false,
        userName: "bill.brasky",
        distinguishedName: "CN=Brasky\\, Bill,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
        principalName: "bill.brasky@gentex.com",
        employeeNumber: 69,
        firstName: "Bill",
        lastName: "Brasky",
        formattedName: "Brasky, Bill",
        department: "Test and Measurement",
        emailAddress: "bill.brasky@gentex.com",
        mobilePhone: "9895684589",
        gentexPhone: "+1 (616) 7721590 x2345",
        sid: "S-1-5-21-56231545-804616388-477645130-30460",
        pager: "19992",
        manager: "CN=Meyer\\, Oscar,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
      },
    },
    Editor: {
      past: [],
      present: {
        memoryMap: MEMORYMAP_FOR_TESTING,
        pristineMemoryMap: MEMORYMAP_FOR_TESTING,
        displayFormat: "DECIMAL",
        commandSet: null,
        readOnly: false,
      },
      future: [],
    },
  },
});
const StorybookProvider = mockProvider({
  reduxStore: store,
  logMissingMocks: true,
});

export default {
  component: MemoryMapGrid,
  title: "Editor/MemoryMapGrid",
  tags: ["autodocs"],
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <div style={{ width: "80%", height: "80%", position: "absolute" }}>
            <Story />
          </div>
        </StorybookProvider>
      );
    },
  ],
};

export const Default = {};

export const Loading = {
  parameters: {
    apolloClient: {
      mocks: [
        {
          delay: Infinity,
          request: {
            query: GetMemoryMapQuery,
          },
        },
      ],
    },
  },
};

export const HorizontalScrolling = {
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <div style={{ width: "600px", height: "80%", position: "absolute", border: "2px solid #ccc" }}>
            <Story />
          </div>
        </StorybookProvider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates horizontal scrolling when the grid is in a narrow container. The grid has columns with minimum widths to ensure proper scrolling behavior.",
      },
    },
  },
};

export const VerticalScrolling = {
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <div style={{ width: "80%", height: "400px", position: "absolute", border: "2px solid #ccc" }}>
            <Story />
          </div>
        </StorybookProvider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates vertical scrolling when the grid is in a short container. The grid uses virtualization with a 500px row buffer for optimal performance.",
      },
    },
  },
};

export const NarrowContainer = {
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <div style={{ width: "400px", height: "300px", position: "absolute", border: "2px solid #ccc" }}>
            <Story />
          </div>
        </StorybookProvider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Shows both horizontal and vertical scrolling in a small container. This demonstrates how the grid handles constrained spaces with the scrollbarSize property set to 17px.",
      },
    },
  },
};
