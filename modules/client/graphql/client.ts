import {
  ApolloClient,
  ApolloLink,
  defaultDataIdFromObject,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { History } from "history";
import { buildErrorLink } from "./error-link";
import { authLink } from "./auth-link";
import { AnyAction, Store } from "@reduxjs/toolkit";
// import { Actions } from "client/redux/actions";
import introspectionQueryResultData from "client/graphql/introspection-result.gen.json";

export function buildGraphqlClient(
  store: Store<any, AnyAction>,
  history: History
): ApolloClient<NormalizedCacheObject> {
  const cache = new InMemoryCache({
    resultCaching: true,
    possibleTypes: introspectionQueryResultData.possibleTypes,
    dataIdFromObject: (object) => {
      switch (object.__typename) {
        case "SavedUserRecord":
          return `SavedUserRecord:${(object as any).Domain}:${(object as any).Name}`;
        default:
          return defaultDataIdFromObject(object);
      }
    },
  });

  const responseLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((response: any) => {
      if (!response.errors) {
        // store.dispatch(Actions.Editor.setLockNetworkError(false));
      }
      return response;
    });
  });

  const errorLink = buildErrorLink(history);
  // cache.writeData({ data: DEFAULTS });
  return new ApolloClient({
    cache: cache,
    assumeImmutableResults: true,
    devtools: {
      name: "ApolloClient",
      enabled: true,
    },
    link: ApolloLink.from([
      errorLink,
      responseLink,
      authLink,
      new HttpLink({
        uri: "/graphql",
        credentials: "same-origin",
        // credentials: ""
      }),
    ]),
    defaultOptions: {
      watchQuery: {
        // this governs the default fetchPolicy for react-apollo-hooks' useQuery():
        // https://medium.com/@galen.corey/understanding-apollo-fetch-policies-705b5ad71980
        fetchPolicy: "cache-and-network",
      },
    },
  });
}
