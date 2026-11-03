import * as React from "react";
import { ChangeLogDialog } from "./ChangeLogDialog";
import { Button } from "@mui/material";
import { configureStore } from "@reduxjs/toolkit";
import { Provider, useDispatch } from "react-redux";
import { createRootReducer } from "modules/client/redux/store";
import { Actions } from "modules/client/redux/actions";

const mockChangelogContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# 0.0.1 - 2024-09-10

## Fixed

- Fixed critical bug in memory map loading.
- Resolved issue with commandset parsing.

## Changed

- Initial commit of the baseline template for new apps. This will be the starting point for OpsManager.
- Updated UI components to use Material-UI v7.

## Added

- Added new user settings feature.
- Added changelog dialog component.
`;

const createStore = (changelogDialogOpen: boolean = false) =>
  configureStore({
    reducer: createRootReducer(),
    preloadedState: {
      NavigationDrawer: {
        drawerOpen: false,
        bugReportDialogOpen: false,
        changelogDialogOpen,
      },
    },
  });

export default {
  component: ChangeLogDialog,
  title: "Common/ChangeLogDialog",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "A dialog component that displays the application changelog fetched from CHANGELOG.md file.",
      },
    },
  },
};

const ChangeLogButton = ({ label = "Open Changelog" }: { label?: string }) => {
  const dispatch = useDispatch();
  return (
    <Button variant="contained" onClick={() => dispatch(Actions.NavigationDrawerActions.setChangelogDialogOpen(true))}>
      {label}
    </Button>
  );
};

const DefaultRender = () => {
  const store = React.useMemo(() => createStore(false), []);

  // Mock fetch for storybook
  React.useEffect(() => {
    const originalFetch = global.fetch;
    global.fetch = ((url: string) => {
      if (url === "/CHANGELOG.md") {
        return Promise.resolve({
          text: () => Promise.resolve(mockChangelogContent),
        } as Response);
      }
      return originalFetch(url);
    }) as any;

    return () => {
      global.fetch = originalFetch;
    };
  }, []);

  return (
    <Provider store={store}>
      <div style={{ padding: "20px" }}>
        <ChangeLogButton />
        <ChangeLogDialog />
      </div>
    </Provider>
  );
};

export const Default = {
  render: DefaultRender,
};

const OpenRender = () => {
  const store = React.useMemo(() => createStore(true), []);

  // Mock fetch for storybook
  React.useEffect(() => {
    const originalFetch = global.fetch;
    global.fetch = ((url: string) => {
      if (url === "/CHANGELOG.md") {
        return Promise.resolve({
          text: () => Promise.resolve(mockChangelogContent),
        } as Response);
      }
      return originalFetch(url);
    }) as any;

    return () => {
      global.fetch = originalFetch;
    };
  }, []);

  return (
    <Provider store={store}>
      <div style={{ padding: "20px" }}>
        <ChangeLogButton />
        <ChangeLogDialog />
      </div>
    </Provider>
  );
};

export const Open = {
  render: OpenRender,
};

const LoadingStateRender = () => {
  const store = React.useMemo(() => createStore(true), []);

  // Mock slow fetch to show loading state
  React.useEffect(() => {
    const originalFetch = global.fetch;
    global.fetch = ((url: string) => {
      if (url === "/CHANGELOG.md") {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              text: () => Promise.resolve(mockChangelogContent),
            } as Response);
          }, Infinity);
        });
      }
      return originalFetch(url);
    }) as any;

    return () => {
      global.fetch = originalFetch;
    };
  }, []);

  return (
    <Provider store={store}>
      <div style={{ padding: "20px" }}>
        <ChangeLogButton label="Open Changelog (Loading State)" />
        <ChangeLogDialog />
      </div>
    </Provider>
  );
};

export const LoadingState = {
  render: LoadingStateRender,
  parameters: {
    docs: {
      description: {
        story: "Shows the loading state with skeleton placeholders (5 second delay).",
      },
    },
  },
};

const ErrorStateRender = () => {
  const store = React.useMemo(() => createStore(true), []);

  // Mock failed fetch
  React.useEffect(() => {
    const originalFetch = global.fetch;
    global.fetch = ((url: string) => {
      if (url === "/CHANGELOG.md") {
        return Promise.reject(new Error("Failed to load changelog"));
      }
      return originalFetch(url);
    }) as any;

    return () => {
      global.fetch = originalFetch;
    };
  }, []);

  return (
    <Provider store={store}>
      <div style={{ padding: "20px" }}>
        <ChangeLogButton label="Open Changelog (Error State)" />
        <ChangeLogDialog />
      </div>
    </Provider>
  );
};

export const ErrorState = {
  render: ErrorStateRender,
  parameters: {
    docs: {
      description: {
        story: "Shows the error state when changelog fails to load.",
      },
    },
  },
};

const NoVersionFoundRender = () => {
  const store = React.useMemo(() => createStore(true), []);

  // Mock changelog without version
  React.useEffect(() => {
    const originalFetch = global.fetch;
    global.fetch = ((url: string) => {
      if (url === "/CHANGELOG.md") {
        return Promise.resolve({
          text: () => Promise.resolve("# Changelog\n\nAll notable changes...\n\nSome content without version number."),
        } as Response);
      }
      return originalFetch(url);
    }) as any;

    return () => {
      global.fetch = originalFetch;
    };
  }, []);

  return (
    <Provider store={store}>
      <div style={{ padding: "20px" }}>
        <ChangeLogButton label="Open Changelog (No Version)" />
        <ChangeLogDialog />
      </div>
    </Provider>
  );
};

export const NoVersionFound = {
  render: NoVersionFoundRender,
  parameters: {
    docs: {
      description: {
        story: "Shows 'Unknown' version when version number cannot be extracted from changelog.",
      },
    },
  },
};
