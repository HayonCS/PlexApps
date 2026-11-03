import * as React from "react";
import * as _ from "lodash-es";
import * as uuid from "uuid";
import { ApolloClient, ApolloProvider, getApolloContext, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import { makeExecutableSchema, mergeSchemas } from "@graphql-tools/schema";
import { GraphQLResolveInfo, ResponsePath } from "graphql";
import { SchemaMap } from "modules/graphql-api";
import { addMocksToSchema, IMockFn, MockList } from "@graphql-tools/mock";
import { SchemaLink } from "@apollo/client/link/schema";
import { rawSchema } from "modules/graphql-api/schema-base";
import { createMemoryRouter, MemoryRouter, MemoryRouterProps, Route, RouterProvider, Routes } from "react-router";
import { configureStore, Store } from "@reduxjs/toolkit";
import { createRootReducer, State } from "../redux/store";
import { mapValues as _mapValues } from "lodash-es";
import { StylesProvider } from "@mui/styles";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { AppTheme } from "../styles/mui-theme";
import * as introspectionData from "client/graphql/introspection-result.gen.json";
import { LicenseInfo } from "@mui/x-license";

type DeepPartial<T> = {
  [P in keyof T]?: ThingOrLambdaToThing<MockDefinitions<T[P]>>;
};

type ArrayOfPartial<T extends object[]> = MockDefinitions<T[number]>[];

type ArrayOrObj<X> = X extends object[]
  ? ThingOrLambdaToThing<ArrayOfPartial<X>>
  : ThingOrLambdaToThing<DeepPartial<X>>;

type MockDefinitions<T> = { [K in keyof T]?: ArrayOrObj<T[K]> | MockList };

type ThingOrLambdaToThing<X> = X | ((root: any, args: any, context: any, info: GraphQLResolveInfo) => X);

/** Generate a mock apollo client with a defined set of mocks. If you need to mock a new composite graphql type, update the SchemaMap in the graphql module. */
export function mockClient(mocks: MockDefinitions<SchemaMap>): ApolloClient<NormalizedCacheObject> {
  let serverSchema = makeExecutableSchema({
    typeDefs: rawSchema,
    resolverValidationOptions: { requireResolversForResolveType: "ignore", requireResolversForAllFields: "ignore" },
  });

  serverSchema = addMocksToSchema({
    schema: serverSchema,
    mocks: mocks,
  });

  let clientSchema = makeExecutableSchema({
    typeDefs: rawSchema,
    resolverValidationOptions: { requireResolversForResolveType: "ignore", requireResolversForAllFields: "ignore" },
  });

  clientSchema = addMocksToSchema({
    schema: clientSchema,
    mocks: mocks,
  });

  const exSchema = mergeSchemas({
    schemas: [serverSchema, clientSchema],
  });

  const client = new ApolloClient({
    devtools: {
      enabled: true,
    },
    cache: new InMemoryCache({
      possibleTypes: introspectionData.possibleTypes,
    }),
    link: new SchemaLink({
      schema: exSchema,
    }),

    defaultOptions: {
      watchQuery: {
        // this governs the default fetchPolicy for react-apollo-hooks' useQuery():
        // https://medium.com/@galen.corey/understanding-apollo-fetch-policies-705b5ad71980
        fetchPolicy: "cache-and-network",
      },
    },
  });
  return client;
}

export type URLOverride = {
  //! The customized route, this is the same encoding as the protected
  //! route for the page.
  route: string;

  //! The url that is being visited.
  url: string;
};

export interface MockProviderOpts {
  additionalRoutes?: { path: string; component: React.ReactNode }[];

  initialHistoryStack?: string | string[];

  /** Definition of graphql mocks for mock client */
  mocks?: MockDefinitions<SchemaMap>;

  memoryRouterProps?: MemoryRouterProps;

  /** Use production-compatible routing for components with data-router hooks such as useBlocker. */
  dataRouter?: boolean;

  /** Override and Console.warn about missing fields in your mocks */
  logMissingMocks?: boolean;

  /** Optionally set up the initial state with an internal redux store. Not needed if you are passing in reduxStore.*/
  initialState?: Partial<State>;

  /** Optionally pass in your own store. */
  reduxStore?: Store<State>;

  /** The URL override */
  urlOverride?: URLOverride | undefined;

  /** Simulate the panel width*/
  inPanel?: boolean;
}

/*
  If you leave some fields out of your mocks, graphql-tools
  will mock them for you with some simple defaults.
  There's not currently a good way to disable it:
  https://github.com/apollographql/graphql-tools/issues/618

  So, for now, if you'd like to know when you missed something,
  supply logMissingMocks:true.

  The mechanism we're using for this logging is to override the
  default mocks. I haven't found a good way to call into the
  underlying default mocks, so I've pasted "defaultMockMap"
  from the graphql-tools source. Sorry.

  https://github.com/apollographql/graphql-tools/blob/5c5418cec88f1d5520eccc1d2e6dfaa511547e4d/src/mock.ts#L85
*/

const defaultMockMap: Map<string, IMockFn> = new Map();
defaultMockMap.set("Int", () => Math.round(Math.random() * 200) - 100);
defaultMockMap.set("Float", () => Math.random() * 200 - 100);
defaultMockMap.set("String", () => "1.2.3");
defaultMockMap.set("Boolean", () => Math.random() > 0.5);
defaultMockMap.set("ID", () => uuid.v4());

type PrimitiveMockTypes = {
  Boolean: boolean;
  Int: number;
  Float: number;
  String: string;
  ID: string;
};

type CustomMockTypes = {
  Job: string;
};

const defaultPrimitiveMocks: MockDefinitions<PrimitiveMockTypes> = {
  Boolean: () => (defaultMockMap.get("Boolean") as any)(),
  Int: () => (defaultMockMap.get("Int") as any)(),
  Float: () => (defaultMockMap.get("Float") as any)(),
  String: () => (defaultMockMap.get("String") as any)(),
  ID: () => (defaultMockMap.get("ID") as any)(),
};

const mocksForCustomTypes: MockDefinitions<CustomMockTypes> = {
  Job: () => "job mock",
};

//more-specifically typed wrapper for lodash mapValues:
function mapValues<TIn, TOut>(obj: TIn, fn: (t: TIn) => TOut): { [K in keyof TIn]: TOut } {
  return _mapValues(obj as any, fn) as any;
}

const allMocks = { ...defaultPrimitiveMocks, ...mocksForCustomTypes };

function readPath(path: ResponsePath): (string | number)[] {
  if (path.prev == undefined) {
    return [];
  } else {
    return [path.key].concat(readPath(path.prev));
  }
}

const loggingMocks = mapValues(allMocks, (fn) => {
  return (root: any, args: any, context: any, info: GraphQLResolveInfo) => {
    const ret = (fn as any)(root, args, context, info);
    const path = readPath(info.path).reverse().join(".");
    console.warn(
      `Missing mock on operation "${info.operation.name!.value}".\n` +
        `${info.parentType}.${info.fieldName} (${info.returnType}) at path "${path}"\n` +
        `defaulted to value "${ret}".`
    );
    return ret;
  };
});

const OptionalApolloProvider: React.FC<{
  client: ApolloClient<NormalizedCacheObject>;
  children: React.ReactNode;
}> = ({ client, children }) => {
  const ApolloCtx = getApolloContext();
  const existing = React.useContext(ApolloCtx);
  if (existing?.client) {
    return <>{children}</>;
  }
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export function mockProvider(opts?: MockProviderOpts) {
  if (!opts) {
    opts = {};
  }
  const defaultMocks = opts.logMissingMocks ? loggingMocks : mocksForCustomTypes;

  const defaultEmptyMock = {
    Query: () => ({}),
  };

  let maybeMocks = opts.mocks || {};

  if (_.isEmpty(maybeMocks)) {
    maybeMocks = defaultEmptyMock;
  }

  let mocks = { ...defaultMocks, ...maybeMocks };

  const apolloClient = mockClient(mocks);

  const initialHistoryStack = (() => {
    if (opts.urlOverride !== undefined) {
      return opts.urlOverride.url;
    }

    if (opts?.initialHistoryStack) {
      return opts.initialHistoryStack;
    }

    return "/";
  })();

  const initialRouterPath = (() => {
    if (opts.urlOverride !== undefined) {
      return opts.urlOverride.route;
    }

    if (opts?.initialHistoryStack) {
      return "/:memoryMapName?/:bomRevision?/:version?";
    }

    return "/";
  })();

  const store = opts.reduxStore || configureStore({ reducer: createRootReducer() });

  const cng = (rule: any) => {
    return `component-${rule.key}`;
  };

  const CustomStylesProvider: React.FC<{
    inPanel?: boolean;
    children: React.ReactNode;
  }> = (props) => {
    return `${process.env.STORYBOOK_MODE}` === "true" ? (
      props.inPanel ? (
        <StylesProvider>
          <div>{props.children}</div>
        </StylesProvider>
      ) : (
        <StylesProvider>{props.children}</StylesProvider>
      )
    ) : (
      <StylesProvider generateClassName={cng}>{props.children}</StylesProvider>
    );
  };

  const MockProvider = (props: any) => {
    const [router] = React.useState(() =>
      opts.dataRouter
        ? createMemoryRouter(
            [
              { path: initialRouterPath, element: props.children },
              ...(opts.additionalRoutes ?? []).map((route) => ({ path: route.path, element: route.component })),
            ],
            {
              initialEntries: typeof initialHistoryStack === "string" ? [initialHistoryStack] : initialHistoryStack,
              initialIndex: 0,
            }
          )
        : null
    );
    const licenseKey = `${process.env.DATA_GRID_LICENSE_KEY ?? ""}`;
    LicenseInfo.setLicenseKey(licenseKey);
    return (
      <OptionalApolloProvider client={apolloClient}>
        <CssBaseline>
          <ThemeProvider theme={AppTheme}>
            <CustomStylesProvider inPanel={opts?.inPanel}>
              <Provider store={store}>
                {router ? (
                  <RouterProvider router={router} />
                ) : (
                  <MemoryRouter
                    initialEntries={
                      typeof initialHistoryStack === "string" ? [initialHistoryStack] : initialHistoryStack
                    }
                    initialIndex={0}
                  >
                    <Routes>
                      <Route path={initialRouterPath} element={props.children} />
                      {opts.additionalRoutes &&
                        opts.additionalRoutes.map((route) => {
                          return <Route key={route.path} path={route.path} element={route.component}></Route>;
                        })}
                    </Routes>
                  </MemoryRouter>
                )}
              </Provider>
            </CustomStylesProvider>
          </ThemeProvider>
        </CssBaseline>
      </OptionalApolloProvider>
    );
  };

  return MockProvider;
}
