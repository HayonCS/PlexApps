import * as Hexagonal from "atomic-object/hexagonal";
import * as apollo from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";
import { ApolloClientPort } from "./ports";
import { ClientSideResolvers } from "client/graphql/resolvers";
import { executableSchema } from "graphql-api";
import introspectionQueryResultData from "client/graphql/introspection-result.gen.json";

export const ApolloClientStatePort = Hexagonal.port<unknown, "apollo client state">("apollo client state");

export const apolloClientAdapter = Hexagonal.adapter({
  port: ApolloClientPort,
  requires: [ApolloClientStatePort],
  build: (ctx) => {
    const apolloCache = new apollo.InMemoryCache({
      possibleTypes: introspectionQueryResultData.possibleTypes,
    });
    const apolloClient = new apollo.ApolloClient({
      ssrMode: true,
      cache: apolloCache,
      devtools: {
        enabled: true,
        name: "Apollo Client",
      },
      link: apollo.ApolloLink.from([
        new SchemaLink({
          schema: executableSchema,
          context: ctx,
        }),
      ]),
      resolvers: ClientSideResolvers as any,
    });
    return apolloClient;
  },
});
