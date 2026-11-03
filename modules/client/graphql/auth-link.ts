import { getAuthToken } from "client/auth";
import { ApolloLink } from "@apollo/client";

export const authLink = new ApolloLink((operation, forward) => {
  const token = getAuthToken();

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  }));

  return forward(operation);
});
