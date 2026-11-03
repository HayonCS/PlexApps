import { ApolloCache } from "@apollo/client";

export interface ClientContext {
  cache: ApolloCache<any>;
}
