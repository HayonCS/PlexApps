import * as React from "react";
import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache } from "@apollo/client";
import { Observable } from "@apollo/client/core";
import { configureStore } from "@reduxjs/toolkit";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import { createRootReducer } from "modules/client/redux/store";
import { AppTheme } from "modules/client/styles/mui-theme";
import { NotificationsProvider } from "@toolpad/core";

import { FreshserviceServiceRequest } from "modules/domain-services/freshservice/freshservice";

const MOCK_SERVICE_REQUESTS: FreshserviceServiceRequest[] = [];
type GraphqlMocks = {
  Query?: () => Record<string, any>;
  Mutation?: () => Record<string, any>;
};

function resolveMockValue(resolver: unknown, variables: Record<string, any>, fieldName: string) {
  if (resolver === undefined) {
    throw new Error(`Missing mock resolver for "${fieldName}".`);
  }

  if (typeof resolver === "function") {
    return resolver(undefined, variables);
  }

  return resolver;
}

function createMockLink(mocks: GraphqlMocks) {
  const queryResolvers = (typeof mocks.Query === "function" ? mocks.Query() : mocks.Query) ?? {};
  const mutationResolvers = (typeof mocks.Mutation === "function" ? mocks.Mutation() : mocks.Mutation) ?? {};

  return new ApolloLink((operation) => {
    return new Observable((observer) => {
      try {
        const { operationName, variables } = operation;

        if (operationName === "GetFreshserviceGTMCatalogId") {
          const resolver = queryResolvers.getFreshserviceGTMCatalogId;
          const value = resolveMockValue(resolver, variables ?? {}, "getFreshserviceGTMCatalogId");
          observer.next({ data: { getFreshserviceGTMCatalogId: value } });
          observer.complete();
          return;
        }

        if (operationName === "CreateFreshserviceServiceRequest") {
          const resolver = mutationResolvers.createFreshserviceServiceRequest;
          const value = resolveMockValue(resolver, variables ?? {}, "createFreshserviceServiceRequest");
          observer.next({ data: { createFreshserviceServiceRequest: value } });
          observer.complete();
          return;
        }

        throw new Error(`Unhandled operation "${operationName}" in BugReport mocks.`);
      } catch (error) {
        observer.error(error);
      }
    });
  });
}

function createBugReportProvider(mocks: GraphqlMocks) {
  const Provider: React.FC<{ children: React.ReactNode; userName?: string; bugReportDialogOpen?: boolean }> = ({
    children,
    userName = "patrick.star",
    bugReportDialogOpen = false,
  }) => {
    const clientRef = React.useRef<ApolloClient<any>>();
    const storeRef = React.useRef<ReturnType<typeof configureStore>>();

    if (!clientRef.current) {
      clientRef.current = new ApolloClient({
        cache: new InMemoryCache(),
        link: createMockLink(mocks),
      });
    }

    if (!storeRef.current) {
      storeRef.current = configureStore({
        reducer: createRootReducer(),
        preloadedState: {
          Authentication: {
            type: "Authenticated",
            user: {
              userName,
              employeeNumber: "12345",
              firstName: "Test",
              lastName: "User",
              formattedName: "User, Test",
              isReadOnly: false,
            },
          },
          NavigationDrawer: {
            drawerOpen: false,
            bugReportDialogOpen,
            changelogDialogOpen: false,
          },
        } as any,
      });
    }

    return (
      <ThemeProvider theme={AppTheme}>
        <ReduxProvider store={storeRef.current}>
          <ApolloProvider client={clientRef.current}>
            <NotificationsProvider>{children}</NotificationsProvider>
          </ApolloProvider>
        </ReduxProvider>
      </ThemeProvider>
    );
  };

  return Provider;
}

// Mock user database for resolving requester IDs
const MOCK_USERS = [
  { userId: "patrick.star", requesterId: 69000069420, email: "patrick.star@gentex.com" },
  { userId: "john.smith", requesterId: 69000042069, email: "john.smith@gentex.com" },
  { userId: "bill.brasky", requesterId: 69000096024, email: "bill.brasky@gentex.com" },
];

function createServiceRequest(
  catalogId: number,
  userId: string,
  subject: string,
  description: string
): FreshserviceServiceRequest {
  const lastRequest =
    MOCK_SERVICE_REQUESTS.length > 0 ? MOCK_SERVICE_REQUESTS[MOCK_SERVICE_REQUESTS.length - 1] : undefined;

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  const request: FreshserviceServiceRequest = {
    ccEmails: [],
    fwdEmails: [],
    replyCCEmails: [],
    frEscalated: false,
    spam: false,
    emailConfigId: null,
    groupId: 23000152899,
    priority: 1,
    requesterId: 69000069420,
    responderId: 23000208933,
    source: 2,
    status: 2,
    subject: subject,
    toEmails: [],
    slaPolicyId: 23000088440,
    departmentId: 23000075367,
    id: lastRequest ? lastRequest.id + 1 : 10101,
    type: "Service Request",
    dueBy: endDate.toISOString(),
    frDueBy: endDate.toISOString(),
    isEscalated: false,
    description: `<div>${description}</div>`,
    descriptionText: description,
    customFields: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    urgency: 1,
    impact: 1,
    category: "Business IT",
    subCategory: "GTM Core Software Support",
    itemCategory: null,
    deleted: false,
    approvalStatus: "Not Requested",
    approvalStatusName: "Not Requested",
    attachments: [],
    workspaceId: 2,
    createdBy: 69000069420,
  };

  MOCK_SERVICE_REQUESTS.push(request);
  return request;
}

export const BugReportProviderValid = createBugReportProvider({
  Query: () => ({
    getFreshserviceGTMCatalogId: () => 12345,
  }),
  Mutation: () => ({
    createFreshserviceServiceRequest: (_root: unknown, args: any) => {
      const userId = args?.where?.userId;
      const user = userId ? MOCK_USERS.find((u) => u.userId === userId) : undefined;

      if (!user) {
        throw new Error(`Unable to resolve Freshservice requester for identifier '${userId}'.`);
      }

      const fields = args?.fields || {};
      const summary = fields.summary || fields.subject || "Test Problem";
      const details = fields.details || fields.description || "Test Description";

      return createServiceRequest(args.catalogId, user.userId, summary, details);
    },
  }),
});

export const BugReportProviderInvalid = createBugReportProvider({
  Query: () => ({
    getFreshserviceGTMCatalogId: () => 12345,
  }),
  Mutation: () => ({
    createFreshserviceServiceRequest: () => null,
  }),
});
